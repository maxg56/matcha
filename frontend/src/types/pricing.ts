export type PlanInterval = 'mensuel' | 'trimestriel' | 'annuel';
export type PlanStatus = 'active' | 'inactive' | 'canceled' | 'past_due' | 'trialing';

export interface PricingPlan {
  id: string;
  name: string;
  interval: PlanInterval;
  price: number;
  originalPrice?: number;
  currency: string;
  discount?: number; // Percentage
  isPopular?: boolean;
  isTrial?: boolean;
  trialDays?: number;
  features: PricingFeature[];
  stripePriceId: string;
  description: string;
  badge?: string;
  savings?: string; // "Économisez 33%"
}

export interface PricingFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  premium?: boolean;
  icon?: string;
  tooltip?: string;
}

export interface SubscriptionDetails {
  id: string;
  planId: string;
  status: PlanStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialStart?: string;
  trialEnd?: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  endedAt?: string;
  nextBillingDate: string;
  amount: number;
  currency: string;
  interval: PlanInterval;
  customerId: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank_transfer';
  last4?: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
  email?: string; // For PayPal
}

export interface BillingInfo {
  name: string;
  email: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    postalCode: string;
    country: string;
  };
  taxId?: string;
}

export interface SubscriptionResponse {
  subscription: SubscriptionDetails;
  paymentMethod?: PaymentMethod;
  billingInfo?: BillingInfo;
  nextInvoice?: {
    amount: number;
    currency: string;
    date: string;
  };
}

// Pricing configuration
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'mensuel',
    name: 'Mensuel',
    interval: 'mensuel',
    price: 19.99,
    currency: 'EUR',
    stripePriceId: 'price_monthly_premium',
    description: 'Parfait pour découvrir Premium',
    features: [
      {
        id: 'unlimited_swipes',
        name: 'Swipes illimités',
        description: 'Swipe autant que vous voulez',
        included: true,
        icon: '⚡'
      },
      {
        id: 'who_likes_me',
        name: 'Voir qui vous like',
        description: 'Découvrez qui craque pour vous',
        included: true,
        icon: '👀'
      },
      {
        id: 'super_likes',
        name: '5 Super Likes par jour',
        description: 'Montrez votre intérêt fort',
        included: true,
        icon: '⭐'
      },
      {
        id: 'boost',
        name: 'Profile Boost mensuel',
        description: 'Soyez vu 10x plus souvent',
        included: true,
        icon: '🚀'
      },
      {
        id: 'rewind',
        name: 'Annuler les swipes',
        description: 'Fonction Rewind illimitée',
        included: true,
        icon: '↺'
      },
      {
        id: 'unlimited_distance',
        name: 'Distance illimitée',
        description: 'Recherchez dans le monde entier',
        included: true,
        icon: '🌍'
      },
      {
        id: 'premium_chat',
        name: 'Chat Premium',
        description: 'Accusés de réception et indicateurs',
        included: true,
        icon: '💬'
      }
    ]
  },
  {
    id: 'trimestriel',
    name: 'Trimestriel',
    interval: 'trimestriel',
    price: 14.99,
    originalPrice: 19.99,
    currency: 'EUR',
    discount: 25,
    isPopular: true,
    stripePriceId: 'price_quarterly_premium',
    description: 'Le plan le plus populaire',
    badge: 'Le plus populaire',
    savings: 'Économisez 25%',
    features: [
      {
        id: 'all_monthly_features',
        name: 'Toutes les fonctionnalités mensuelles',
        description: 'Plus toutes les fonctionnalités ci-dessous',
        included: true,
        icon: '✨'
      },
      {
        id: 'priority_support',
        name: 'Support prioritaire',
        description: 'Réponse garantie en 24h',
        included: true,
        premium: true,
        icon: '🎧'
      },
      {
        id: 'advanced_filters',
        name: 'Filtres avancés',
        description: 'Filtrez par éducation, lifestyle, etc.',
        included: true,
        premium: true,
        icon: '🔍'
      },
      {
        id: 'profile_insights',
        name: 'Statistiques détaillées',
        description: 'Analytics complets de votre profil',
        included: true,
        premium: true,
        icon: '📊'
      }
    ]
  },
  {
    id: 'annuel',
    name: 'Annuel',
    interval: 'annuel',
    price: 9.99,
    originalPrice: 19.99,
    currency: 'EUR',
    discount: 50,
    stripePriceId: 'price_yearly_premium',
    description: 'La meilleure valeur pour les relations sérieuses',
    savings: 'Économisez 50%',
    badge: 'Meilleure valeur',
    features: [
      {
        id: 'all_quarterly_features',
        name: 'Toutes les fonctionnalités trimestrielles',
        description: 'Plus les avantages exclusifs annuels',
        included: true,
        icon: '✨'
      },
      {
        id: 'exclusive_events',
        name: 'Accès aux événements exclusifs',
        description: 'Soirées et événements Premium',
        included: true,
        premium: true,
        icon: '🎉'
      },
      {
        id: 'personal_matchmaker',
        name: 'Conseils personnalisés',
        description: 'Optimisation profil par nos experts',
        included: true,
        premium: true,
        icon: '🎯'
      },
      {
        id: 'unlimited_super_likes',
        name: 'Super Likes illimités',
        description: 'Aucune limite sur les Super Likes',
        included: true,
        premium: true,
        icon: '🌟'
      }
    ]
  }
];

// Free trial configuration
export const FREE_TRIAL_CONFIG = {
  duration: 7, // days
  requiresPaymentMethod: true,
  features: 'all', // All premium features during trial
  automaticBilling: true,
  cancellationPolicy: 'anytime'
};

// Feature comparison for free vs premium
export const FEATURE_COMPARISON = {
  free: {
    swipes: 20,
    superLikes: 1,
    boosts: 0,
    rewinds: 0,
    distance: 100, // km
    whoLikesMe: false,
    readReceipts: false,
    prioritySupport: false
  },
  premium: {
    swipes: 'unlimited',
    superLikes: 'unlimited',
    boosts: 'monthly',
    rewinds: 'unlimited',
    distance: 'unlimited',
    whoLikesMe: true,
    readReceipts: true,
    prioritySupport: true
  }
};

export const PRICING_FAQ = [
  {
    question: "Que se passe-t-il après l'essai gratuit ?",
    answer: "Après 7 jours, votre abonnement se renouvelle automatiquement au tarif choisi. Vous pouvez annuler à tout moment pendant l'essai sans frais."
  },
  {
    question: "Puis-je changer de plan ?",
    answer: "Oui, vous pouvez passer à un plan supérieur à tout moment. Pour rétrograder, le changement prendra effet à la fin de votre période de facturation actuelle."
  },
  {
    question: "Comment annuler mon abonnement ?",
    answer: "Vous pouvez annuler votre abonnement à tout moment depuis vos paramètres. L'accès Premium reste actif jusqu'à la fin de votre période payée."
  },
  {
    question: "Les prix incluent-ils les taxes ?",
    answer: "Les prix affichés sont TTC pour les résidents européens. Les taxes applicables s'ajoutent pour les autres régions."
  },
  {
    question: "Offrez-vous des remboursements ?",
    answer: "Nous offrons un remboursement complet si vous annulez dans les 14 jours suivant votre premier paiement (hors période d'essai)."
  }
];