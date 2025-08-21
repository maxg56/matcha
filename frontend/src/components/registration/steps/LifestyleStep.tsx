import { SelectField } from '../SelectField';
import { fieldOptions } from '@/types/registration';
import type { RegistrationData, FieldValidationErrors } from '@/types/registration';


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