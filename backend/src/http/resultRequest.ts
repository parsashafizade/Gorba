import { parseCompletedResult, type CompletedResult } from '../../../shared/results.js';

export type ResultNotificationRequest = {
  completionId: string;
  result: CompletedResult;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const parseResultNotificationRequest = (
  value: unknown,
): ResultNotificationRequest | null => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (
    Object.keys(record).length !== 2 ||
    typeof record.completionId !== 'string' ||
    !uuidPattern.test(record.completionId)
  ) {
    return null;
  }
  const result = parseCompletedResult(record.result);
  return result ? { completionId: record.completionId, result } : null;
};
