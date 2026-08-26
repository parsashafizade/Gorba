import type { CompletedResult } from '../../../shared/results.js';
import type { EmailNotificationConfig } from '../config.js';
import type { MailProvider } from './provider.js';
import { resultEmail } from './resultEmail.js';

export class ResultNotificationService {
  constructor(
    private readonly config: EmailNotificationConfig,
    private readonly provider: MailProvider | null,
    private readonly report: (message: string, error?: unknown) => void = console.error,
  ) {}

  async notify(
    result: CompletedResult,
    completionId: string,
  ): Promise<'disabled' | 'sent' | 'failed'> {
    if (!this.config.enabled || !this.provider) return 'disabled';

    try {
      await this.provider.send({
        idempotencyKey: `tiny-yes/${completionId}`,
        from: this.config.from,
        to: this.config.to,
        ...resultEmail(result),
      });
      return 'sent';
    } catch (error) {
      this.report('Result email delivery failed.', error);
      return 'failed';
    }
  }
}
