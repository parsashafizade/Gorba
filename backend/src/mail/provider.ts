export type EmailMessage = {
  idempotencyKey: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
};

export interface MailProvider {
  send(message: EmailMessage): Promise<void>;
}
