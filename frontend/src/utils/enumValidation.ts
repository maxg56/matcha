// Enum validation utilities for registration

// Valid enum values based on database schema
export const VALID_ENUMS = {
  yes_no: ['yes', 'no'] as const,
  yes_no_sometimes: ['yes', 'no', 'sometimes'] as const,
  activity_level: ['low', 'medium', 'high'] as const,
  education_level: ['high_school', 'bachelor', 'master', 'doctorate'] as const,
  gender: ['man', 'woman', 'other'] as const,
  sex_preference: ['man', 'woman', 'both', 'other'] as const,
  religion: ['christianity', 'islam', 'hinduism', 'buddhism', 'atheism', 'other'] as const,
  relationship_type: ['friendship', 'short_term', 'long_term', 'life'] as const,
  children_status: ['yes', 'no', 'other'] as const,
  political_view: ['left', 'center', 'right', 'apolitical'] as const,
  hair_color: ['black', 'brown', 'blonde', 'red', 'gray', 'white'] as const,
  eye_color: ['brown', 'blue', 'green', 'hazel', 'gray', 'black'] as const,
  skin_color: ['white', 'black', 'brown', 'yellow', 'olive'] as const,
} as const;

// Type definitions for enum values
export type YesNoEnum = typeof VALID_ENUMS.yes_no[number];
export type YesNoSometimesEnum = typeof VALID_ENUMS.yes_no_sometimes[number];
export type ActivityLevelEnum = typeof VALID_ENUMS.activity_level[number];
export type EducationLevelEnum = typeof VALID_ENUMS.education_level[number];
export type GenderEnum = typeof VALID_ENUMS.gender[number];
export type SexPreferenceEnum = typeof VALID_ENUMS.sex_preference[number];
export type ReligionEnum = typeof VALID_ENUMS.religion[number];
export type RelationshipTypeEnum = typeof VALID_ENUMS.relationship_type[number];
export type ChildrenStatusEnum = typeof VALID_ENUMS.children_status[number];
export type PoliticalViewEnum = typeof VALID_ENUMS.political_view[number];
export type HairColorEnum = typeof VALID_ENUMS.hair_color[number];
export type EyeColorEnum = typeof VALID_ENUMS.eye_color[number];
export type SkinColorEnum = typeof VALID_ENUMS.skin_color[number];

// Default values for each enum type
export const DEFAULT_ENUM_VALUES = {
  alcohol_consumption: 'no' as YesNoSometimesEnum,
  smoking: 'no' as YesNoSometimesEnum,
  cannabis: 'no' as YesNoSometimesEnum,
  drugs: 'no' as YesNoSometimesEnum,
  pets: 'no' as YesNoEnum,
  social_activity_level: 'medium' as ActivityLevelEnum,
  sport_activity: 'medium' as ActivityLevelEnum,
  education_level: 'bachelor' as EducationLevelEnum,
  religion: 'other' as ReligionEnum,
  relationship_type: 'long_term' as RelationshipTypeEnum,
  children_status: 'no' as ChildrenStatusEnum,
  political_view: 'center' as PoliticalViewEnum,
  hair_color: 'brown' as HairColorEnum,
  eye_color: 'brown' as EyeColorEnum,
  skin_color: 'white' as SkinColorEnum,
  gender: 'man' as GenderEnum,
  sex_pref: 'woman' as SexPreferenceEnum,
} as const;

// Validation function to ensure enum values are valid
export function validateEnumValue<T extends keyof typeof VALID_ENUMS>(
  enumType: T,
  value: string
): value is typeof VALID_ENUMS[T][number] {
  return (VALID_ENUMS[enumType] as readonly string[]).includes(value);
}

// Function to get a valid enum value or return default
export function getValidEnumValue<T extends keyof typeof DEFAULT_ENUM_VALUES>(
  field: T,
  value: string
): typeof DEFAULT_ENUM_VALUES[T] {
  // Map field names to enum types
  const enumTypeMap: Record<string, keyof typeof VALID_ENUMS> = {
    alcohol_consumption: 'yes_no_sometimes',
    smoking: 'yes_no_sometimes',
    cannabis: 'yes_no_sometimes',
    drugs: 'yes_no_sometimes',
    pets: 'yes_no',
    social_activity_level: 'activity_level',
    sport_activity: 'activity_level',
    education_level: 'education_level',
    religion: 'religion',
    relationship_type: 'relationship_type',
    children_status: 'children_status',
    political_view: 'political_view',
    hair_color: 'hair_color',
    eye_color: 'eye_color',
    skin_color: 'skin_color',
    gender: 'gender',
    sex_pref: 'sex_preference',
  };

  const enumType = enumTypeMap[field];
  
  if (enumType && validateEnumValue(enumType, value)) {
    return value as typeof DEFAULT_ENUM_VALUES[T];
  }
  
  return DEFAULT_ENUM_VALUES[field];
}

// Function to sanitize registration data for API
export function sanitizeRegistrationData(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...data };
  
  // Ensure all enum fields have valid values
  const enumFields = Object.keys(DEFAULT_ENUM_VALUES) as Array<keyof typeof DEFAULT_ENUM_VALUES>;
  
  enumFields.forEach(field => {
    if (field in sanitized) {
      const value = sanitized[field];
      sanitized[field] = getValidEnumValue(field, typeof value === 'string' ? value : '');
    }
  });
  
  // Remove empty strings for required fields
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] === '' && enumFields.includes(key as keyof typeof DEFAULT_ENUM_VALUES)) {
      const enumField = key as keyof typeof DEFAULT_ENUM_VALUES;
      sanitized[key] = DEFAULT_ENUM_VALUES[enumField];
    }
  });
  
  return sanitized;
}

// Validation errors for invalid enum values
export function validateRegistrationEnums(data: Record<string, unknown>): string[] {
  const errors: string[] = [];
  
  // Check required enum fields
  const requiredEnumFields: Array<keyof typeof DEFAULT_ENUM_VALUES> = [
    'alcohol_consumption',
    'smoking', 
    'cannabis',
    'drugs',
    'pets',
    'social_activity_level',
    'sport_activity',
    'education_level',
    'religion',
    'relationship_type',
    'children_status',
    'political_view'
  ];
  
  requiredEnumFields.forEach(field => {
    const value = data[field];
    if (!value || value === '') {
      errors.push(`${field} is required`);
    } else {
      const stringValue = typeof value === 'string' ? value : String(value);
      const validValue = getValidEnumValue(field, stringValue);
      if (validValue !== stringValue) {
        errors.push(`Invalid value for ${field}: ${stringValue}`);
      }
    }
  });
  
  return errors;
}