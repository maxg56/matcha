import { useState } from 'react';

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
  const [expanded, setExpanded] = useState(false);
  const isLongText = currentValue && currentValue.length > 150;

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
        <div className="text-foreground">
          {currentValue ? (
            <div>
              <p className="whitespace-pre-wrap">
                {expanded || !isLongText ? currentValue : `${currentValue.slice(0, 150)}...`}
              </p>
              {isLongText && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-primary hover:text-primary/80 text-sm font-medium mt-2 block"
                >
                  {expanded ? 'Voir moins' : 'Voir plus'}
                </button>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground italic">{placeholder}</span>
          )}
        </div>
      )}
      {maxLength && editingSection && (
        <p className="text-xs text-muted-foreground mt-1">
          {(currentValue || '').length} / {maxLength}
        </p>
      )}
    </div>
  );
}