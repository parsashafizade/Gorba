import { describe, expect, it, vi } from 'vitest';
import { ResendMailProvider } from './resend.js';

describe('Resend adapter', () => {
  it('keeps the API key in authorization and forwards provider idempotency', async () => {
    const request = vi.fn().mockResolvedValue({ ok: true });
    const provider = new ResendMailProvider('re_server_secret', request);
    await provider.send({
      idempotencyKey: 'tiny-yes/completion-id',
      from: 'from@example.com',
      to: 'owner@example.com',
      subject: 'Known subject',
      text: 'Known text',
      html: '<p>Known HTML</p>',
    });

    const init = request.mock.calls[0][1] as RequestInit;
    expect(init.headers).toMatchObject({
      authorization: 'Bearer re_server_secret',
      'idempotency-key': 'tiny-yes/completion-id',
    });
    expect(String(init.body)).not.toContain('re_server_secret');
  });
});
