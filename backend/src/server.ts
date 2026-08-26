import { createServer } from 'node:http';
import { resolve } from 'node:path';
import dotenv from 'dotenv';
import { createApplicationHandler } from './app.js';
import { readEmailNotificationConfig, serverPort } from './config.js';
import { ResultNotificationService } from './mail/notificationService.js';
import { ResendMailProvider } from './mail/resend.js';

dotenv.config({ path: resolve(process.cwd(), '.env'), quiet: true });
dotenv.config({ path: resolve(process.cwd(), '../.env'), quiet: true });

const emailConfig = readEmailNotificationConfig(process.env);
const mailProvider = emailConfig.enabled ? new ResendMailProvider(emailConfig.apiKey) : null;
const notifications = new ResultNotificationService(emailConfig, mailProvider);
const staticDirectory = resolve(
  process.cwd(),
  process.cwd().endsWith('backend') ? '../frontend/dist' : 'frontend/dist',
);
const port = serverPort(process.env);

createServer(createApplicationHandler({ notifications, staticDirectory })).listen(port, () => {
  console.log(`Tiny Yes is listening on http://127.0.0.1:${port}`);
  console.log(`Result email notifications: ${emailConfig.enabled ? 'enabled' : 'disabled'}`);
});
