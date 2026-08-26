import { describe, expect, it } from 'vitest';
import { generateLocalDays, hourlyTimes } from './dateTime';

describe('date and time generation', () => {
  it('generates 14 local calendar days across year boundaries', () => {
    const days = generateLocalDays(14, new Date(2026, 11, 26, 23, 30));
    expect(days).toHaveLength(14);
    expect(days[0].id).toBe('2026-12-26');
    expect(days[13].id).toBe('2027-01-08');
    expect(new Set(days.map((day) => day.id)).size).toBe(14);
  });

  it('exposes all 24 exact hourly values', () => {
    expect(hourlyTimes).toHaveLength(24);
    expect(hourlyTimes[0]).toBe('00:00');
    expect(hourlyTimes[23]).toBe('23:00');
  });
});
