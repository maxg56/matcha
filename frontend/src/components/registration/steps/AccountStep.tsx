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
        success={!errors.username && formData.username.length >= 3}
        helpText="Votre pseudo doit être unique et contenir au moins 3 caractères"
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <InputField
          label="Prénom"
          value={formData.firstName}
          onChange={(value) => updateField('firstName', value)}
          placeholder="Votre prénom"
          error={errors.firstName}
          success={!errors.firstName && formData.firstName.length >= 2}
          required
        />

        <InputField
          label="Nom"
          value={formData.lastName}
          onChange={(value) => updateField('lastName', value)}
          placeholder="Votre nom"
          error={errors.lastName}
          success={!errors.lastName && formData.lastName.length >= 2}
          required
        />
      </div>

      <InputField
        label="Email"
        type="email"
        value={formData.email}
        onChange={(value) => updateField('email', value)}
        placeholder="votre.email@exemple.com"
        error={errors.email}
        success={!errors.email && formData.email.includes('@') && formData.email.includes('.')}
        helpText="Utilisez une adresse email valide que vous consultez régulièrement"
        required
      />

      <InputField
        label="Mot de passe"
        type="password"
        value={formData.password}
        onChange={(value) => updateField('password', value)}
        placeholder="Votre mot de passe"
        error={errors.password}
        success={!errors.password && formData.password.length >= 8}
        helpText="Minimum 8 caractères avec au moins une majuscule et un chiffre"
        required
      />

      <InputField
        label="Confirmer le mot de passe"
        type="password"
        value={formData.confirmPassword}
        onChange={(value) => updateField('confirmPassword', value)}
        placeholder="Confirmez votre mot de passe"
        error={errors.confirmPassword}
        success={!errors.confirmPassword && formData.confirmPassword === formData.password && formData.confirmPassword.length > 0}
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
            error={errors.birthDate}
            success={!errors.birthDate && formData.birthDate !== ''}
            helpText="Vous devez être majeur(e) pour vous inscrire (18 ans minimum)"
            required
          />

          <SelectField
            label="Genre"
            value={formData.gender}
            onChange={(value) => updateField('gender', value)}
            options={fieldOptions.gender}
            error={errors.gender}
            success={!errors.gender && formData.gender !== ''}
            helpText="Cette information aide à vous proposer des profils compatibles"
            required
          />

          <SelectField
            label="Intéressé(e) par"
            value={formData.sexPref}
            onChange={(value) => updateField('sexPref', value)}
            options={fieldOptions.sexPref}
            error={errors.sexPref}
            success={!errors.sexPref && formData.sexPref !== ''}
            helpText="Qui souhaitez-vous rencontrer ?"
            required
          />

          <SelectField
            label="Type de relation recherché"
            value={formData.relationshipType}
            onChange={(value) => updateField('relationshipType', value)}
            options={fieldOptions.relationshipType}
            error={errors.relationshipType}
            success={!errors.relationshipType && formData.relationshipType !== ''}
            helpText="Précisez vos attentes pour de meilleures suggestions"
            required
          />
        </div>
      </div>
    </div>
  );
}