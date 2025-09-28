export const AVAILABLE_GENDERS = [
  { value: 'man', label: 'Homme' },
  { value: 'woman', label: 'Femme' },
  { value: 'other', label: 'Autre' }
] as const;

export type GenderValue = typeof AVAILABLE_GENDERS[number]['value'];