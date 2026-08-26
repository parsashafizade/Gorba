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

const advance = async (milliseconds = 700) => {
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
    expect(screen.getByText('My paycheck needs a tiny glow-up.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Absolutely/ }));
    await advance();
    expect(screen.getByText('How legendary are we feeling?')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'فارسی' }));
    expect(document.documentElement).toHaveAttribute('dir', 'rtl');
    expect(screen.getByText('چقدر افسانه‌ای پیش بریم؟')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('ماموریت رو انتخاب کن'), { target: { value: 'hire' } });
    expect(screen.getByText('تیمت یه استخدامِ مشکوکانه خوب کم داره.')).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('lang', 'fa');

    fireEvent.change(screen.getByLabelText('ماموریت رو انتخاب کن'), { target: { value: 'raise' } });
    expect(screen.getByText('فکر کنم حقوقم یه کوچولو ناز لازم داره.')).toBeInTheDocument();
  });

  it('keeps the active step and selection while language changes', async () => {
    renderApp('/raise');
    fireEvent.click(screen.getByRole('button', { name: /Absolutely/ }));
    await advance();

    const twenty = screen.getByRole('radio', { name: /20%/ });
    fireEvent.click(twenty);
    expect(twenty).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'فارسی' }));
    expect(screen.getByText('چقدر افسانه‌ای پیش بریم؟')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /۲۰٪/ })).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'English' }));
    expect(screen.getByRole('radio', { name: /20%/ })).toHaveAttribute('aria-checked', 'true');
  });

  it('completes the Raise result with the playful kitten adjustment', async () => {
    renderApp('/raise');
    fireEvent.click(screen.getByRole('button', { name: /Absolutely/ }));
    await advance();
    fireEvent.click(screen.getByRole('radio', { name: /20%/ }));
    await advance();
    fireEvent.click(screen.getByRole('radio', { name: /Next paycheck/ }));
    await advance();
    expect(screen.getByText('22%')).toBeInTheDocument();
    expect(screen.getByText('The paycheck glow-up is happening.')).toBeInTheDocument();
  });

  it('completes the Hire result', async () => {
    renderApp('/hire');
    fireEvent.click(screen.getByRole('button', { name: /Absolutely/ }));
    await advance();
    fireEvent.click(screen.getByRole('radio', { name: /Specialist/ }));
    await advance();
    fireEvent.click(screen.getByRole('radio', { name: /Where do I sign/ }));
    await advance();
    expect(screen.getByText('Welcome to your suspiciously fast promotion.')).toBeInTheDocument();
    expect(screen.getAllByText('Specialist').length).toBeGreaterThan(0);
  });

  it('offers 14 days and 24 hours, then completes the Date result', async () => {
    renderApp('/date');
    fireEvent.click(screen.getByRole('button', { name: /Absolutely/ }));
    await advance();
    fireEvent.click(screen.getByRole('radio', { name: /Cozy Café/ }));
    await advance();

    const dateOptions = within(screen.getByRole('group', { name: 'Pick a day' })).getAllByRole(
      'radio',
    );
    const timeOptions = within(screen.getByRole('group', { name: 'Pick an hour' })).getAllByRole(
      'radio',
    );
    expect(timeOptions).toHaveLength(24);
    expect(dateOptions).toHaveLength(14);
    fireEvent.click(dateOptions[0]);
    fireEvent.click(screen.getByRole('radio', { name: '20:00' }));
    fireEvent.click(screen.getByRole('button', { name: /Make it official/ }));

    expect(screen.getByText('Okay, this is ridiculously cute.')).toBeInTheDocument();
    expect(screen.getAllByText('Cozy Café').length).toBeGreaterThan(0);
    expect(screen.getAllByText('20:00').length).toBeGreaterThan(0);
  });
});
