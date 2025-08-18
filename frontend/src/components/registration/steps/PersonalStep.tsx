import { InputField } from '../InputField';
import { SelectField } from '../SelectField';
import { TextAreaField } from '../TextAreaField';
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


interface PersonalStepProps {
  formData: RegistrationData;
  errors: FieldValidationErrors;
  updateField: <K extends keyof RegistrationData>(field: K, value: RegistrationData[K]) => void;
}

export function PersonalStep({ formData, errors, updateField }: PersonalStepProps) {
  return (
    <div className="space-y-6">
      <TextAreaField
        label="Bio"
        value={formData.bio}
        onChange={(value) => updateField('bio', value)}
        placeholder="Parlez-nous de vous..."
        error={errors.bio}
      />

      <div className="grid grid-cols-2 gap-4">
        <InputField
          label="Ville de naissance"
          value={formData.birthCity}
          onChange={(value) => updateField('birthCity', value)}
          placeholder="Votre ville de naissance"
          error={errors.birthCity}
        />

        <InputField
          label="Ville actuelle"
          value={formData.currentCity}
          onChange={(value) => updateField('currentCity', value)}
          placeholder="Votre ville actuelle"
          error={errors.currentCity}
        />
      </div>

      <InputField
        label="Profession"
        value={formData.job}
        onChange={(value) => updateField('job', value)}
        placeholder="Votre profession"
        error={errors.job}
      />

      <SelectField
        label="Religion"
        value={formData.religion}
        onChange={(value) => updateField('religion', value)}
        options={fieldOptions.religion}
        columns={3}
        error={errors.religion}
      />

      <SelectField
        label="Type de relation recherchée"
        value={formData.relationshipType}
        onChange={(value) => updateField('relationshipType', value)}
        options={fieldOptions.relationshipType}
        error={errors.relationshipType}
      />

      <SelectField
        label="Situation avec les enfants"
        value={formData.childrenStatus}
        onChange={(value) => updateField('childrenStatus', value)}
        options={fieldOptions.childrenStatus}
        columns={3}
        error={errors.childrenStatus}
      />

      <SelectField
        label="Orientation politique"
        value={formData.politicalView}
        onChange={(value) => updateField('politicalView', value)}
        options={fieldOptions.politicalView}
        error={errors.politicalView}
      />
    </div>
  );
}
