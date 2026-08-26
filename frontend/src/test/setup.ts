import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('hover: hover'),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

Object.defineProperty(Image.prototype, 'decode', {
  configurable: true,
  value: vi.fn().mockResolvedValue(undefined),
});

window.requestIdleCallback = ((callback: IdleRequestCallback) => {
  queueMicrotask(() => callback({ didTimeout: false, timeRemaining: () => 20 }));
  return 1;
}) as typeof window.requestIdleCallback;
window.cancelIdleCallback = (() => undefined) as typeof window.cancelIdleCallback;
