export const RELIGION_OPTIONS = [
  { value: 'any', label: 'Peu importe' },
  { value: 'same', label: 'Même religion' },
  { value: 'different', label: 'Religion différente' }
] as const;

export const COMMON_RELIGIONS = [
  'Christianity', 'Islam', 'Judaism', 'Buddhism', 'Hinduism',
  'Atheism', 'Agnosticism', 'Sikhism', 'Other'
] as const;

export type ReligionPreferenceValue = typeof RELIGION_OPTIONS[number]['value'];
export type ReligionValue = typeof COMMON_RELIGIONS[number];