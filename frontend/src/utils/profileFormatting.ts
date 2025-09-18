export type FormatType = 'yes_no' | 'yes_sometimes_no' | 'capitalize' | 'default';

export function formatValue(value: any, type: FormatType = 'default'): string | null {
  if (!value) return null;

  switch (type) {
    case 'yes_no':
      return value === 'yes' ? 'Oui' : value === 'no' ? 'Non' : value;
    case 'yes_sometimes_no':
      return value === 'yes' ? 'Oui' : value === 'sometimes' ? 'Parfois' : value === 'no' ? 'Non' : value;
    case 'capitalize':
      return value.charAt(0).toUpperCase() + value.slice(1);
    default:
      return value;
  }
}