import { createReadStream, existsSync, statSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import type { CompletedResult } from '../../shared/results.js';
import { CompletionDeduplicator, FixedWindowRateLimiter } from './http/rateLimit.js';
import { parseResultNotificationRequest } from './http/resultRequest.js';

type ApplicationOptions = {
  notifications: { notify(result: CompletedResult, completionId: string): Promise<unknown> };
  staticDirectory?: string;
  rateLimiter?: FixedWindowRateLimiter;
  deduplicator?: CompletionDeduplicator;
};

const json = (response: ServerResponse, status: number, value: object) => {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  response.end(JSON.stringify(value));
};

const clientKey = (request: IncomingMessage) => {
  const forwarded = request.headers['x-forwarded-for'];
  const first = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim();
  return first || request.socket.remoteAddress || 'unknown';
};

const readJson = async (request: IncomingMessage, maximumBytes = 8_192): Promise<unknown> => {
  const contentLength = Number(request.headers['content-length'] ?? 0);
  if (contentLength > maximumBytes) throw new Error('too-large');
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buffer.length;
    if (total > maximumBytes) throw new Error('too-large');
    chunks.push(buffer);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
};

const contentTypes: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
};

const serveFrontend = (
  request: IncomingMessage,
  response: ServerResponse,
  staticDirectory: string,
  pathname: string,
) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') return false;
  const root = resolve(staticDirectory);
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    json(response, 400, { error: 'Invalid request.' });
    return true;
  }
  const requested = resolve(root, `.${decoded}`);
  if (requested !== root && !requested.startsWith(`${root}${sep}`)) {
    json(response, 400, { error: 'Invalid request.' });
    return true;
  }

  const asset =
    existsSync(requested) && statSync(requested).isFile() ? requested : resolve(root, 'index.html');
  if (!existsSync(asset)) return false;
  response.writeHead(200, {
    'content-type': contentTypes[extname(asset)] ?? 'application/octet-stream',
    'x-content-type-options': 'nosniff',
    'content-security-policy':
      "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self'",
  });
  if (request.method === 'HEAD') response.end();
  else createReadStream(asset).pipe(response);
  return true;
};

export const createApplicationHandler = ({
  notifications,
  staticDirectory,
  rateLimiter = new FixedWindowRateLimiter(),
  deduplicator = new CompletionDeduplicator(),
}: ApplicationOptions) => {
  return async (request: IncomingMessage, response: ServerResponse) => {
    const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;

    if (pathname === '/api/health' && request.method === 'GET') {
      json(response, 200, { ok: true });
      return;
    }

    if (pathname === '/api/results') {
      if (request.method !== 'POST') {
        json(response, 405, { error: 'Method not allowed.' });
        return;
      }
      if (!request.headers['content-type']?.toLowerCase().startsWith('application/json')) {
        json(response, 415, { error: 'JSON required.' });
        return;
      }
      if (!rateLimiter.allow(clientKey(request))) {
        json(response, 429, { error: 'Too many requests.' });
        return;
      }

      try {
        const payload = parseResultNotificationRequest(await readJson(request));
        if (!payload) {
          json(response, 400, { error: 'Invalid result.' });
          return;
        }
        if (deduplicator.claim(payload.completionId)) {
          try {
            await notifications.notify(payload.result, payload.completionId);
          } catch {
            // The visitor's completion is successful even when the mail provider is unavailable.
          }
        }
        json(response, 202, { accepted: true });
      } catch {
        json(response, 400, { error: 'Invalid request.' });
      }
      return;
    }

    if (pathname.startsWith('/api/')) {
      json(response, 404, { error: 'Not found.' });
      return;
    }
    if (staticDirectory && serveFrontend(request, response, staticDirectory, pathname)) return;
    json(response, 404, { error: 'Not found.' });
  };
};
