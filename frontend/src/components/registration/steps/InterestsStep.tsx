import { TagSelector } from '../TagSelector';
import { availableTags } from '@/types/registration';

interface RegistrationData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
  gender: string;
  sexPref: string;
  height: number;
  hairColor: string;
  eyeColor: string;
  skinColor: string;
  alcoholConsumption: string;
  smoking: string;
  cannabis: string;
  drugs: string;
  pets: string;
  socialActivityLevel: string;
  sportActivity: string;
  educationLevel: string;
  bio: string;
  birthCity: string;
  currentCity: string;
  job: string;
  religion: string;
  relationshipType: string;
  childrenStatus: string;
  politicalView: string;
  tags: string[];
}

interface FieldValidationErrors {
  [key: string]: string;
}


interface InterestsStepProps {
  formData: RegistrationData;
  errors: FieldValidationErrors;
  toggleTag: (tag: string) => void;
}

export function InterestsStep({ formData, errors, toggleTag }: InterestsStepProps) {
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
