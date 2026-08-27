import { useEffect, useRef, useState } from 'react';

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

  const [isScenarioMenuOpen, setIsScenarioMenuOpen] = useState(false);

  const scenarioMenuRef = useRef<HTMLDivElement>(null);

  const scenarioIcons: Record<ScenarioId, string> = {
    raise: '💸',
    hire: '💼',
    date: '☕',
  };

  const switchLocale = (next: Locale) => {
    applyDocumentLocale(next);
    void i18n.changeLanguage(next);
  };

  const switchScenario = (nextScenario: ScenarioId) => {
    setIsScenarioMenuOpen(false);

    if (nextScenario === scenario) {
      return;
    }

    onScenarioSwitch(scenario, nextScenario);
    navigate(scenarioRoutes[nextScenario]);
  };

  useEffect(() => {
    if (!isScenarioMenuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        scenarioMenuRef.current &&
        !scenarioMenuRef.current.contains(event.target as Node)
      ) {
        setIsScenarioMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsScenarioMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isScenarioMenuOpen]);

  return (
    <header className="app-header" data-scenario={scenario}>
      <div
        ref={scenarioMenuRef}
        className="scenario-selector scenario-selector--custom"
      >
        <button
          type="button"
          className="selector-shell scenario-trigger"
          aria-haspopup="listbox"
          aria-expanded={isScenarioMenuOpen}
          aria-controls="scenario-menu"
          onClick={() => setIsScenarioMenuOpen((current) => !current)}
        >
          <span className="selector-icon" aria-hidden="true">
            {scenarioIcons[scenario]}
          </span>

          <span className="scenario-trigger__label">
            {t(`shared.scenarios.${scenario}`)}
          </span>

          <span
            className={`selector-chevron ${
              isScenarioMenuOpen ? 'is-open' : ''
            }`}
            aria-hidden="true"
          >
            ⌄
          </span>
        </button>

        {isScenarioMenuOpen && (
          <div
            id="scenario-menu"
            className="scenario-menu"
            role="listbox"
            aria-label={t('shared.scenario')}
          >
            {enabledScenarios.map((enabledScenario) => {
              const isSelected = enabledScenario === scenario;

              return (
                <button
                  key={enabledScenario}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`scenario-menu__option ${
                    isSelected ? 'is-selected' : ''
                  }`}
                  onClick={() => switchScenario(enabledScenario)}
                >
                  <span
                    className="scenario-menu__icon"
                    aria-hidden="true"
                  >
                    {scenarioIcons[enabledScenario]}
                  </span>

                  <span className="scenario-menu__label">
                    {t(`shared.scenarios.${enabledScenario}`)}
                  </span>

                  <span
                    className="scenario-menu__check"
                    aria-hidden="true"
                  >
                    {isSelected ? '✓' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div
        className="language-selector"
        aria-label={t('shared.language')}
      >
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
