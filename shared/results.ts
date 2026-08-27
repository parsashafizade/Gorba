export const scenarioIds = ['raise', 'hire', 'date'] as const;
export type ScenarioId = (typeof scenarioIds)[number];

export const raiseAmounts = ['five', 'ten', 'twenty', 'thirty'] as const;
export type RaiseAmount = (typeof raiseAmounts)[number];

export const raiseTimings = ['next', 'month', 'meeting', 'surprise'] as const;
export type RaiseTiming = (typeof raiseTimings)[number];

export const hireRoles = ['member', 'specialist', 'lead'] as const;
export type HireRole = (typeof hireRoles)[number];

export const hireOffers = ['cute', 'talk', 'sign'] as const;
export type HireOffer = (typeof hireOffers)[number];

export const dateVibes = ['cafe', 'dessert', 'sunset', 'movie', 'surprise'] as const;
export type DateVibe = (typeof dateVibes)[number];

export type ScenarioSelections = {
  amount?: RaiseAmount;
  timing?: RaiseTiming;
  role?: HireRole;
  offer?: HireOffer;
  vibe?: DateVibe;
  date?: string;
  time?: string;
};

export type RaiseResult = {
  scenario: 'raise';
  amount: RaiseAmount;
  finalPercentage: number;
  timing: RaiseTiming;
};

export type HireResult = {
  scenario: 'hire';
  role: HireRole;
  offer: HireOffer;
};

export type DateResult = {
  scenario: 'date';
  vibe: DateVibe;
  date: string;
  time: string;
};

export type CompletedResult = RaiseResult | HireResult | DateResult;

export const finalRaisePercentage: Record<RaiseAmount, number> = {
  five: 7,
  ten: 12,
  twenty: 22,
  thirty: 32,
};

export const selectedRaisePercentage: Record<RaiseAmount, number> = {
  five: 5,
  ten: 10,
  twenty: 20,
  thirty: 30,
};

const includes = <T extends string>(values: readonly T[], value: unknown): value is T =>
  typeof value === 'string' && values.includes(value as T);

const isValidDateId = (value: unknown): value is string => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
};

const isValidHourlyTime = (value: unknown): value is string =>
  typeof value === 'string' && /^(?:[01]\d|2[0-3]):00$/.test(value);

export const buildCompletedResult = (
  scenario: ScenarioId,
  selections: ScenarioSelections,
): CompletedResult | null => {
  if (
    scenario === 'raise' &&
    includes(raiseAmounts, selections.amount) &&
    includes(raiseTimings, selections.timing)
  ) {
    return {
      scenario,
      amount: selections.amount,
      finalPercentage: finalRaisePercentage[selections.amount],
      timing: selections.timing,
    };
  }

  if (
    scenario === 'hire' &&
    includes(hireRoles, selections.role) &&
    includes(hireOffers, selections.offer)
  ) {
    return { scenario, role: selections.role, offer: selections.offer };
  }

  if (
    scenario === 'date' &&
    includes(dateVibes, selections.vibe) &&
    isValidDateId(selections.date) &&
    isValidHourlyTime(selections.time)
  ) {
    return { scenario, vibe: selections.vibe, date: selections.date, time: selections.time };
  }

  return null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasExactKeys = (value: Record<string, unknown>, keys: readonly string[]) => {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
};

export const parseCompletedResult = (value: unknown): CompletedResult | null => {
  if (!isRecord(value) || !includes(scenarioIds, value.scenario)) return null;

  if (value.scenario === 'raise') {
    if (!hasExactKeys(value, ['scenario', 'amount', 'finalPercentage', 'timing'])) return null;
    const result = buildCompletedResult('raise', {
      amount: value.amount as RaiseAmount,
      timing: value.timing as RaiseTiming,
    });
    return result?.scenario === 'raise' && result.finalPercentage === value.finalPercentage
      ? result
      : null;
  }

  if (value.scenario === 'hire') {
    if (!hasExactKeys(value, ['scenario', 'role', 'offer'])) return null;
    return buildCompletedResult('hire', {
      role: value.role as HireRole,
      offer: value.offer as HireOffer,
    });
  }

  if (!hasExactKeys(value, ['scenario', 'vibe', 'date', 'time'])) return null;
  return buildCompletedResult('date', {
    vibe: value.vibe as DateVibe,
    date: value.date as string,
    time: value.time as string,
  });
};
