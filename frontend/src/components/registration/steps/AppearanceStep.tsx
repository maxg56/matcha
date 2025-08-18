import { SelectField } from '../SelectField';
import { fieldOptions } from '@/types/registration';

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


interface AppearanceStepProps {
  formData: RegistrationData;
  errors: FieldValidationErrors;
  updateField: <K extends keyof RegistrationData>(field: K, value: RegistrationData[K]) => void;
}

export function AppearanceStep({ formData, errors, updateField }: AppearanceStepProps) {
  return (
    <div className="space-y-6">
      <SelectField
        label="Couleur des cheveux"
        value={formData.hairColor}
        onChange={(value) => updateField('hairColor', value)}
        options={fieldOptions.hairColor}
        columns={3}
        error={errors.hairColor}
      />

      <SelectField
        label="Couleur des yeux"
        value={formData.eyeColor}
        onChange={(value) => updateField('eyeColor', value)}
        options={fieldOptions.eyeColor}
        columns={3}
        error={errors.eyeColor}
      />

      <SelectField
        label="Couleur de peau"
        value={formData.skinColor}
        onChange={(value) => updateField('skinColor', value)}
        options={fieldOptions.skinColor}
        columns={3}
        error={errors.skinColor}
      />
    </div>
  );
}
