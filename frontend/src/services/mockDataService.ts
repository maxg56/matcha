// Service temporaire pour simuler les données jusqu'à ce que le backend soit completement connecté

interface MockLikePreview {
  id: string;
  created_at: string;
  blurred_image: string;
  timestamp_relative: string;
}

interface MockLikeStats {
  total_likes_received: number;
  likes_today: number;
  likes_this_week: number;
  likes_this_month: number;
  most_liked_photo?: string;
  like_rate_trend: 'increasing' | 'decreasing' | 'stable';
  average_likes_per_day: number;
}

export const mockDataService = {
  // Générer des likes simulés pour démonstration
  generateMockReceivedLikes(count: number = 5): MockLikePreview[] {
    const likes: MockLikePreview[] = [];

    for (let i = 0; i < count; i++) {
      const hoursAgo = Math.floor(Math.random() * 72); // 0-72 heures
      const date = new Date();
      date.setHours(date.getHours() - hoursAgo);

      likes.push({
        id: `mock-like-${i + 1}`,
        created_at: date.toISOString(),
        blurred_image: `https://picsum.photos/400/600?random=${i + 1}&blur=5`,
        timestamp_relative: this.formatRelativeTime(date)
      });
    }

    return likes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  // Générer des statistiques simulées
  generateMockLikeStats(): MockLikeStats {
    const total = Math.floor(Math.random() * 50) + 10; // 10-60 likes
    const today = Math.floor(Math.random() * 5); // 0-5 likes today
    const week = Math.floor(Math.random() * 15) + today; // week includes today
    const month = Math.floor(Math.random() * 30) + week; // month includes week

    return {
      total_likes_received: total,
      likes_today: today,
      likes_this_week: week,
      likes_this_month: month,
      like_rate_trend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as any,
      average_likes_per_day: Math.round((total / 30) * 10) / 10 // Arrondi à 1 décimale
    };
  },

  // Formater le temps relatif
  formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      if (diffMinutes < 1) return "À l'instant";
      return `Il y a ${diffMinutes} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  },

  // Simuler un délai de réseau
  async mockApiCall<T>(data: T, delay: number = 500): Promise<T> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(data), delay);
    });
  }
};

export type { MockLikePreview, MockLikeStats };