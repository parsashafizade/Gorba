import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { applyDocumentLocale, type Locale } from '../localization/i18n';
import { scenarioFromPath, scenarioRoutes } from '../features/experience/scenarioConfig';
import type { ScenarioId } from '../features/experience/model';

export function AppHeader() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const scenario = scenarioFromPath(location.pathname);
  const locale = i18n.resolvedLanguage === 'fa' ? 'fa' : 'en';
  const scenarioIcons: Record<ScenarioId, string> = { raise: '💸', hire: '💼', date: '☕' };

  const switchLocale = (next: Locale) => {
    applyDocumentLocale(next);
    void i18n.changeLanguage(next);
  };

  return (
    <header className="app-header">
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
          onChange={(event) => navigate(scenarioRoutes[event.target.value as ScenarioId])}
        >
          <option value="raise">{t('shared.scenarios.raise')}</option>
          <option value="hire">{t('shared.scenarios.hire')}</option>
          <option value="date">{t('shared.scenarios.date')}</option>
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
