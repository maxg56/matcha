import { InputField } from '../InputField';
import { SelectField } from '../SelectField';
import { TextAreaField } from '../TextAreaField';
import { fieldOptions } from '@/types/registration';
import type { RegistrationData, FieldValidationErrors } from '@/types/registration';


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
      />

        <InputField
          label="Ville de naissance"
          value={formData.birthCity}
          onChange={(value) => updateField('birthCity', value)}
          placeholder="Votre ville de naissance"
          error={errors.birthCity}
        />

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