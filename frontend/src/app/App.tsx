import { Navigate, Route, Routes } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { ScenarioExperience } from '../features/experience/ScenarioExperience';
import type { ScenarioId } from '../features/experience/model';

const ExperienceRoute = ({ scenario }: { scenario: ScenarioId }) => (
  <ScenarioExperience key={scenario} scenario={scenario} />
);

export function App() {
  return (
    <div className="app-shell">
      <AppHeader />
      <Routes>
        <Route path="/" element={<ExperienceRoute scenario="raise" />} />
        <Route path="/raise" element={<ExperienceRoute scenario="raise" />} />
        <Route path="/hire" element={<ExperienceRoute scenario="hire" />} />
        <Route path="/date" element={<ExperienceRoute scenario="date" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
