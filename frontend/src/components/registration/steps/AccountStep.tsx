import { InputField } from '../InputField';
import { SelectField } from '../SelectField';
import { fieldOptions } from '@/types/registration';
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

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Informations de base</h3>
        
        <div className="space-y-4">
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
        </div>
      </div>
    </div>
  );
}