import type { RegistrationData, FieldValidationErrors } from '@/types/registration';
import { PasswordValidator } from './passwordValidator';

export class RegistrationValidator {
  /**
   * Valide une étape spécifique de l'inscription
   */
  static validateStep(step: number, formData: RegistrationData, isEmailVerified: boolean): FieldValidationErrors {
    switch (step) {
      case 1: // Étape compte - informations essentielles
        return this.validateAccountStep(formData);
      
      case 2: // Vérification email
        return this.validateEmailVerification(isEmailVerified);
      
      case 3: // Informations de base - optionnel
        return {}; // Pas de validation requise
      
      case 4: // Apparence
        return this.validateAppearanceStep(formData);
      
      case 5: // Style de vie
        return this.validateLifestyleStep(formData);
      
      case 6: // Activité
        return this.validateActivityStep(formData);
      
      case 7: // Personnel
        return this.validatePersonalStep(formData);
      
      case 8: // Centres d'intérêt
        return this.validateInterestsStep(formData);
      
      case 9: // Upload images - optionnel
        return {}; // Pas de validation requise
      
      default:
        return {};
    }
  }

  /**
   * Vérifie si l'utilisateur peut continuer à l'étape suivante
   */
  static canContinueStep(step: number, formData: RegistrationData, isEmailVerified: boolean): boolean {
    const errors = this.validateStep(step, formData, isEmailVerified);
    return Object.keys(errors).length === 0;
  }

  // Validations spécifiques par étape
  private static validateAccountStep(formData: RegistrationData): FieldValidationErrors {
    const errors: FieldValidationErrors = {};
    
    // Champs obligatoires
    if (!formData.username?.trim()) errors.username = 'Pseudo requis';
    if (!formData.firstName?.trim()) errors.firstName = 'Prénom requis';
    if (!formData.lastName?.trim()) errors.lastName = 'Nom requis';
    if (!formData.email?.trim()) errors.email = 'Email requis';
    
    // Validation email
    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.email = 'Format d\'email invalide';
    }
    
    // Validation mot de passe (stricte pour inscription)
    if (!formData.password) {
      errors.password = 'Mot de passe requis';
    } else {
      const passwordError = PasswordValidator.validateForRegistration(formData.password);
      if (passwordError) errors.password = passwordError;
    }
    
    // Confirmation mot de passe
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirmation du mot de passe requise';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    // Date de naissance et âge
    if (!formData.birthDate) {
      errors.birthDate = 'Date de naissance requise';
    } else {
      const age = this.calculateAge(formData.birthDate);
      if (age < 18) {
        errors.birthDate = 'Vous devez avoir au moins 18 ans';
      }
    }
    
    // Champs de profil obligatoires
    if (!formData.gender?.trim()) errors.gender = 'Genre requis';
    if (!formData.sexPref?.trim()) errors.sexPref = 'Préférence sexuelle requise';
    if (!formData.relationshipType?.trim()) errors.relationshipType = 'Type de relation requis';
    
    return errors;
  }

  private static validateEmailVerification(isEmailVerified: boolean): FieldValidationErrors {
    return isEmailVerified ? {} : { emailVerificationCode: 'Email non vérifié' };
  }

  private static validateAppearanceStep(formData: RegistrationData): FieldValidationErrors {
    const errors: FieldValidationErrors = {};
    
    if (!formData.hairColor) errors.hairColor = 'Couleur de cheveux requise';
    if (!formData.eyeColor) errors.eyeColor = 'Couleur des yeux requise';
    if (!formData.skinColor) errors.skinColor = 'Couleur de peau requise';
    
    if (formData.height < 120 || formData.height > 250) {
      errors.height = 'Taille invalide (entre 120 et 250 cm)';
    }
    
    return errors;
  }

  private static validateLifestyleStep(formData: RegistrationData): FieldValidationErrors {
    const errors: FieldValidationErrors = {};
    
    if (!formData.alcoholConsumption) errors.alcoholConsumption = 'Consommation d\'alcool requise';
    if (!formData.smoking) errors.smoking = 'Tabagisme requis';
    if (!formData.cannabis) errors.cannabis = 'Cannabis requis';
    if (!formData.drugs) errors.drugs = 'Drogues requis';
    
    return errors;
  }

  private static validateActivityStep(formData: RegistrationData): FieldValidationErrors {
    const errors: FieldValidationErrors = {};
    
    if (!formData.socialActivityLevel) errors.socialActivityLevel = 'Niveau d\'activité sociale requis';
    if (!formData.sportActivity) errors.sportActivity = 'Activité sportive requise';
    if (!formData.educationLevel) errors.educationLevel = 'Niveau d\'éducation requis';
    
    return errors;
  }

  private static validatePersonalStep(formData: RegistrationData): FieldValidationErrors {
    const errors: FieldValidationErrors = {};
    
  
    
    if (!formData.birthCity?.trim()) errors.birthCity = 'Ville de naissance requise';
    // if (!formData.currentCity?.trim()) errors.currentCity = 'Ville actuelle requise';
    if (!formData.job?.trim()) errors.job = 'Profession requise';
    if (!formData.religion) errors.religion = 'Religion requise';
    if (!formData.childrenStatus) errors.childrenStatus = 'Statut enfants requis';
    if (!formData.politicalView) errors.politicalView = 'Vue politique requise';
    
    return errors;
  }

  private static validateInterestsStep(formData: RegistrationData): FieldValidationErrors {
    const errors: FieldValidationErrors = {};
    
    if (formData.tags.length < 3) {
      errors.tags = 'Sélectionnez au moins 3 centres d\'intérêt';
    }
    
    return errors;
  }

  /**
   * Calcule l'âge à partir d'une date de naissance
   */
  private static calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Prépare les données pour l'API de création de compte
   */
  static prepareAccountPayload(formData: RegistrationData) {
    return {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      first_name: formData.firstName,
      last_name: formData.lastName,
      birth_date: formData.birthDate,
      gender: formData.gender || 'other',
      sex_pref: formData.sexPref || 'both',
      relationship_type: formData.relationshipType || 'short_term'
    };
  }

  /**
   * Prépare les données pour la mise à jour du profil
   */
  static prepareProfilePayload(formData: RegistrationData): Record<string, any> {
    // Filter and clean tags to ensure they're valid strings
    const cleanTags = formData.tags
      .filter(tag => tag && typeof tag === 'string' && tag.trim().length > 0)
      .map(tag => tag.trim());

    return {
      height: formData.height,
      hair_color: formData.hairColor,
      eye_color: formData.eyeColor,
      skin_color: formData.skinColor,
      alcohol_consumption: formData.alcoholConsumption,
      smoking: formData.smoking,
      cannabis: formData.cannabis,
      drugs: formData.drugs,
      pets: formData.pets,
      social_activity_level: formData.socialActivityLevel,
      sport_activity: formData.sportActivity,
      education_level: formData.educationLevel,
      bio: formData.bio,
      birth_city: formData.birthCity,
      current_city: formData.currentCity,
      job: formData.job,
      religion: formData.religion,
      children_status: formData.childrenStatus,
      political_view: formData.politicalView,
      tags: cleanTags
    };
  }
}