import { TagSelector } from '../TagSelector';
import { availableTags } from '@/types/registration';
import type { RegistrationData, FieldValidationErrors } from '@/types/registration';


interface InterestsStepProps {
  formData: RegistrationData;
  errors: FieldValidationErrors;
  toggleTag: (tag: string) => void;
}

export function InterestsStep({ formData, toggleTag }: InterestsStepProps) {
  return (
    <div className="space-y-6">
      <TagSelector
        label="Centres d'intérêt"
        description="Sélectionnez vos centres d'intérêt pour que les autres puissent mieux vous connaître"
        selectedTags={formData.tags}
        availableTags={availableTags}
        onToggleTag={toggleTag}
      />
    </div>
  );
}