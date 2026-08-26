import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { applyDocumentLocale } from '../localization/i18n';
import i18n from '../localization/i18n';
import { App } from './App';

const renderApp = (route = '/') =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  );

const advance = async (milliseconds = 2300) => {
  await act(async () => {
    vi.advanceTimersByTime(milliseconds);
  });
};

describe('application flows', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    applyDocumentLocale('en');
    await i18n.changeLanguage('en');
  });

  it('uses Raise at / and resets a destination scenario while preserving language', async () => {
    renderApp();
    expect(
      screen.getByText('So... when does my paycheck get a little bigger? 👀'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Yesss/ }));
    await advance();
    expect(screen.getByText('Alright boss... how happy are we making me? 😌')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'فارسی' }));
    expect(document.documentElement).toHaveAttribute('dir', 'rtl');
    expect(screen.getByText('خب رئیس... چند درصد قراره خوشحالم کنی؟ 😌')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('امروز چی می‌خوایم؟'), { target: { value: 'hire' } });
    expect(screen.getByText('خب... کی قراره منو استخدام کنی؟ 👀')).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('lang', 'fa');

    fireEvent.change(screen.getByLabelText('امروز چی می‌خوایم؟'), { target: { value: 'raise' } });
    expect(screen.getByText('خب... حقوق من کی قراره یه کم قد بکشه؟ 👀')).toBeInTheDocument();
  });

  it('keeps the active step and selection while language changes', async () => {
    renderApp('/raise');
    fireEvent.click(screen.getByRole('button', { name: /Yesss/ }));
    await advance();

    const twenty = screen.getByRole('radio', { name: /20%/ });
    fireEvent.click(twenty);
    expect(twenty).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'فارسی' }));
    expect(screen.getByText('خب رئیس... چند درصد قراره خوشحالم کنی؟ 😌')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /۲۰٪/ })).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'English' }));
    expect(screen.getByRole('radio', { name: /20%/ })).toHaveAttribute('aria-checked', 'true');
  });

  it('completes the Raise result with the playful kitten adjustment', async () => {
    renderApp('/raise');
    fireEvent.click(screen.getByRole('button', { name: /Yesss/ }));
    await advance();
    fireEvent.click(screen.getByRole('radio', { name: /20%/ }));
    await advance();
    fireEvent.click(screen.getByRole('radio', { name: /Next paycheck/ }));
    await advance();
    expect(screen.getByText('22%')).toBeInTheDocument();
    expect(screen.getByText('So... am I richer now? 😌')).toBeInTheDocument();
  });

  it('completes the Hire result', async () => {
    renderApp('/hire');
    fireEvent.click(screen.getByRole('button', { name: /Yesss/ }));
    await advance();
    fireEvent.click(screen.getByRole('radio', { name: /Specialist/ }));
    await advance();
    fireEvent.click(screen.getByRole('radio', { name: /Where do I sign/ }));
    await advance();
    expect(screen.getByText('Well... guess we work together now 😎')).toBeInTheDocument();
    expect(screen.getAllByText('Specialist').length).toBeGreaterThan(0);
  });

  it('offers 14 days and 24 hours, then completes the Date result', async () => {
    renderApp('/date');
    fireEvent.click(screen.getByRole('button', { name: /Yesss/ }));
    await advance();
    await advance(250);
    fireEvent.click(screen.getByRole('radio', { name: /Cozy Café/ }));
    await advance();
    await advance(250);

    const dateOptions = within(screen.getByRole('group', { name: 'Which day?' })).getAllByRole(
      'radio',
    );
    const timeOptions = within(screen.getByRole('group', { name: 'What time?' })).getAllByRole(
      'radio',
    );
    expect(timeOptions).toHaveLength(24);
    expect(dateOptions).toHaveLength(14);
    fireEvent.click(dateOptions[0]);
    fireEvent.click(screen.getByRole('radio', { name: '20:00' }));
    fireEvent.click(screen.getByRole('button', { name: /Okay, lock it in/ }));

    expect(screen.getByTestId('kitten-bubble')).toHaveTextContent('Saving the date! 💘');
    expect(screen.queryByText('Wait... we’re actually doing this 😭❤️')).not.toBeInTheDocument();
    await advance();
    expect(screen.getByText('Wait... we’re actually doing this 😭❤️')).toBeInTheDocument();
    expect(screen.getAllByText('Cozy Café').length).toBeGreaterThan(0);
    expect(screen.getAllByText('20:00').length).toBeGreaterThan(0);
  });

  it('holds the Yes reaction, keeps the choice locked, and advances only once', async () => {
    renderApp('/raise');
    const yes = screen.getByRole('button', { name: /Yesss/ });

    fireEvent.click(yes);
    fireEvent.click(yes);

    expect(yes).toBeDisabled();
    expect(screen.getByTestId('kitten-bubble')).toHaveTextContent('Capitalism briefly healed 😌');
    expect(
      screen.queryByText('Alright boss... how happy are we making me? 😌'),
    ).not.toBeInTheDocument();

    await advance(1200);
    expect(screen.getByTestId('kitten-bubble')).toHaveTextContent('Capitalism briefly healed 😌');
    expect(
      screen.queryByText('Alright boss... how happy are we making me? 😌'),
    ).not.toBeInTheDocument();

    await advance(500);
    expect(screen.getByText('Alright boss... how happy are we making me? 😌')).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(4);
  });

  it('stages a localized recipient reply before the kitten and cycles back after six Nos', async () => {
    renderApp('/raise');
    const no = screen.getByRole('button', { name: 'Nope' });

    fireEvent.click(no);
    expect(screen.getByTestId('recipient-bubble')).toHaveTextContent('Boss');
    expect(screen.getByTestId('recipient-bubble')).toHaveTextContent('Budget’s a little tight 😅');
    expect(screen.queryByTestId('kitten-bubble')).not.toBeInTheDocument();

    await advance(329);
    expect(screen.queryByTestId('kitten-bubble')).not.toBeInTheDocument();
    await advance(1);
    expect(screen.getByTestId('kitten-bubble')).toHaveTextContent('Even a tiny raise? 🥺');

    for (let attempt = 2; attempt <= 6; attempt += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Nope' }));
      await advance(330);
    }
    fireEvent.click(screen.getByRole('button', { name: 'Nope' }));
    expect(screen.getByTestId('recipient-bubble')).toHaveTextContent('Budget’s a little tight 😅');
    await advance(330);
    expect(screen.getByTestId('kitten-bubble')).toHaveTextContent('Even a tiny raise? 🥺');
  });

  it('resets the No conversation when switching scenarios while preserving locale', async () => {
    renderApp('/raise');
    fireEvent.click(screen.getByRole('button', { name: 'Nope' }));
    await advance(330);
    expect(screen.getByTestId('kitten-bubble')).toHaveTextContent('Even a tiny raise? 🥺');

    fireEvent.change(screen.getByLabelText('What are we asking for?'), {
      target: { value: 'hire' },
    });
    expect(screen.queryByTestId('recipient-bubble')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('What are we asking for?'), {
      target: { value: 'raise' },
    });

    expect(screen.queryByTestId('recipient-bubble')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Nope' }));
    expect(screen.getByTestId('recipient-bubble')).toHaveTextContent('Budget’s a little tight 😅');
  });
});
