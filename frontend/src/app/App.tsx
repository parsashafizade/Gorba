import { useCallback, useEffect, useRef } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import {
  configuredScenarios,
  defaultScenarioFor,
  scenarioFromPath,
  scenarioRoutes,
} from '../config/scenarios';
import { ScenarioExperience } from '../features/experience/ScenarioExperience';
import type { PendingInteractionCue } from '../features/experience/interactionMemory';
import type { ScenarioId } from '../features/experience/model';
import {
  useInteractionMemory,
  type RecordInteraction,
} from '../features/experience/useInteractionMemory';

const ExperienceRoute = ({
  scenario,
  recordInteraction,
  pendingCue,
  onConsumeCue,
}: {
  scenario: ScenarioId;
  recordInteraction: RecordInteraction;
  pendingCue?: PendingInteractionCue;
  onConsumeCue: (token: number) => void;
}) => (
  <ScenarioExperience
    key={scenario}
    scenario={scenario}
    recordInteraction={recordInteraction}
    pendingCue={pendingCue}
    onConsumeCue={onConsumeCue}
  />
);

export function App({
  enabledScenarios = configuredScenarios,
}: {
  enabledScenarios?: readonly ScenarioId[];
}) {
  const defaultScenario = defaultScenarioFor(enabledScenarios);
  const location = useLocation();
  const activeScenario = scenarioFromPath(location.pathname, enabledScenarios);
  const previousScenarioRef = useRef(activeScenario);
  const { history, recordInteraction, consumeCue } = useInteractionMemory(activeScenario);

  const handleScenarioSwitch = useCallback(
    (from: ScenarioId, to: ScenarioId) => {
      if (from === to) return;
      previousScenarioRef.current = to;
      recordInteraction(
        { type: 'scenario.switch', scenario: to, from, to },
        { queueForScenario: true },
      );
    },
    [recordInteraction],
  );

  useEffect(() => {
    const previousScenario = previousScenarioRef.current;
    if (previousScenario === activeScenario) return;

    const switchTimer = window.setTimeout(() => {
      previousScenarioRef.current = activeScenario;
      recordInteraction(
        {
          type: 'scenario.switch',
          scenario: activeScenario,
          from: previousScenario,
          to: activeScenario,
        },
        { queueForScenario: true },
      );
    }, 0);

    return () => window.clearTimeout(switchTimer);
  }, [activeScenario, recordInteraction]);

  const routeFor = (scenario: ScenarioId) => (
    <ExperienceRoute
      scenario={scenario}
      recordInteraction={recordInteraction}
      pendingCue={history.pendingCues.find((cue) => cue.scenario === scenario)}
      onConsumeCue={consumeCue}
    />
  );

  return (
    <div className="app-shell">
      <AppHeader
        enabledScenarios={enabledScenarios}
        onScenarioSwitch={handleScenarioSwitch}
      />
      <Routes>
        <Route path="/" element={routeFor(defaultScenario)} />
        {enabledScenarios.map((scenario) => (
          <Route
            key={scenario}
            path={scenarioRoutes[scenario]}
            element={routeFor(scenario)}
          />
        ))}
        <Route path="*" element={<Navigate to={scenarioRoutes[defaultScenario]} replace />} />
      </Routes>
    </div>
  );
}
