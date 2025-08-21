import { SelectField } from '../SelectField';
import { fieldOptions } from '@/types/registration';
import type { RegistrationData, FieldValidationErrors } from '@/types/registration';


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