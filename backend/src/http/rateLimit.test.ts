import { describe, expect, it } from 'vitest';
import { CompletionDeduplicator, FixedWindowRateLimiter } from './rateLimit.js';

describe('public endpoint abuse protection', () => {
  it('limits requests per client within a fixed window', () => {
    const limiter = new FixedWindowRateLimiter(2, 1_000);
    expect(limiter.allow('client', 0)).toBe(true);
    expect(limiter.allow('client', 10)).toBe(true);
    expect(limiter.allow('client', 20)).toBe(false);
    expect(limiter.allow('client', 1_001)).toBe(true);
  });

  it('claims each completion ID only once during retention', () => {
    const deduplicator = new CompletionDeduplicator(1_000);
    expect(deduplicator.claim('completion', 0)).toBe(true);
    expect(deduplicator.claim('completion', 10)).toBe(false);
    expect(deduplicator.claim('completion', 1_001)).toBe(true);
  });

  it('bounds in-memory client and completion tracking', () => {
    const limiter = new FixedWindowRateLimiter(1, 1_000, 2);
    expect(limiter.allow('first', 0)).toBe(true);
    expect(limiter.allow('second', 0)).toBe(true);
    expect(limiter.allow('third', 0)).toBe(true);
    expect(limiter.allow('first', 1)).toBe(true);

    const deduplicator = new CompletionDeduplicator(1_000, 2);
    expect(deduplicator.claim('first', 0)).toBe(true);
    expect(deduplicator.claim('second', 0)).toBe(true);
    expect(deduplicator.claim('third', 0)).toBe(true);
    expect(deduplicator.claim('first', 1)).toBe(true);
  });
});
