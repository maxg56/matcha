import { InputField } from '../InputField';
import type { RegistrationData, FieldValidationErrors } from '@/types/registration';

interface AccountStepProps {
  formData: RegistrationData;
  errors: FieldValidationErrors;
  updateField: <K extends keyof RegistrationData>(field: K, value: RegistrationData[K]) => void;
}

export function AccountStep({ formData, errors, updateField }: AccountStepProps) {
  return (
    <div className="space-y-6">
      <InputField
        label="Pseudo"
        value={formData.username}
        onChange={(value) => updateField('username', value)}
        placeholder="@votre_pseudo"
        error={errors.username}
      />

      <div className="grid grid-cols-2 gap-4">
        <InputField
          label="Prénom"
          value={formData.firstName}
          onChange={(value) => updateField('firstName', value)}
          placeholder="Votre prénom"
          error={errors.firstName}
        />

        <InputField
          label="Nom"
          value={formData.lastName}
          onChange={(value) => updateField('lastName', value)}
          placeholder="Votre nom"
          error={errors.lastName}
        />
      </div>

      <InputField
        label="Email"
        type="email"
        value={formData.email}
        onChange={(value) => updateField('email', value)}
        placeholder="votre.email@exemple.com"
        error={errors.email}
      />

      <InputField
        label="Mot de passe"
        type="password"
        value={formData.password}
        onChange={(value) => updateField('password', value)}
        placeholder="Votre mot de passe"
        error={errors.password}
      />

      <InputField
        label="Confirmer le mot de passe"
        type="password"
        value={formData.confirmPassword}
        onChange={(value) => updateField('confirmPassword', value)}
        placeholder="Confirmez votre mot de passe"
        error={errors.confirmPassword}
      />
    </div>
  );
}