export const COMMON_TAGS = [
  '🌍 Voyage', '🍳 Cuisine', '🚴🏻‍♂️ Sport', '🏋️ Fitness', '🎮 Jeux vidéo',
  '📚 Lecture', '🎶 Musique', '🎨 Art & Créativité', '🐶 Amoureux des animaux',
  '🌱 Écologie & nature', '🎥 Cinéma & séries', '💃 Danse', '📷 Photographie',
  '🚀 Tech & innovation', '🍷 Gastronomie & vin', '👨🏻‍💻 Code avec vim',
  '⛰️ Randonnée & plein air'
] as const;

export type TagValue = typeof COMMON_TAGS[number];