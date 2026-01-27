import { InputField } from '../InputField';
import { SelectField } from '../SelectField';
import { fieldOptions } from '@/types/registration';
import { useFieldValidation } from '@/hooks/useFieldValidation';
import type { RegistrationData, FieldValidationErrors } from '@/types/registration';

interface AccountStepProps {
  formData: RegistrationData;
  errors: FieldValidationErrors;
  updateField: <K extends keyof RegistrationData>(field: K, value: RegistrationData[K]) => void;
}

export function AccountStep({ formData, errors, updateField }: AccountStepProps) {
  const { createFieldBlurHandler } = useFieldValidation();

  return (
    <div className="space-y-6">
      <InputField
        label="Pseudo"
        value={formData.username}
        onChange={(value) => updateField('username', value)}
        onBlur={createFieldBlurHandler('username')}
        placeholder="@votre_pseudo"
        error={errors.username}
        helpText="3-20 caractères : lettres, chiffres, tirets et underscores uniquement"
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <InputField
          label="Prénom"
          value={formData.firstName}
          onChange={(value) => updateField('firstName', value)}
          onBlur={createFieldBlurHandler('firstName')}
          placeholder="Votre prénom"
          error={errors.firstName}
          helpText="Minimum 2 caractères"
          required
        />

        <InputField
          label="Nom"
          value={formData.lastName}
          onChange={(value) => updateField('lastName', value)}
          onBlur={createFieldBlurHandler('lastName')}
          placeholder="Votre nom"
          error={errors.lastName}
          helpText="Minimum 2 caractères"
          required
        />
      </div>

      <InputField
        label="Email"
        type="email"
        value={formData.email}
        onChange={(value) => updateField('email', value)}
        onBlur={createFieldBlurHandler('email')}
        placeholder="votre.email@exemple.com"
        error={errors.email}
        helpText="Vous recevrez un code de vérification à cette adresse"
        required
      />

      <InputField
        label="Mot de passe"
        type="password"
        value={formData.password}
        onChange={(value) => updateField('password', value)}
        onBlur={createFieldBlurHandler('password')}
        placeholder="Votre mot de passe"
        error={errors.password}
        helpText="Minimum 8 caractères avec majuscule, minuscule et chiffre"
        required
      />

      <InputField
        label="Confirmer le mot de passe"
        type="password"
        value={formData.confirmPassword}
        onChange={(value) => updateField('confirmPassword', value)}
        onBlur={createFieldBlurHandler('confirmPassword')}
        placeholder="Confirmez votre mot de passe"
        error={errors.confirmPassword}
        required
      />

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Informations de base</h3>
        
        <div className="space-y-4">
          <InputField
            label="Date de naissance"
            type="date"
            value={formData.birthDate}
            onChange={(value) => updateField('birthDate', value)}
            onBlur={createFieldBlurHandler('birthDate')}
            error={errors.birthDate}
            helpText="Vous devez avoir au moins 18 ans"
            required
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