export const contextualEffectIds = [
  'raise-small-change',
  'raise-big-payday',
  'raise-persistence',
  'hire-lead-badge',
  'hire-signed',
  'hire-persistence',
  'date-dessert',
  'date-sunset',
  'date-surprise',
  'date-night',
  'date-early',
  'date-persistence',
  'switch-whiplash',
] as const;

export type ContextualEffectId = (typeof contextualEffectIds)[number];

type EffectDefinition = {
  labelKey: string;
  glyphs: readonly string[];
  durationMs: number;
};

export const contextualEffects: Record<ContextualEffectId, EffectDefinition> = {
  'raise-small-change': {
    labelKey: 'memory.effects.raiseSmall',
    glyphs: ['¢'],
    durationMs: 900,
  },
  'raise-big-payday': {
    labelKey: 'memory.effects.raiseBig',
    glyphs: ['$', '+', '↗'],
    durationMs: 1_200,
  },
  'raise-persistence': {
    labelKey: 'memory.effects.raisePersistence',
    glyphs: ['6×', '↻'],
    durationMs: 1_150,
  },
  'hire-lead-badge': {
    labelKey: 'memory.effects.hireLead',
    glyphs: ['★', '↑'],
    durationMs: 1_150,
  },
  'hire-signed': {
    labelKey: 'memory.effects.hireSigned',
    glyphs: ['✓', '✎'],
    durationMs: 1_050,
  },
  'hire-persistence': {
    labelKey: 'memory.effects.hirePersistence',
    glyphs: ['6×', 'CV'],
    durationMs: 1_150,
  },
  'date-dessert': {
    labelKey: 'memory.effects.dateDessert',
    glyphs: ['🍰', '•'],
    durationMs: 1_050,
  },
  'date-sunset': {
    labelKey: 'memory.effects.dateSunset',
    glyphs: ['◒', '—'],
    durationMs: 1_100,
  },
  'date-surprise': {
    labelKey: 'memory.effects.dateSurprise',
    glyphs: ['?', '✦'],
    durationMs: 1_100,
  },
  'date-night': {
    labelKey: 'memory.effects.dateNight',
    glyphs: ['☾', '✦'],
    durationMs: 1_200,
  },
  'date-early': {
    labelKey: 'memory.effects.dateEarly',
    glyphs: ['☀', '↑'],
    durationMs: 1_050,
  },
  'date-persistence': {
    labelKey: 'memory.effects.datePersistence',
    glyphs: ['6×', '☕'],
    durationMs: 1_150,
  },
  'switch-whiplash': {
    labelKey: 'memory.effects.switching',
    glyphs: ['↔', '?!'],
    durationMs: 1_250,
  },
};

export const effectDuration = (effectId: ContextualEffectId, reducedMotion: boolean) =>
  reducedMotion ? 420 : contextualEffects[effectId].durationMs;
