interface TextAreaProps {
  field: string;
  label: string;
  placeholder: string;
  maxLength?: number;
  currentValue: string;
  editingSection: boolean;
  onChange: (field: string, value: string) => void;
}

export function TextArea({
  field,
  label,
  placeholder,
  maxLength,
  currentValue,
  editingSection,
  onChange
}: TextAreaProps) {
  return (
    <div className="p-4 border-b border-border last:border-b-0">
      <h3 className="font-medium text-foreground mb-2">{label}</h3>
      {editingSection ? (
        <textarea
          value={currentValue || ''}
          onChange={(e) => onChange(field, e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          rows={3}
        />
      ) : (
        <p className="text-foreground">
          {currentValue || <span className="text-muted-foreground italic">{placeholder}</span>}
        </p>
      )}
      {maxLength && editingSection && (
        <p className="text-xs text-muted-foreground mt-1">
          {(currentValue || '').length} / {maxLength}
        </p>
      )}
    </div>
  );
}
