export type EmailNotificationConfig =
  | { enabled: false }
  | {
      enabled: true;
      apiKey: string;
      from: string;
      to: string;
    };

export const readEmailNotificationConfig = (
  env: NodeJS.ProcessEnv,
  report: (message: string) => void = console.warn,
): EmailNotificationConfig => {
  if (env.EMAIL_NOTIFICATIONS_ENABLED?.trim().toLowerCase() !== 'true') {
    return { enabled: false };
  }

  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.EMAIL_FROM?.trim();
  const to = env.RESULT_EMAIL_TO?.trim();
  const missing = [
    !apiKey && 'RESEND_API_KEY',
    !from && 'EMAIL_FROM',
    !to && 'RESULT_EMAIL_TO',
  ].filter(Boolean);

  if (!apiKey || !from || !to) {
    report(
      `Email notifications are enabled but missing ${missing.join(', ')}; notifications disabled.`,
    );
    return { enabled: false };
  }

  return { enabled: true, apiKey, from, to };
};

export const serverPort = (env: NodeJS.ProcessEnv) => {
  const parsed = Number(env.PORT ?? 8787);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= 65_535 ? parsed : 8787;
};
