interface TextInputProps {
  field: string;
  label: string;
  placeholder: string;
  type?: string;
  currentValue: string;
  editingSection: boolean;
  onChange: (field: string, value: string) => void;
}

export function TextInput({ 
  field, 
  label, 
  placeholder,
  type = "text",
  currentValue,
  editingSection,
  onChange
}: TextInputProps) {
  return (
    <div className="p-4 border-b border-border last:border-b-0">
      <h3 className="font-medium text-foreground mb-2">{label}</h3>
      {editingSection ? (
        <input
          type={type}
          value={currentValue || ''}
          onChange={(e) => onChange(field, e.target.value)}
          placeholder={placeholder}
          className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      ) : (
        <p className="text-foreground">
          {currentValue || <span className="text-muted-foreground italic">{placeholder}</span>}
        </p>
      )}
    </div>
  );
}