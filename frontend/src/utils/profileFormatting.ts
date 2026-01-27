export type FormatType = 'yes_no' | 'yes_sometimes_no' | 'capitalize' | 'default';

export function formatValue(value: string | number | boolean | null | undefined, type: FormatType = 'default'): string | null {
  if (!value && value !== 0 && value !== false) return null;

  const stringValue = String(value);

  switch (type) {
    case 'yes_no':
      return stringValue === 'yes' ? 'Oui' : stringValue === 'no' ? 'Non' : stringValue;
    case 'yes_sometimes_no':
      return stringValue === 'yes' ? 'Oui' : stringValue === 'sometimes' ? 'Parfois' : stringValue === 'no' ? 'Non' : stringValue;
    case 'capitalize':
      return stringValue.charAt(0).toUpperCase() + stringValue.slice(1);
    default:
      return stringValue;
  }
}