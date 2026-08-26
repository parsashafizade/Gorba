import { act, fireEvent, render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, it, vi } from 'vitest';
import i18n from '../../localization/i18n';
import { Mascot } from './Mascot';

describe('mascot interaction lifetime', () => {
  it('tracks initially and permanently obeys the disabled interaction state', async () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <I18nextProvider i18n={i18n}>
        <Mascot emotion="gaze.center" trackingEnabled />
      </I18nextProvider>,
    );
    const stage = screen.getByTestId('mascot-stage');
    Object.defineProperty(stage.parentElement, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        left: 0,
        top: 0,
        width: 200,
        height: 300,
        right: 200,
        bottom: 300,
        x: 0,
        y: 0,
        toJSON: () => '',
      }),
    });

    fireEvent.pointerMove(window, { clientX: 200, clientY: 0, pointerType: 'mouse' });
    await act(async () => {
      vi.advanceTimersByTime(20);
    });
    expect(stage).toHaveAttribute('data-asset', 'gaze.upRight');

    rerender(
      <I18nextProvider i18n={i18n}>
        <Mascot emotion="emotion.sadSoft" trackingEnabled={false} />
      </I18nextProvider>,
    );
    fireEvent.pointerMove(window, { clientX: 0, clientY: 300, pointerType: 'mouse' });
    await act(async () => {
      vi.advanceTimersByTime(20);
    });
    expect(stage).toHaveAttribute('data-asset', 'emotion.sadSoft');
  });

  it('never enters the removed point-down hint during idle tracking', async () => {
    vi.useFakeTimers();
    render(
      <I18nextProvider i18n={i18n}>
        <Mascot emotion="gaze.center" trackingEnabled />
      </I18nextProvider>,
    );

    const stage = screen.getByTestId('mascot-stage');
    for (let elapsed = 0; elapsed < 12_000; elapsed += 250) {
      await act(async () => {
        vi.advanceTimersByTime(250);
      });
      expect(stage).not.toHaveAttribute('data-asset', 'action.pointDown');
    }
    expect(screen.queryByText('Your answer’s right down here 👀')).not.toBeInTheDocument();
  });
});
