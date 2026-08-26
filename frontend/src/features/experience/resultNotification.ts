import { useEffect, useRef } from 'react';
import type { CompletedResult } from '../../../../shared/results';

const completionId = () => {
  if (typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
  const bytes = window.crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((value) => value.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

export const postResultNotification = async (
  id: string,
  result: CompletedResult,
  request: typeof fetch = fetch,
) => {
  try {
    await request('/api/results', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ completionId: id, result }),
      keepalive: true,
    });
  } catch {
    // Notifications are deliberately best-effort and never interrupt the visitor's result.
  }
};

export const useResultNotification = (result: CompletedResult | null) => {
  const completionIdRef = useRef<string | null>(null);
  const sentRef = useRef(false);

  useEffect(() => {
    if (!result || sentRef.current) return;
    sentRef.current = true;
    completionIdRef.current ??= completionId();
    void postResultNotification(completionIdRef.current, result);
  }, [result]);
};
