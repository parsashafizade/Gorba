import type { EmailMessage, MailProvider } from './provider.js';

export class ResendMailProvider implements MailProvider {
  constructor(
    private readonly apiKey: string,
    private readonly request: typeof fetch = fetch,
  ) {}

  async send(message: EmailMessage) {
    const response = await this.request('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        'content-type': 'application/json',
        'idempotency-key': message.idempotencyKey,
      },
      body: JSON.stringify({
        from: message.from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      }),
    });

    if (!response.ok) {
      throw new Error(`Resend rejected the request with status ${response.status}.`);
    }
  }
}
