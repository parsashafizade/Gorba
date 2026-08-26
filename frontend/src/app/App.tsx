import { Navigate, Route, Routes } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { configuredScenarios, defaultScenarioFor, scenarioRoutes } from '../config/scenarios';
import { ScenarioExperience } from '../features/experience/ScenarioExperience';
import type { ScenarioId } from '../features/experience/model';

const ExperienceRoute = ({ scenario }: { scenario: ScenarioId }) => (
  <ScenarioExperience key={scenario} scenario={scenario} />
);

export function App({
  enabledScenarios = configuredScenarios,
}: {
  enabledScenarios?: readonly ScenarioId[];
}) {
  const defaultScenario = defaultScenarioFor(enabledScenarios);
  return (
    <div className="app-shell">
      <AppHeader enabledScenarios={enabledScenarios} />
      <Routes>
        <Route path="/" element={<ExperienceRoute scenario={defaultScenario} />} />
        {enabledScenarios.map((scenario) => (
          <Route
            key={scenario}
            path={scenarioRoutes[scenario]}
            element={<ExperienceRoute scenario={scenario} />}
          />
        ))}
        <Route path="*" element={<Navigate to={scenarioRoutes[defaultScenario]} replace />} />
      </Routes>
    </div>
  );
}
