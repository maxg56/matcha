import { InputField } from '../InputField';
import { SelectField } from '../SelectField';
import { HeightSlider } from '../HeightSlider';
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

interface BasicInfoStepProps {
  formData: RegistrationData;
  errors: FieldValidationErrors;
  updateField: <K extends keyof RegistrationData>(field: K, value: RegistrationData[K]) => void;
}

export function BasicInfoStep({ formData, errors, updateField }: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      <InputField
        label="Date de naissance"
        type="date"
        value={formData.birthDate}
        onChange={(value) => updateField('birthDate', value)}
        error={errors.birthDate}
      />

      <SelectField
        label="Genre"
        value={formData.gender}
        onChange={(value) => updateField('gender', value)}
        options={fieldOptions.gender}
        error={errors.gender}
      />

      <SelectField
        label="Intéressé(e) par"
        value={formData.sexPref}
        onChange={(value) => updateField('sexPref', value)}
        options={fieldOptions.sexPref}
        error={errors.sexPref}
      />

      <HeightSlider
        label="Taille"
        value={formData.height}
        onChange={(value) => updateField('height', value)}
      />
    </div>
  );
}