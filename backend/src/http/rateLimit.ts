type WindowEntry = { count: number; resetAt: number };

export class FixedWindowRateLimiter {
  private readonly entries = new Map<string, WindowEntry>();

  constructor(
    private readonly maximum = 5,
    private readonly windowMs = 10 * 60 * 1000,
    private readonly maximumEntries = 10_000,
  ) {}

  allow(key: string, now = Date.now()) {
    const current = this.entries.get(key);
    if (!current || current.resetAt <= now) {
      this.makeRoom(now);
      this.entries.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }
    if (current.count >= this.maximum) return false;
    current.count += 1;
    return true;
  }

  private makeRoom(now: number) {
    if (this.entries.size < this.maximumEntries) return;
    for (const [key, value] of this.entries) {
      if (value.resetAt <= now) this.entries.delete(key);
    }
    if (this.entries.size >= this.maximumEntries) {
      const oldest = this.entries.keys().next().value;
      if (oldest !== undefined) this.entries.delete(oldest);
    }
  }
}

export class CompletionDeduplicator {
  private readonly seen = new Map<string, number>();

  constructor(
    private readonly retentionMs = 24 * 60 * 60 * 1000,
    private readonly maximumEntries = 10_000,
  ) {}

  claim(id: string, now = Date.now()) {
    const expiresAt = this.seen.get(id);
    if (expiresAt && expiresAt > now) return false;
    if (this.seen.size >= this.maximumEntries) {
      for (const [key, expiry] of this.seen) if (expiry <= now) this.seen.delete(key);
      if (this.seen.size >= this.maximumEntries) {
        const oldest = this.seen.keys().next().value;
        if (oldest !== undefined) this.seen.delete(oldest);
      }
    }
    this.seen.set(id, now + this.retentionMs);
    return true;
  }
}
