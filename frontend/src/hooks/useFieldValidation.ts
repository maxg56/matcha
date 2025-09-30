import { useCallback } from 'react';
import { useRegistrationStore } from '@/stores/registrationStore';
import { RegistrationValidator } from '@/utils/registrationValidator';
import type { RegistrationData } from '@/types/registration';

/**
 * Hook pour la validation en temps réel des champs d'inscription
 */
export function useFieldValidation() {
  const { formData, setErrors, errors } = useRegistrationStore();

  /**
   * Valide un champ spécifique et met à jour les erreurs
   */
  const validateField = useCallback((fieldName: keyof RegistrationData, value: string | string[]) => {
    const newErrors = { ...errors };

    // Validation selon le type de champ
    switch (fieldName) {
      case 'username':
        if (!value || (typeof value === 'string' && value.trim().length < 3)) {
          newErrors.username = '👤 Le pseudo doit contenir au moins 3 caractères';
        } else if (typeof value === 'string' && value.length > 20) {
          newErrors.username = '📏 Le pseudo ne peut pas dépasser 20 caractères';
        } else if (typeof value === 'string' && !/^[a-zA-Z0-9_-]+$/.test(value)) {
          newErrors.username = '❌ Seules les lettres, chiffres, tirets et underscores sont autorisés';
        } else {
          delete newErrors.username;
        }
        break;

      case 'email':
        if (!value || typeof value !== 'string') {
          newErrors.email = '📧 L\'email est requis';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = '❌ Format d\'email invalide (exemple: nom@domaine.com)';
        } else {
          delete newErrors.email;
        }
        break;

      case 'password':
        if (!value || typeof value !== 'string') {
          newErrors.password = '🔒 Le mot de passe est requis';
        } else if (value.length < 8) {
          newErrors.password = '📏 Le mot de passe doit contenir au moins 8 caractères';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          newErrors.password = '🔒 Doit contenir : minuscule, majuscule et chiffre';
        } else {
          delete newErrors.password;
        }
        break;

      case 'confirmPassword':
        if (!value || typeof value !== 'string') {
          newErrors.confirmPassword = '🔄 Confirmez votre mot de passe';
        } else if (value !== formData.password) {
          newErrors.confirmPassword = '❌ Les mots de passe ne correspondent pas';
        } else {
          delete newErrors.confirmPassword;
        }
        break;

      case 'firstName':
        if (!value || (typeof value === 'string' && value.trim().length < 2)) {
          newErrors.firstName = '👤 Le prénom doit contenir au moins 2 caractères';
        } else if (typeof value === 'string' && value.length > 50) {
          newErrors.firstName = '📏 Le prénom ne peut pas dépasser 50 caractères';
        } else if (typeof value === 'string' && !/^[a-zA-ZÀ-ÿ\s-']+$/.test(value)) {
          newErrors.firstName = '❌ Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes';
        } else {
          delete newErrors.firstName;
        }
        break;

      case 'lastName':
        if (!value || (typeof value === 'string' && value.trim().length < 2)) {
          newErrors.lastName = '👤 Le nom doit contenir au moins 2 caractères';
        } else if (typeof value === 'string' && value.length > 50) {
          newErrors.lastName = '📏 Le nom ne peut pas dépasser 50 caractères';
        } else if (typeof value === 'string' && !/^[a-zA-ZÀ-ÿ\s-']+$/.test(value)) {
          newErrors.lastName = '❌ Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes';
        } else {
          delete newErrors.lastName;
        }
        break;

      case 'birthDate':
        if (!value || typeof value !== 'string') {
          newErrors.birthDate = '📅 La date de naissance est requise';
        } else {
          const birthDate = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();

          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            // L'anniversaire n'est pas encore passé cette année
          }

          if (age < 18) {
            newErrors.birthDate = '🎂 Vous devez avoir au moins 18 ans';
          } else if (age > 100) {
            newErrors.birthDate = '📅 Veuillez vérifier votre date de naissance';
          } else {
            delete newErrors.birthDate;
          }
        }
        break;

      case 'gender':
        if (!value || typeof value !== 'string' || value === '') {
          newErrors.gender = '⚧ Veuillez sélectionner votre genre';
        } else {
          delete newErrors.gender;
        }
        break;

      case 'sexPref':
        if (!value || typeof value !== 'string' || value === '') {
          newErrors.sexPref = '💝 Veuillez indiquer vos préférences de rencontre';
        } else {
          delete newErrors.sexPref;
        }
        break;

      case 'relationshipType':
        if (!value || typeof value !== 'string' || value === '') {
          newErrors.relationshipType = '💕 Veuillez indiquer le type de relation recherché';
        } else {
          delete newErrors.relationshipType;
        }
        break;

      default:
        // Pour les autres champs, on supprime l'erreur s'ils ont une valeur
        if (value && value !== '') {
          delete newErrors[fieldName];
        }
        break;
    }

    setErrors(newErrors);
  }, [formData, errors, setErrors]);

  /**
   * Crée une fonction onBlur pour un champ spécifique
   */
  const createFieldBlurHandler = useCallback((fieldName: keyof RegistrationData) => {
    return () => {
      const value = formData[fieldName];
      validateField(fieldName, value);
    };
  }, [formData, validateField]);

  /**
   * Valide plusieurs champs à la fois
   */
  const validateFields = useCallback((fieldNames: (keyof RegistrationData)[]) => {
    fieldNames.forEach(fieldName => {
      const value = formData[fieldName];
      validateField(fieldName, value);
    });
  }, [formData, validateField]);

  return {
    validateField,
    createFieldBlurHandler,
    validateFields,
  };
}