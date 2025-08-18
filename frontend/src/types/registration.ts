// Types principaux pour l'inscription
export interface RegistrationData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
  gender: string;
  sexPref: string;
  height: number;
  hairColor: string;
  eyeColor: string;
  skinColor: string;
  alcoholConsumption: string;
  smoking: string;
  cannabis: string;
  drugs: string;
  pets: string;
  socialActivityLevel: string;
  sportActivity: string;
  educationLevel: string;
  bio: string;
  birthCity: string;
  currentCity: string;
  job: string;
  religion: string;
  relationshipType: string;
  childrenStatus: string;
  politicalView: string;
  tags: string[];
}

export interface FieldValidationErrors {
  [key: string]: string;
}

export interface FieldValidationErrors {
  field: string;
  message: string;
}


export const defaultRegistrationData: RegistrationData = {
  username: '',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  birthDate: '',
  gender: '',
  sexPref: '',
  height: 170,
  hairColor: '',
  eyeColor: '',
  skinColor: '',
  alcoholConsumption: '',
  smoking: '',
  cannabis: '',
  drugs: '',
  pets: '',
  socialActivityLevel: '',
  sportActivity: '',
  educationLevel: '',
  bio: '',
  birthCity: '',
  currentCity: '',
  job: '',
  religion: '',
  relationshipType: '',
  childrenStatus: '',
  politicalView: '',
  tags: []
};

export const fieldOptions = {
  gender: [
    { value: 'woman', label: 'Femme', icon: '👩' },
    { value: 'man', label: 'Homme', icon: '👨' },
    { value: 'other', label: 'Autre', icon: '🏳️‍⚧️' }
  ],
  sexPref: [
    { value: 'woman', label: 'Femmes', icon: '👩' },
    { value: 'man', label: 'Hommes', icon: '👨' },
    { value: 'both', label: 'Les deux', icon: '👫' },
    { value: 'other', label: 'Autre', icon: '🏳️‍🌈' }
  ],
  hairColor: [
    { value: 'black', label: 'Noirs', icon: '⚫' },
    { value: 'brown', label: 'Bruns', icon: '🤎' },
    { value: 'blonde', label: 'Blonds', icon: '🟡' },
    { value: 'red', label: 'Roux', icon: '🔴' },
    { value: 'gray', label: 'Gris', icon: '⚪' },
    { value: 'white', label: 'Blancs', icon: '⚪' }
  ],
  eyeColor: [
    { value: 'brown', label: 'Marron', icon: '🤎' },
    { value: 'blue', label: 'Bleus', icon: '🔵' },
    { value: 'green', label: 'Verts', icon: '🟢' },
    { value: 'hazel', label: 'Noisette', icon: '🟤' },
    { value: 'gray', label: 'Gris', icon: '⚪' },
    { value: 'black', label: 'Noirs', icon: '⚫' }
  ],
  skinColor: [
    { value: 'white', label: 'Blanche', icon: '🤍' },
    { value: 'black', label: 'Noire', icon: '🖤' },
    { value: 'brown', label: 'Brune', icon: '🤎' },
    { value: 'yellow', label: 'Jaune', icon: '💛' },
    { value: 'olive', label: 'Olive', icon: '🫒' }
  ],
  lifestyle: [
    { value: 'yes', label: 'Oui', icon: '✅' },
    { value: 'sometimes', label: 'Parfois', icon: '🔶' },
    { value: 'no', label: 'Non', icon: '❌' }
  ],
  pets: [
    { value: 'yes', label: 'Oui', icon: '🐕' },
    { value: 'no', label: 'Non', icon: '🚫' }
  ],
  activityLevel: [
    { value: 'low', label: 'Faible', icon: '🛋️' },
    { value: 'medium', label: 'Modéré', icon: '🚶' },
    { value: 'high', label: 'Élevé', icon: '🏃' }
  ],
  educationLevel: [
    { value: 'high_school', label: 'Lycée', icon: '🎓' },
    { value: 'bachelor', label: 'Licence', icon: '📜' },
    { value: 'master', label: 'Master', icon: '🏆' },
    { value: 'doctorate', label: 'Doctorat', icon: '👨‍🎓' }
  ],
  religion: [
    { value: 'christianity', label: 'Christianisme', icon: '✝️' },
    { value: 'islam', label: 'Islam', icon: '☪️' },
    { value: 'hinduism', label: 'Hindouisme', icon: '🕉️' },
    { value: 'buddhism', label: 'Bouddhisme', icon: '☸️' },
    { value: 'atheism', label: 'Athéisme', icon: '🔬' },
    { value: 'other', label: 'Autre', icon: '❓' }
  ],
  relationshipType: [
    { value: 'friendship', label: 'Amitié', icon: '👫' },
    { value: 'short_term', label: 'Court terme', icon: '💕' },
    { value: 'long_term', label: 'Long terme', icon: '💖' },
    { value: 'life', label: 'Vie', icon: '💍' }
  ],
  childrenStatus: [
    { value: 'yes', label: 'Avec enfants', icon: '👶' },
    { value: 'no', label: 'Sans enfants', icon: '🚫' },
    { value: 'other', label: 'Compliqué', icon: '❓' }
  ],
  politicalView: [
    { value: 'left', label: 'Gauche', icon: '⬅️' },
    { value: 'center', label: 'Centre', icon: '⚖️' },
    { value: 'right', label: 'Droite', icon: '➡️' },
    { value: 'apolitical', label: 'Apolitique', icon: '🤷' }
  ]
} as const;

export const availableTags = [
  '🌍 Voyage', '🍳 Cuisine', '🚴 Sport', '🏋️ Fitness',
  '🎮 Jeux vidéo', '📚 Lecture', '🎶 Musique', '🎨 Art & Créativité',
  '🐶 Amoureux des animaux', '🌱 Écologie & nature', '🎥 Cinéma & séries',
  '💃 Danse', '📷 Photographie', '🚀 Tech & innovation',
  '🍷 Gastronomie & vin', '👨‍💻 Code avec vim', '⛰️ Randonnée & plein air'
];