export const filterOptions = {
  showMe: [
    { value: 'woman', label: 'Femmes', icon: '👩' },
    { value: 'man', label: 'Hommes', icon: '👨' },
    { value: 'both', label: 'Tout le monde', icon: '👫' }
  ],
  hairColors: [
    { value: 'black', label: 'Noirs', icon: '⚫' },
    { value: 'brown', label: 'Bruns', icon: '🤎' },
    { value: 'blonde', label: 'Blonds', icon: '🟡' },
    { value: 'red', label: 'Roux', icon: '🔴' },
    { value: 'gray', label: 'Gris', icon: '⚪' },
    { value: 'white', label: 'Blancs', icon: '⚪' }
  ],
  eyeColors: [
    { value: 'brown', label: 'Marron', icon: '🤎' },
    { value: 'blue', label: 'Bleus', icon: '🔵' },
    { value: 'green', label: 'Verts', icon: '🟢' },
    { value: 'hazel', label: 'Noisette', icon: '🟤' },
    { value: 'gray', label: 'Gris', icon: '⚪' },
    { value: 'black', label: 'Noirs', icon: '⚫' }
  ],
  skinColors: [
    { value: 'very_light', label: 'Très claire', icon: '🤍' },
    { value: 'light', label: 'Claire', icon: '🤗' },
    { value: 'medium', label: 'Moyenne', icon: '🙂' },
    { value: 'tan', label: 'Mate', icon: '😊' },
    { value: 'dark', label: 'Foncée', icon: '🤎' },
    { value: 'very_dark', label: 'Très foncée', icon: '🖤' }
  ],
  alcoholConsumption: [
    { value: 'yes', label: 'Oui', icon: '🍷' },
    { value: 'sometimes', label: 'Parfois', icon: '🥂' },
    { value: 'no', label: 'Non', icon: '🚫' }
  ],
  smoking: [
    { value: 'yes', label: 'Oui', icon: '🚬' },
    { value: 'sometimes', label: 'Parfois', icon: '💨' },
    { value: 'no', label: 'Non', icon: '🚭' }
  ],
  cannabis: [
    { value: 'yes', label: 'Oui', icon: '🌿' },
    { value: 'sometimes', label: 'Parfois', icon: '🍃' },
    { value: 'no', label: 'Non', icon: '🚫' }
  ],
  drugs: [
    { value: 'yes', label: 'Oui', icon: '💊' },
    { value: 'sometimes', label: 'Parfois', icon: '⚗️' },
    { value: 'no', label: 'Non', icon: '🚫' }
  ],
  pets: [
    { value: 'dogs', label: 'Chiens', icon: '🐕' },
    { value: 'cats', label: 'Chats', icon: '🐱' },
    { value: 'both', label: 'Les deux', icon: '🐾' },
    { value: 'other', label: 'Autres', icon: '🐹' },
    { value: 'none', label: 'Aucun', icon: '🚫' }
  ],
  socialActivityLevel: [
    { value: 'low', label: 'Introverti', icon: '🏠' },
    { value: 'medium', label: 'Équilibré', icon: '🤝' },
    { value: 'high', label: 'Extraverti', icon: '🎉' }
  ],
  sportActivity: [
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
    { value: 'judaism', label: 'Judaïsme', icon: '✡️' },
    { value: 'atheism', label: 'Athéisme', icon: '🔬' },
    { value: 'agnosticism', label: 'Agnosticisme', icon: '❓' },
    { value: 'other', label: 'Autre', icon: '🌟' }
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
    { value: 'wants', label: 'En veut', icon: '👪' },
    { value: 'doesnt_want', label: 'N\'en veut pas', icon: '❌' }
  ],
  politicalView: [
    { value: 'left', label: 'Gauche', icon: '🟥' },
    { value: 'center_left', label: 'Centre gauche', icon: '🟠' },
    { value: 'center', label: 'Centre', icon: '🟡' },
    { value: 'center_right', label: 'Centre droit', icon: '🟢' },
    { value: 'right', label: 'Droite', icon: '🔵' },
    { value: 'apolitical', label: 'Apolitique', icon: '⚪' }
  ]
};

export const availableTags = [
  '🌍 Voyage', '🍳 Cuisine', '🚴 Sport', '🏋️ Fitness',
  '🎮 Jeux vidéo', '📚 Lecture', '🎶 Musique', '🎨 Art & Créativité',
  '🐶 Amoureux des animaux', '🌱 Écologie & nature', '🎥 Cinéma & séries',
  '💃 Danse', '📷 Photographie', '🚀 Tech & innovation',
  '🍷 Gastronomie & vin', '👨‍💻 Code avec vim', '⛰️ Randonnée & plein air'
];