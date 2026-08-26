import { describe, expect, it, vi } from 'vitest';
import { defaultScenarioFor, parseEnabledScenarios, scenarioFromPath } from './scenarios';

describe('enabled scenario configuration', () => {
  it('enables all three scenarios by default', () => {
    expect(parseEnabledScenarios(undefined)).toEqual(['raise', 'hire', 'date']);
  });

  it('normalizes, de-duplicates, and preserves configured order', () => {
    expect(parseEnabledScenarios(' date,raise,date,unknown ', vi.fn())).toEqual(['date', 'raise']);
  });

  it('reports and safely falls back when no scenario is usable', () => {
    const report = vi.fn();
    expect(parseEnabledScenarios('unknown,other', report)).toEqual(['raise', 'hire', 'date']);
    expect(report).toHaveBeenCalledWith(expect.stringContaining('falling back'));
  });

  it('uses Raise when available and otherwise the first configured scenario', () => {
    expect(defaultScenarioFor(['hire', 'raise'])).toBe('raise');
    expect(defaultScenarioFor(['date', 'hire'])).toBe('date');
  });

  it('does not resolve a disabled direct path', () => {
    expect(scenarioFromPath('/date', ['raise', 'hire'])).toBe('raise');
  });
});
