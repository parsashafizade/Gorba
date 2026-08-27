import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { scenarioFromPath, scenarioRoutes } from '../config/scenarios';
import { applyDocumentLocale, type Locale } from '../localization/i18n';
import type { ScenarioId } from '../features/experience/model';

export function AppHeader({
  enabledScenarios,
  onScenarioSwitch,
}: {
  enabledScenarios: readonly ScenarioId[];
  onScenarioSwitch: (from: ScenarioId, to: ScenarioId) => void;
}) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const scenario = scenarioFromPath(location.pathname, enabledScenarios);
  const locale = i18n.resolvedLanguage === 'fa' ? 'fa' : 'en';
  const scenarioIcons: Record<ScenarioId, string> = { raise: '💸', hire: '💼', date: '☕' };

  const switchLocale = (next: Locale) => {
    applyDocumentLocale(next);
    void i18n.changeLanguage(next);
  };

  return (
    <header className="app-header" data-scenario={scenario}>
      <div className="selector-shell scenario-selector">
        <span className="selector-icon" aria-hidden="true">
          {scenarioIcons[scenario]}
        </span>
        <label className="sr-only" htmlFor="scenario-select">
          {t('shared.scenario')}
        </label>
        <select
          id="scenario-select"
          value={scenario}
          onChange={(event) => {
            const nextScenario = event.target.value as ScenarioId;
            onScenarioSwitch(scenario, nextScenario);
            navigate(scenarioRoutes[nextScenario]);
          }}
        >
          {enabledScenarios.map((enabledScenario) => (
            <option key={enabledScenario} value={enabledScenario}>
              {t(`shared.scenarios.${enabledScenario}`)}
            </option>
          ))}
        </select>
        <span className="selector-chevron" aria-hidden="true">
          ⌄
        </span>
      </div>

      <div className="language-selector" aria-label={t('shared.language')}>
        <button
          type="button"
          className={locale === 'fa' ? 'is-active' : ''}
          aria-pressed={locale === 'fa'}
          onClick={() => switchLocale('fa')}
        >
          فارسی
        </button>
        <button
          type="button"
          className={locale === 'en' ? 'is-active' : ''}
          aria-pressed={locale === 'en'}
          onClick={() => switchLocale('en')}
        >
          English
        </button>
      </div>
    </header>
  );
}
