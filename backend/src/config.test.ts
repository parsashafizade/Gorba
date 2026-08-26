import { describe, expect, it, vi } from 'vitest';
import { readEmailNotificationConfig } from './config.js';

describe('email notification configuration', () => {
  it('defaults to disabled with no configuration', () => {
    expect(readEmailNotificationConfig({})).toEqual({ enabled: false });
  });

  it('stays operational and reports missing server-only settings', () => {
    const report = vi.fn();
    expect(readEmailNotificationConfig({ EMAIL_NOTIFICATIONS_ENABLED: 'true' }, report)).toEqual({
      enabled: false,
    });
    expect(report).toHaveBeenCalledWith(expect.stringContaining('RESEND_API_KEY'));
  });

  it('accepts a complete server-only Resend configuration', () => {
    expect(
      readEmailNotificationConfig({
        EMAIL_NOTIFICATIONS_ENABLED: 'true',
        RESEND_API_KEY: 're_server_only',
        EMAIL_FROM: 'Tiny Yes <results@example.com>',
        RESULT_EMAIL_TO: 'owner@example.com',
      }),
    ).toEqual({
      enabled: true,
      apiKey: 're_server_only',
      from: 'Tiny Yes <results@example.com>',
      to: 'owner@example.com',
    });
  });
});
