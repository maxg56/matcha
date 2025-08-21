import { InputField } from '../InputField';
import { SelectField } from '../SelectField';
import { HeightSlider } from '../HeightSlider';
import { fieldOptions } from '@/types/registration';
import type { RegistrationData, FieldValidationErrors } from '@/types/registration';

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

      <SelectField
        label="Type de relation recherché"
        value={formData.relationshipType}
        onChange={(value) => updateField('relationshipType', value)}
        options={fieldOptions.relationshipType}
        error={errors.relationshipType}
      />

      <HeightSlider
        label="Taille"
        value={formData.height}
        onChange={(value) => updateField('height', value)}
      />
    </div>
  );
}