import { describe, expect, it } from 'vitest';
import { buildCompletedResult, parseCompletedResult } from '../../../../shared/results';

describe('completed result payloads', () => {
  it('builds the Raise payload with the same adjusted percentage shown by Final Result', () => {
    expect(buildCompletedResult('raise', { amount: 'twenty', timing: 'next' })).toEqual({
      scenario: 'raise',
      amount: 'twenty',
      finalPercentage: 22,
      timing: 'next',
    });
  });

  it('builds the Hire payload from the chosen role and offer tier', () => {
    expect(buildCompletedResult('hire', { role: 'specialist', offer: 'sign' })).toEqual({
      scenario: 'hire',
      role: 'specialist',
      offer: 'sign',
    });
  });

  it('builds the Date payload from the outing, date, and time', () => {
    expect(
      buildCompletedResult('date', {
        vibe: 'cafe',
        date: '2026-08-29',
        time: '17:00',
      }),
    ).toEqual({ scenario: 'date', vibe: 'cafe', date: '2026-08-29', time: '17:00' });
  });

  it('rejects incomplete, tampered, or extended result payloads', () => {
    expect(buildCompletedResult('date', { vibe: 'cafe', date: 'bad', time: '17:30' })).toBeNull();
    expect(
      parseCompletedResult({
        scenario: 'raise',
        amount: 'twenty',
        finalPercentage: 20,
        timing: 'next',
      }),
    ).toBeNull();
    expect(
      parseCompletedResult({ scenario: 'hire', role: 'lead', offer: 'sign', html: '<b>x</b>' }),
    ).toBeNull();
  });
});
