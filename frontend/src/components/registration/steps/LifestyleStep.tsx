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


interface LifestyleStepProps {
  formData: RegistrationData;
  errors: FieldValidationErrors;
  updateField: <K extends keyof RegistrationData>(field: K, value: RegistrationData[K]) => void;
}

export function LifestyleStep({ formData, errors, updateField }: LifestyleStepProps) {
  return (
    <div className="space-y-6">
      <SelectField
        label="Consommation d'alcool"
        value={formData.alcoholConsumption}
        onChange={(value) => updateField('alcoholConsumption', value)}
        options={fieldOptions.lifestyle}
        columns={3}
        error={errors.alcoholConsumption}
      />

      <SelectField
        label="Tabac"
        value={formData.smoking}
        onChange={(value) => updateField('smoking', value)}
        options={fieldOptions.lifestyle}
        columns={3}
        error={errors.smoking}
      />

      <SelectField
        label="Cannabis"
        value={formData.cannabis}
        onChange={(value) => updateField('cannabis', value)}
        options={fieldOptions.lifestyle}
        columns={3}
        error={errors.cannabis}
      />

      <SelectField
        label="Autres drogues"
        value={formData.drugs}
        onChange={(value) => updateField('drugs', value)}
        options={fieldOptions.lifestyle}
        columns={3}
        error={errors.drugs}
      />

      <SelectField
        label="Animaux de compagnie"
        value={formData.pets}
        onChange={(value) => updateField('pets', value)}
        options={fieldOptions.pets}
        error={errors.pets}
      />
    </div>
  );
}