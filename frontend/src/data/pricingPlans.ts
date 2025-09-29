import type { PricingPlan } from '../types/subscription';

export const pricingPlans: PricingPlan[] = [
  {
    id: 'gratuit',
    name: 'Gratuit',
    price: 0,
    currency: 'EUR',
    period: '',
    popular: false,
    features: [
      'Créer un profil',
      'Parcourir les profils',
      '5 likes par jour',
      'Messages de base',
      'Historique limité à 24h'
    ],
    limitations: [
      'Boost de profil',
      'Voir qui vous a aimé',
      'Messages illimités',
      'Filtres avancés',
      'Mode incognito',
      'Annuler les likes',
      'Super likes'
    ]
  },
  {
    id: 'mensuel',
    name: 'Premium Mensuel',
    price: 9.99,
    currency: 'EUR',
    period: 'mois',
    popular: false,
    features: [
      'Tout du plan gratuit',
      'Likes illimités',
      'Voir qui vous a aimé',
      'Messages illimités',
      'Historique complet',
      '5 super likes par jour',
      'Boost de profil (1/mois)',
      'Filtres avancés',
      'Mode incognito',
      'Annuler les likes',
      'Pas de publicités'
    ]
  },
  {
    id: 'annuel',
    name: 'Premium Annuel',
    price: 99.99,
    originalPrice: 119.88,
    currency: 'EUR',
    period: 'an',
    popular: true,
    features: [
      'Tout du plan mensuel',
      'Likes illimités',
      'Voir qui vous a aimé',
      'Messages illimités',
      'Historique complet',
      '10 super likes par jour',
      'Boost de profil (2/mois)',
      'Filtres avancés',
      'Mode incognito',
      'Annuler les likes',
      'Pas de publicités',
      'Support prioritaire',
      'Badge Premium exclusif'
    ]
  }
];

export const getFeatureComparison = () => {
  const allFeatures = [
    'Créer un profil',
    'Parcourir les profils',
    'Messages de base',
    'Likes par jour',
    'Historique des messages',
    'Super likes',
    'Boost de profil',
    'Voir qui vous a aimé',
    'Filtres avancés',
    'Mode incognito',
    'Annuler les likes',
    'Publicités',
    'Support'
  ];

  return allFeatures.map(feature => ({
    feature,
    gratuit: getFeatureStatus(feature, 'gratuit'),
    mensuel: getFeatureStatus(feature, 'mensuel'),
    annuel: getFeatureStatus(feature, 'annuel')
  }));
};

function getFeatureStatus(feature: string, planId: string): string {
  switch (feature) {
    case 'Likes par jour':
      return planId === 'gratuit' ? '5' : 'Illimités';
    case 'Super likes':
      return planId === 'gratuit' ? '❌' : planId === 'mensuel' ? '5/jour' : '10/jour';
    case 'Boost de profil':
      return planId === 'gratuit' ? '❌' : planId === 'mensuel' ? '1/mois' : '2/mois';
    case 'Historique des messages':
      return planId === 'gratuit' ? '24h' : 'Complet';
    case 'Publicités':
      return planId === 'gratuit' ? '✅' : '❌';
    case 'Support':
      return planId === 'gratuit' ? 'Standard' : planId === 'annuel' ? 'Prioritaire' : 'Standard';
    case 'Voir qui vous a aimé':
    case 'Filtres avancés':
    case 'Mode incognito':
    case 'Annuler les likes':
      return planId === 'gratuit' ? '❌' : '✅';
    default:
      return '✅';
  }
}