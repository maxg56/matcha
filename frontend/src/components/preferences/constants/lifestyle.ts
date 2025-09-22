export const LIFESTYLE_OPTIONS = {
  smoking: [
    { value: 'any', label: 'Peu importe' },
    { value: 'smoker', label: 'Fumeur' },
    { value: 'non_smoker', label: 'Non-fumeur' }
  ],
  alcohol: [
    { value: 'any', label: 'Peu importe' },
    { value: 'drinker', label: 'Boit de l\'alcool' },
    { value: 'non_drinker', label: 'Ne boit pas' }
  ],
  drugs: [
    { value: 'any', label: 'Peu importe' },
    { value: 'user', label: 'Consomme' },
    { value: 'non_user', label: 'Ne consomme pas' }
  ],
  cannabis: [
    { value: 'any', label: 'Peu importe' },
    { value: 'user', label: 'Consomme' },
    { value: 'non_user', label: 'Ne consomme pas' }
  ]
} as const;

export type LifestyleType = keyof typeof LIFESTYLE_OPTIONS;
export type LifestyleValue = typeof LIFESTYLE_OPTIONS[LifestyleType][number]['value'];