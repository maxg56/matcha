interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
  error?: string;
  className?: string;
}

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  maxLength = 400,
  rows = 3,
  error,
  className
}: TextAreaFieldProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
        rows={rows}
        placeholder={placeholder}
        maxLength={maxLength}
      />
      <p className="text-xs text-gray-500 mt-1">{value.length}/{maxLength}</p>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
