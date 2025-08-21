import { MapIcon } from "lucide-react";

interface TextInputProps {
  field: string;
  label: string;
  placeholder: string;
  type?: string;
  currentValue: string;
  editingSection: boolean;
  onChange: (field: string, value: string) => void;
  button?: boolean;
  onButtonClick?: () => void;
}

export function TextInput({ 
  field, 
  label, 
  placeholder,
  type = "text",
  currentValue,
  editingSection,
  onChange,
  button = false,
  onButtonClick
}: TextInputProps) {
  return (
    <div className="p-4 border-b border-border last:border-b-0 flex flex-col gap-2">
      <h3 className="font-medium text-foreground mb-2">{label}</h3>
      {editingSection ? (
        <div className="flex items-center gap-2">
          <input
            type={type}
            value={currentValue || ''}
            onChange={(e) => onChange(field, e.target.value)}
            placeholder={placeholder}
            className="flex-1 p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {button && onButtonClick && (
            <button 
              type="button" 
              onClick={onButtonClick} 
              className="p-2 bg-primary text-white rounded-lg hover:bg-primary/80"
            >
              <MapIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      ) : (
        <p className="text-foreground">
          {currentValue || <span className="text-muted-foreground italic">{placeholder}</span>}
        </p>
      )}
    </div>
  );
}
