import { formatValue, type FormatType } from '../../utils/profileFormatting';

interface InfoCardProps {
  icon: string;
  label: string;
  value: string | number | boolean | null | undefined;
  formatType?: FormatType;
}

export function InfoCard({ icon, label, value, formatType }: InfoCardProps) {
  const formattedValue = formatValue(value, formatType);

  if (!formattedValue) {
    return null;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
        <span>{icon}</span> {label}
      </span>
      <p className="text-gray-900 dark:text-white font-medium">
        {formattedValue}
      </p>
    </div>
  );
}