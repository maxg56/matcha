// Test file to demonstrate registration API integration

import type { RegistrationData } from '../types/registration';
import type { RegisterRequest } from '../services/auth';

export function transformRegistrationData(formData: RegistrationData): RegisterRequest {
  return {
    // Basic auth data required by auth service
    username: formData.username,
    email: formData.email,
    password: formData.password,
    first_name: formData.firstName,
    last_name: formData.lastName,
    birth_date: formData.birthDate,
    gender: formData.gender,
    sex_pref: formData.sexPref,
    
    // Extended profile data - now flat in RegisterRequest
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
    relationship_type: formData.relationshipType,
    children_status: formData.childrenStatus,
    political_view: formData.politicalView,
    tags: formData.tags
  };
}


function validPassword(password: string , password_valide :string): boolean {
  if (!password || !password_valide) {
    return false;
  }
  if (password !== password_valide) {
    return false;
  }
  // Example validation: at least 8 characters, 1 uppercase letter, 1 number
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return passwordRegex.test(password);
}

export function validateRegistrationPayload(data: RegisterRequest): string[] {
  const errors: string[] = [];
  
  // Validate required basic fields
  if (!data.username) errors.push('Username is required');
  if (!data.email) errors.push('Email is required');
  if (!data.password) errors.push('Password is required');
  if (!data.first_name) errors.push('First name is required');
  if (!data.last_name) errors.push('Last name is required');
  if (!data.birth_date) errors.push('Birth date is required');
  if (!data.gender) errors.push('Gender is required');
  if (!data.sex_pref) errors.push('Sexual preference is required');
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.email && !emailRegex.test(data.email)) {
    errors.push('Invalid email format');
  }
  
  // Validate password strength
  if (data.password && !validPassword(data.password, data.password)) {
    errors.push('Password must be at least 8 characters, 1 uppercase letter, and 1 number');
  }
  
  // Validate age (18+)
  if (data.birth_date) {
    const birthDate = new Date(data.birth_date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 18) errors.push('Must be at least 18 years old');
  }

  
  return errors;
}