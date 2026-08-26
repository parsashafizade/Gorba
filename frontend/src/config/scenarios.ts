import { scenarioIds, type ScenarioId } from '../../../shared/results';

export const scenarioRoutes: Record<ScenarioId, string> = {
  raise: '/raise',
  hire: '/hire',
  date: '/date',
};

const allScenarios = [...scenarioIds];

export const parseEnabledScenarios = (
  raw: string | undefined,
  report: (message: string) => void = console.warn,
): ScenarioId[] => {
  if (raw === undefined) return [...allScenarios];

  const requested = raw
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  const unknown = requested.filter(
    (value): value is string => !scenarioIds.includes(value as ScenarioId),
  );
  const enabled = requested.filter(
    (value, index): value is ScenarioId =>
      scenarioIds.includes(value as ScenarioId) && requested.indexOf(value) === index,
  );

  if (unknown.length > 0) {
    report(`Ignoring unknown VITE_ENABLED_SCENARIOS value(s): ${unknown.join(', ')}`);
  }
  if (enabled.length > 0) return enabled;

  report(
    'VITE_ENABLED_SCENARIOS did not contain a usable scenario; falling back to raise,hire,date.',
  );
  return [...allScenarios];
};

export const configuredScenarios = parseEnabledScenarios(import.meta.env.VITE_ENABLED_SCENARIOS);

export const defaultScenarioFor = (enabled: readonly ScenarioId[]): ScenarioId =>
  enabled.includes('raise') ? 'raise' : (enabled[0] ?? 'raise');

export const scenarioFromPath = (pathname: string, enabled: readonly ScenarioId[]): ScenarioId => {
  const match = scenarioIds.find((scenario) => pathname === scenarioRoutes[scenario]);
  return match && enabled.includes(match) ? match : defaultScenarioFor(enabled);
};
