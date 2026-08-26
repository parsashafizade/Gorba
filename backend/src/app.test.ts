import { createServer, type Server } from 'node:http';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CompletedResult } from '../../shared/results.js';
import { createApplicationHandler } from './app.js';

const completion = {
  completionId: '91b9ee63-8875-4dbe-8b74-f645771fa293',
  result: { scenario: 'raise', amount: 'twenty', finalPercentage: 22, timing: 'next' },
};

let server: Server | null = null;

const start = async (
  notify: (result: CompletedResult, completionId: string) => Promise<unknown>,
) => {
  server = createServer(createApplicationHandler({ notifications: { notify } }));
  await new Promise<void>((resolve) => server?.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Test server failed to listen.');
  return `http://127.0.0.1:${address.port}`;
};

afterEach(async () => {
  if (server)
    await new Promise<void>((resolve, reject) =>
      server?.close((error) => (error ? reject(error) : resolve())),
    );
  server = null;
});

describe('result notification endpoint', () => {
  it('accepts a completed known result and sends it once', async () => {
    const notify = vi.fn().mockResolvedValue('sent');
    const origin = await start(notify);
    const send = () =>
      fetch(`${origin}/api/results`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(completion),
      });

    expect((await send()).status).toBe(202);
    expect((await send()).status).toBe(202);
    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith(completion.result, completion.completionId);
  });

  it('rejects arbitrary or incomplete result data', async () => {
    const notify = vi.fn();
    const origin = await start(notify);
    const response = await fetch(`${origin}/api/results`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ...completion,
        result: { ...completion.result, recipient: 'attacker@example.com', html: '<b>hi</b>' },
      }),
    });

    expect(response.status).toBe(400);
    expect(notify).not.toHaveBeenCalled();
  });

  it('still accepts the visitor completion when notification delivery throws', async () => {
    const origin = await start(vi.fn().mockRejectedValue(new Error('mail unavailable')));
    const response = await fetch(`${origin}/api/results`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(completion),
    });
    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({ accepted: true });
  });
});
