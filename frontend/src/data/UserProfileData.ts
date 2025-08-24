export interface UserProfile {
  // Basic info
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  age: number;
  height: number;
  
  // Physical attributes
  hairColor: string;
  skinColor: string;
  eyeColor: string;
  
  // Lifestyle
  alcoholConsumption: string;
  smoking: string;
  cannabis: string;
  drugs: string;
  pets: string;
  
  // Social & Activity
  socialActivityLevel: string;
  sportActivity: string;
  educationLevel: string;
  
  // Personal info
  personalOpinion: string;
  bio: string;
  birthCity: string;
  currentCity: string;
  job: string;
  religion: string;
  relationshipType: string;
  childrenStatus: string;
  childrenDetails: string;
  zodiacSign: string;
  politicalView: string;
  
  // Profile settings
  gender: string;
  sexPref: string;
  
  // Tags
  tags: string[];
  
  // Profile
  avatar: string;
  photos: string[];
}

export const mockUser: UserProfile = {
  username: 'alex_martin',
  firstName: 'Alex',
  lastName: 'Martin',
  email: 'alex.martin@example.com',
  birthDate: '1997-03-15',
  age: 26,
  height: 175,
  hairColor: 'brown',
  skinColor: 'white',
  eyeColor: 'blue',
  alcoholConsumption: 'sometimes',
  smoking: 'no',
  cannabis: 'no',
  drugs: 'no',
  pets: 'yes',
  socialActivityLevel: 'medium',
  sportActivity: 'high',
  educationLevel: 'master',
  personalOpinion: 'Optimiste et toujours prêt pour de nouvelles aventures',
  bio: 'Passionné de tech et de sport, j\'adore découvrir de nouveaux endroits et rencontrer des gens interessants.',
  birthCity: 'Lyon',
  currentCity: 'Paris',
  job: 'Développeur Full Stack',
  religion: 'atheism',
  relationshipType: 'long_term',
  childrenStatus: 'no',
  childrenDetails: '',
  zodiacSign: 'Poissons',
  politicalView: 'center',
  gender: 'man',
  sexPref: 'woman',
  tags: ['🌍 Voyage', '🍳 Cuisine', '🚴 Sport', '🎮 Jeux vidéo', '📚 Lecture'],
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  photos: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop'
  ]
};