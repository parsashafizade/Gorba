import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { noConversationLength } from '../features/experience/scenarioConfig';
import { reactionPlacementFor, reactionPlacements } from '../features/mascot/dialogue';
import { applyDocumentLocale } from '../localization/i18n';
import i18n from '../localization/i18n';
import { App } from './App';

type Scenario = 'raise' | 'hire' | 'date';

const renderApp = (route = '/', enabledScenarios?: Scenario[]) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <App enabledScenarios={enabledScenarios} />
    </MemoryRouter>,
  );

const advance = async (milliseconds = 2300) => {
  await act(async () => {
    vi.advanceTimersByTime(milliseconds);
  });
};

const experience = () => screen.getByRole('main');
const expectScene = (scenario: Scenario, step: number) => {
  expect(experience()).toHaveClass(`experience--${scenario}`);
  expect(experience()).toHaveAttribute('data-step', String(step));
};
const chooseRadio = (index: number) => fireEvent.click(screen.getAllByRole('radio')[index]);
const switchScenario = (scenario: Scenario) =>
  fireEvent.change(screen.getByRole('combobox'), { target: { value: scenario } });

describe('application flows', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    applyDocumentLocale('en');
    await i18n.changeLanguage('en');
  });

  it('uses Raise at / and resets a destination scenario while preserving language', async () => {
    renderApp();
    expectScene('raise', 1);

    fireEvent.click(screen.getByTestId('yes-button'));
    await advance();
    expectScene('raise', 2);

    fireEvent.click(screen.getByRole('button', { name: 'فارسی' }));
    expect(document.documentElement).toHaveAttribute('dir', 'rtl');
    expectScene('raise', 2);

    switchScenario('hire');
    expectScene('hire', 1);
    expect(document.documentElement).toHaveAttribute('lang', 'fa');

    switchScenario('raise');
    expectScene('raise', 1);
  });

  it('keeps the active step and selection while language changes', async () => {
    renderApp('/raise');
    fireEvent.click(screen.getByTestId('yes-button'));
    await advance();

    chooseRadio(2);
    expect(screen.getAllByRole('radio')[2]).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'فارسی' }));
    expectScene('raise', 2);
    expect(screen.getAllByRole('radio')[2]).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'English' }));
    expect(screen.getAllByRole('radio')[2]).toHaveAttribute('aria-checked', 'true');
  });

  it('completes the Raise result with the selected and kitten-adjusted values', async () => {
    renderApp('/raise');
    fireEvent.click(screen.getByTestId('yes-button'));
    await advance();
    chooseRadio(2);
    await advance();
    chooseRadio(0);
    await advance();

    expectScene('raise', 4);
    const result = document.querySelector('.result-card--raise');
    expect(result).not.toBeNull();
    expect(result).toHaveTextContent('22%');
    expect(result).toHaveTextContent('20%');
    expect(result).toHaveTextContent('+2%');
  });

  it('completes the Hire result with the selected role and offer', async () => {
    renderApp('/hire');
    fireEvent.click(screen.getByTestId('yes-button'));
    await advance();
    chooseRadio(1);
    await advance();
    chooseRadio(2);
    await advance();

    expectScene('hire', 4);
    const result = document.querySelector('.result-card--hire');
    expect(result).not.toBeNull();
    expect(result).toHaveTextContent(i18n.t('hire.role.options.specialist.label'));
    expect(result).toHaveTextContent(i18n.t('hire.offer.options.sign.label'));
  });

  it('offers 14 days and all 24 hours, then completes the Date result', async () => {
    renderApp('/date');
    fireEvent.click(screen.getByTestId('yes-button'));
    await advance();
    chooseRadio(0);
    await advance();

    const groups = screen.getAllByRole('radiogroup');
    const dateOptions = within(groups[0]).getAllByRole('radio');
    const timeOptions = within(groups[1]).getAllByRole('radio');
    expect(dateOptions).toHaveLength(14);
    expect(timeOptions).toHaveLength(24);

    fireEvent.click(dateOptions[0]);
    fireEvent.click(timeOptions[20]);
    fireEvent.click(document.querySelector('.continue-button') as HTMLButtonElement);

    expectScene('date', 3);
    expect(screen.getByTestId('kitten-bubble')).toBeInTheDocument();
    await advance();
    expectScene('date', 4);
    const result = document.querySelector('.result-card--date');
    expect(result).not.toBeNull();
    expect(result).toHaveTextContent(i18n.t('date.vibe.options.cafe.label'));
    expect(result).toHaveTextContent('20:00');
  });

  it('holds the Yes reaction, keeps the choice locked, and advances only once', async () => {
    renderApp('/raise');
    const yes = screen.getByTestId('yes-button');

    fireEvent.click(yes);
    fireEvent.click(yes);

    expect(yes).toBeDisabled();
    expect(screen.getByTestId('kitten-bubble')).toBeInTheDocument();
    expectScene('raise', 1);

    await advance(1200);
    expect(screen.getByTestId('kitten-bubble')).toBeInTheDocument();
    expectScene('raise', 1);

    await advance(900);
    expectScene('raise', 2);
    expect(screen.getAllByRole('radio')).toHaveLength(4);
  });

  it('stages the recipient before the kitten and cycles the curated placements', async () => {
    renderApp('/raise');

    fireEvent.click(screen.getByTestId('no-button'));
    const firstRecipient = screen.getByTestId('recipient-bubble').textContent;
    expect(firstRecipient).toContain(i18n.t('raise.recipient.label'));
    expect(screen.queryByTestId('kitten-bubble')).not.toBeInTheDocument();

    await advance(329);
    expect(screen.queryByTestId('kitten-bubble')).not.toBeInTheDocument();
    await advance(1);
    const firstReaction = screen.getByTestId('kitten-bubble').textContent;
    expect(firstReaction).toContain(i18n.t('shared.kitten'));

    const placements = [screen.getByTestId('kitten-bubble').dataset.placement];
    for (let attempt = 2; attempt <= reactionPlacements.length; attempt += 1) {
      fireEvent.click(screen.getByTestId('no-button'));
      await advance(330);
      placements.push(screen.getByTestId('kitten-bubble').dataset.placement);
    }
    expect(placements).toEqual(reactionPlacements);

    for (
      let attempt = reactionPlacements.length + 1;
      attempt <= noConversationLength;
      attempt += 1
    ) {
      fireEvent.click(screen.getByTestId('no-button'));
      await advance(330);
    }
    fireEvent.click(screen.getByTestId('no-button'));
    expect(screen.getByTestId('recipient-bubble').textContent).toBe(firstRecipient);
    await advance(330);
    expect(screen.getByTestId('kitten-bubble').textContent).toBe(firstReaction);
    expect(screen.getByTestId('kitten-bubble')).toHaveAttribute(
      'data-placement',
      reactionPlacementFor(noConversationLength + 1),
    );
  });

  it('resets the No conversation when switching scenarios while preserving locale', async () => {
    renderApp('/raise');
    fireEvent.click(screen.getByTestId('no-button'));
    await advance(330);
    expect(screen.getByTestId('kitten-bubble')).toHaveAttribute(
      'data-placement',
      reactionPlacements[0],
    );

    switchScenario('hire');
    expect(screen.queryByTestId('recipient-bubble')).not.toBeInTheDocument();
    switchScenario('raise');
    expect(screen.queryByTestId('recipient-bubble')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('no-button'));
    expect(screen.getByTestId('recipient-bubble')).toHaveTextContent(
      i18n.t('raise.recipient.label'),
    );
  });

  it('notifies only after completion and does not duplicate on normal rerenders', async () => {
    renderApp('/raise');
    const request = vi.mocked(fetch);

    fireEvent.click(screen.getByTestId('yes-button'));
    await advance();
    chooseRadio(2);
    await advance();
    expect(request).not.toHaveBeenCalled();

    chooseRadio(0);
    await advance();
    expect(request).toHaveBeenCalledTimes(1);
    expect(JSON.parse(String(request.mock.calls[0][1]?.body))).toMatchObject({
      result: { scenario: 'raise', amount: 'twenty', finalPercentage: 22, timing: 'next' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'فارسی' }));
    fireEvent.click(screen.getByRole('button', { name: 'English' }));
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('hides disabled scenarios from navigation and redirects a disabled direct route', () => {
    renderApp('/date', ['raise', 'hire']);

    expectScene('raise', 1);
    expect(screen.getAllByRole('option').map((option) => option.getAttribute('value'))).toEqual([
      'raise',
      'hire',
    ]);
  });

  it('uses Raise at the root whenever Raise is enabled', () => {
    renderApp('/', ['hire', 'raise']);
    expectScene('raise', 1);
  });

  it('uses the first configured scenario at the root when Raise is disabled', () => {
    renderApp('/', ['date', 'hire']);
    expectScene('date', 1);
  });
});
