import { describe, expect, it } from 'vitest';
import { buildCompletedResult } from '../../shared/results.js';
import { resultEmail } from './mail/resultEmail.js';

describe('result email data', () => {
  it('renders the final Raise percentage and timing from the shared payload', () => {
    const result = buildCompletedResult('raise', { amount: 'twenty', timing: 'next' });
    expect(result?.scenario).toBe('raise');
    expect(result && resultEmail(result).text).toContain('Final displayed raise: 22%');
    expect(result && resultEmail(result).text).toContain('Timing: Next paycheck');
  });

  it('renders the Hire role and offer from the shared payload', () => {
    const result = buildCompletedResult('hire', { role: 'specialist', offer: 'sign' });
    expect(result && resultEmail(result).text).toContain('Role: Specialist');
    expect(result && resultEmail(result).text).toContain('Offer tier: Where do I sign?');
  });

  it('renders the Date outing, local choice date, and time from the shared payload', () => {
    const result = buildCompletedResult('date', {
      vibe: 'cafe',
      date: '2026-08-29',
      time: '17:00',
    });
    expect(result && resultEmail(result).text).toContain('Outing: Cozy Café');
    expect(result && resultEmail(result).text).toContain('Date: Saturday, August 29, 2026');
    expect(result && resultEmail(result).text).toContain('Time: 17:00');
  });
});
