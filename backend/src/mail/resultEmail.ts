import type { CompletedResult } from '../../../shared/results.js';

const labels = {
  raiseTiming: {
    next: 'Next paycheck',
    month: 'This month',
    meeting: 'After one tiny meeting',
    surprise: 'Surprise me',
  },
  hireRole: { member: 'Team Member', specialist: 'Specialist', lead: 'Team Lead' },
  hireOffer: {
    cute: 'A tiny offer',
    talk: 'Okay, now we’re talking',
    sign: 'Where do I sign?',
  },
  dateVibe: {
    cafe: 'Cozy Café',
    dessert: 'Dessert Date',
    sunset: 'Sunset Spot',
    movie: 'Movie',
    surprise: 'Surprise Me',
  },
} as const;

const escapeHtml = (value: string) =>
  value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    };
    return entities[character];
  });

const formatDate = (id: string) =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${id}T12:00:00Z`));

export const resultEmail = (result: CompletedResult) => {
  let title: string;
  let rows: Array<[string, string]>;
  let outcome: string;

  if (result.scenario === 'raise') {
    title = 'Raise experience completed';
    rows = [
      ['Final displayed raise', `${result.finalPercentage}%`],
      ['Timing', labels.raiseTiming[result.timing]],
    ];
    outcome = 'The displayed result includes the kitten’s playful two-point adjustment.';
  } else if (result.scenario === 'hire') {
    title = 'Hire experience completed';
    rows = [
      ['Role', labels.hireRole[result.role]],
      ['Offer tier', labels.hireOffer[result.offer]],
    ];
    outcome = 'The unofficial offer is complete: hired, no take-backs.';
  } else {
    title = 'Date experience completed';
    rows = [
      ['Outing', labels.dateVibe[result.vibe]],
      ['Date', formatDate(result.date)],
      ['Time', result.time],
    ];
    outcome = 'The date ticket shown to the visitor is confirmed.';
  }

  const text = [title, '', ...rows.map(([label, value]) => `${label}: ${value}`), '', outcome].join(
    '\n',
  );
  const htmlRows = rows
    .map(
      ([label, value]) =>
        `<tr><th align="left" style="padding:6px 14px 6px 0">${escapeHtml(label)}</th><td style="padding:6px 0">${escapeHtml(value)}</td></tr>`,
    )
    .join('');

  return {
    subject: `[Tiny Yes] ${title}`,
    text,
    html: `<main style="font-family:Arial,sans-serif;color:#292644"><h1>${escapeHtml(title)}</h1><table>${htmlRows}</table><p>${escapeHtml(outcome)}</p></main>`,
  };
};
