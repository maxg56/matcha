import { HeightSlider } from '../HeightSlider';
import type { RegistrationData, FieldValidationErrors } from '@/types/registration';

interface BasicInfoStepProps {
  formData: RegistrationData;
  errors: FieldValidationErrors;
  updateField: <K extends keyof RegistrationData>(field: K, value: RegistrationData[K]) => void;
}

export function BasicInfoStep({ formData, errors, updateField }: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Informations complémentaires</h2>
        <p className="text-sm text-gray-500">
          Complétez votre profil avec quelques détails supplémentaires
        </p>
      </div>

      <HeightSlider
        label="Taille"
        value={formData.height}
        onChange={(value) => updateField('height', value)}
      />
    </div>
  );
}