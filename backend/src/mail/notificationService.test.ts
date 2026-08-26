import { describe, expect, it, vi } from 'vitest';
import type { MailProvider } from './provider.js';
import { ResultNotificationService } from './notificationService.js';

const result = {
  scenario: 'hire',
  role: 'specialist',
  offer: 'sign',
} as const;

describe('result notification service', () => {
  it('is a safe no-op when notifications are disabled', async () => {
    const provider: MailProvider = { send: vi.fn() };
    const service = new ResultNotificationService({ enabled: false }, provider);

    await expect(service.notify(result, '91b9ee63-8875-4dbe-8b74-f645771fa293')).resolves.toBe(
      'disabled',
    );
    expect(provider.send).not.toHaveBeenCalled();
  });

  it('contains provider failures without exposing them to the caller', async () => {
    const provider: MailProvider = { send: vi.fn().mockRejectedValue(new Error('secret detail')) };
    const report = vi.fn();
    const service = new ResultNotificationService(
      { enabled: true, apiKey: 'server-only', from: 'from@example.com', to: 'to@example.com' },
      provider,
      report,
    );

    await expect(service.notify(result, '91b9ee63-8875-4dbe-8b74-f645771fa293')).resolves.toBe(
      'failed',
    );
    expect(report).toHaveBeenCalledWith('Result email delivery failed.', expect.any(Error));
  });
});
