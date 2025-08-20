export interface FilterState {
  ageRange: [number, number];
  distance: number;
  heightRange: [number, number];
  showMe: 'woman' | 'man' | 'both';
  
  // Physical attributes
  hairColors: string[];
  eyeColors: string[];
  skinColors: string[];
  
  // Lifestyle
  alcoholConsumption: string[];
  smoking: string[];
  cannabis: string[];
  drugs: string[];
  pets: string[];
  
  // Social & Activity
  socialActivityLevel: string[];
  sportActivity: string[];
  educationLevel: string[];
  
  // Personal
  religion: string[];
  relationshipType: string[];
  childrenStatus: string[];
  politicalView: string[];
  
  // Location
  birthCity: string;
  currentCity: string;
  
  // Tags
  tags: string[];
}