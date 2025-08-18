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


interface ActivityStepProps {
  formData: RegistrationData;
  errors: FieldValidationErrors;
  updateField: <K extends keyof RegistrationData>(field: K, value: RegistrationData[K]) => void;
}

export function ActivityStep({ formData, errors, updateField }: ActivityStepProps) {
  return (
    <div className="space-y-6">
      <SelectField
        label="Niveau d'activité sociale"
        value={formData.socialActivityLevel}
        onChange={(value) => updateField('socialActivityLevel', value)}
        options={fieldOptions.activityLevel}
        columns={3}
        error={errors.socialActivityLevel}
      />

      <SelectField
        label="Activité sportive"
        value={formData.sportActivity}
        onChange={(value) => updateField('sportActivity', value)}
        options={fieldOptions.activityLevel}
        columns={3}
        error={errors.sportActivity}
      />

      <SelectField
        label="Niveau d'éducation"
        value={formData.educationLevel}
        onChange={(value) => updateField('educationLevel', value)}
        options={fieldOptions.educationLevel}
        error={errors.educationLevel}
      />
    </div>
  );
}