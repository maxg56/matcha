import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatApi } from '@/services/chatApi';
import { matchService } from '@/services/matchService';
import { useChatStore } from '@/stores/chatStore';
import type { Conversation } from '@/types/chat';
import type { Match, UserProfile } from '@/services/matchService';

export interface UIConversation {
  id: string;
  conversationId: number;
  userId: number;
  name: string;
  age: number;
  image: string;
  images?: string[];
  lastMessage?: string | null;
  timestamp?: string | null;
  unread: boolean;
  matchedAt: string;
  commonInterests: string[];
  isNew: boolean;
  isOnline: boolean;
  type: 'conversation';
}

export interface UINewMatch {
  id: string;
  userId: number;
  name: string;
  age: number;
  image: string;
  images?: string[];
  bio?: string;
  location?: string;
  occupation?: string;
  interests?: string[];
  distance?: number;
  matchedAt: string;
  commonInterests: string[];
  isNew: boolean;
  isOnline: boolean;
  type: 'new_match';
}

export type UIMatch = UIConversation | UINewMatch;

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return diffMinutes < 1 ? 'Maintenant' : `Il y a ${diffMinutes} min`;
  } else if (diffHours < 24) {
    return `Il y a ${diffHours}h`;
  } else if (diffDays === 1) {
    return 'Hier';
  } else if (diffDays < 7) {
    return `Il y a ${diffDays} jours`;
  } else {
    return date.toLocaleDateString('fr-FR');
  }
}
async function fetchUserProfile(userId: number): Promise<boolean> {
  try {
    const presenceData = await chatApi.getUserPresence(userId);
    return presenceData.is_online;
  } catch (error) {
    console.warn('Failed to get user presence for user', userId, error);
    return false;
  }
}

// Transforme une conversation en UIConversation ou UINewMatch selon qu'elle contient des messages
async function transformConversationToUI(conversation: Conversation): Promise<UIConversation | UINewMatch> {
  const otherUser = conversation.other_user;
  const lastMessageDate = conversation.last_message_at ? new Date(conversation.last_message_at) : null;
  const createdDate = new Date(conversation.created_at);
  const hasMessages = Boolean(conversation.last_message && conversation.last_message.trim());

  // Récupérer le statut de présence de l'utilisateur
  let isOnline = await fetchUserProfile(otherUser.id);
  // Construire le nom complet à partir de first_name et last_name
  const displayName = `${otherUser.first_name} ${otherUser.last_name}`.trim() || otherUser.username;

  const baseData = {
    id: `conv_${conversation.id}`, // Préfixe pour éviter les conflits avec les matchs
    conversationId: conversation.id,
    userId: otherUser.id,
    name: displayName, // Utiliser le nom complet au lieu du username
    age: 25,
    image: otherUser.avatar || '/default-avatar.png',
    images: otherUser.avatar ? [otherUser.avatar] : undefined,
    matchedAt: formatTimestamp(createdDate),
    commonInterests: [],
    isNew: !hasMessages,
    isOnline
  };

  // Si la conversation a des messages, c'est une conversation active
  if (hasMessages) {
    return {
      ...baseData,
      lastMessage: conversation.last_message,
      timestamp: lastMessageDate ? formatTimestamp(lastMessageDate) : null,
      unread: conversation.unread_count > 0,
      type: 'conversation'
    } as UIConversation;
  }

  // Sinon, c'est un nouveau match (conversation vide)
  return {
    ...baseData,
    bio: '',
    location: '',
    occupation: '',
    interests: [],
    distance: 0,
    type: 'new_match'
  } as UINewMatch;
}

async function transformMatchToUINewMatch(userId: number, profile: UserProfile): Promise<UINewMatch> {
  // Récupérer le statut de présence de l'utilisateur
  let isOnline = await fetchUserProfile(userId);
  return {
    id: `match_${userId}`, // Préfixe pour éviter les conflits avec les conversations
    userId: userId,
    name: profile.first_name,
    age: profile.age,
    image: profile.images?.[0] || '/default-avatar.png',
    images: profile.images,
    bio: profile.bio,
    location: profile.current_city || '',
    occupation: profile.job || '',
    interests: profile.tags || [],
    distance: 0,
    matchedAt: formatTimestamp(new Date()),
    commonInterests: [],
    isNew: true,
    isOnline,
    type: 'new_match'
  };
}

export function useMessagesData() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<UIMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { conversations: storeConversations } = useChatStore();

  const loadConversations = async (): Promise<Conversation[]> => {
    try {
      const response = await chatApi.getUserConversations();
      console.log('Conversations API response:', response);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.warn('Failed to load conversations:', error);
      return [];
    }
  };

  // Filtre les conversations en vérifiant que les utilisateurs sont toujours matchés
  const filterActiveConversations = async (conversations: Conversation[]): Promise<Conversation[]> => {
    try {
      // Récupérer les matches actifs pour filtrer les conversations
      const matchesData = await matchService.getMatches();
      const activeMatchUserIds = new Set(
        matchesData.matches?.map((match: any) => 
          match.id || match.target_user_id || match.user_id
        ).filter(Boolean) || []
      );

      // Filtrer les conversations où l'utilisateur est encore matché
      const activeConversations = conversations.filter(conv => 
        activeMatchUserIds.has(conv.other_user.id)
      );

      const filteredCount = conversations.length - activeConversations.length;
      if (filteredCount > 0) {
        console.log(`🙈 Filtered out ${filteredCount} conversations from unmatched users`);
      }

      return activeConversations;
    } catch (error) {
      console.warn('Failed to filter conversations by match status, showing all:', error);
      // En cas d'erreur, retourner toutes les conversations pour éviter de cacher du contenu
      return conversations;
    }
  };

  const loadMatches = async (): Promise<{ matches: Match[]; count: number; user_id: number }> => {
    try {
      const response = await matchService.getMatches();
      console.log('Matches API response:', response);
      return response || { matches: [], count: 0, user_id: 0 };
    } catch (error) {
      console.warn('Failed to load matches:', error);
      return { matches: [], count: 0, user_id: 0 };
    }
  };

  // Fonction pour mettre à jour uniquement le statut de présence (sans dépendance sur matches)
  const updatePresenceStatus = useCallback(async () => {
    setMatches(prevMatches => {
      if (prevMatches.length === 0) return prevMatches;

      // Limiter le nombre de requêtes simultanées pour éviter la surcharge
      const maxConcurrentRequests = 5;
      const matchesToUpdate = prevMatches.slice(0, maxConcurrentRequests);

      console.log(`Mise à jour du statut de présence pour ${matchesToUpdate.length} utilisateurs`);

      // Lancer les requêtes de manière asynchrone
      Promise.allSettled(
        matchesToUpdate.map(async (match) => {
          try {
            const isOnline = await fetchUserProfile(match.userId);
            return {
              ...match,
              isOnline
            };
          } catch (error) {
            console.warn('Failed to update presence for user', match.userId, error);
            return match;
          }
        })
      ).then(results => {
        setMatches(currentMatches =>
          currentMatches.map((match, index) => {
            if (index < matchesToUpdate.length) {
              const result = results[index];
              if (result.status === 'fulfilled') {
                return result.value;
              }
            }
            return match;
          })
        );
      });

      return prevMatches; // Retourner l'état actuel, les mises à jour se feront via le Promise
    });
  }, []); // Pas de dépendances pour éviter la boucle infinie

  // Traite les matches qui n'ont PAS de conversation existante
  const processMatchesWithoutConversations = async (matchesData: { matches: Match[] }, userIdsWithConversations: Set<number>): Promise<UINewMatch[]> => {
    const newMatches: UINewMatch[] = [];

    if (!Array.isArray(matchesData.matches)) return newMatches;

    for (const match of matchesData.matches) {
      const matchUserId = (match as { id?: number; target_user_id?: number }).id || (match as { target_user_id?: number }).target_user_id;

      // Seuls les matches SANS conversation existante sont traités ici
      if (!matchUserId || userIdsWithConversations.has(matchUserId)) {
        continue;
      }

      try {
        const profile = await matchService.getUserProfile(matchUserId);
        const uiMatch = await transformMatchToUINewMatch(matchUserId, profile);
        newMatches.push(uiMatch);
      } catch (error) {
        console.error('Failed to load profile for match:', matchUserId, error);
      }
    }

    return newMatches;
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [conversationsData, matchesData] = await Promise.all([
        loadConversations(),
        loadMatches()
      ]);

      const uiMatches: UIMatch[] = [];


      // 1. Transformer toutes les conversations (elles seront automatiquement catégorisées)
      if (conversationsData.length > 0) {
        const transformedConversations = await Promise.all(
          conversationsData.map(conversation => transformConversationToUI(conversation))
        );
        uiMatches.push(...transformedConversations);
        console.log('Transformed conversations:', transformedConversations.length);
      }

      // 3. Identifier les utilisateurs qui ont déjà des conversations actives (pour éviter les doublons)
      const userIdsWithConversations = new Set(
        activeConversations.map(conv => conv.other_user?.id).filter(Boolean)
      );

      // 4. Traiter les matches qui n'ont PAS encore de conversation
      const matchesWithoutConversations = await processMatchesWithoutConversations(matchesData, userIdsWithConversations);
      uiMatches.push(...matchesWithoutConversations);

      console.log('Final UI matches:', {
        conversations: uiMatches.filter(m => m.type === 'conversation').length,
        newMatches: uiMatches.filter(m => m.type === 'new_match').length,
        total: uiMatches.length
      });
      setMatches(uiMatches);
    } catch (err) {
      console.error('Failed to load messages data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleNewMatchClick = async (match: UINewMatch) => {
    try {
      const conversationResponse = await chatApi.createConversation(match.userId);

      if (!conversationResponse?.id) {
        console.error('Failed to create conversation - no conversation ID in response');
        return;
      }

      const newConversation: UIConversation = {
        id: `conv_${conversationResponse.id}`, // Cohérence avec le nouveau format d'ID
        conversationId: conversationResponse.id,
        userId: match.userId,
        name: match.name,
        age: match.age,
        image: match.image,
        images: match.images,
        lastMessage: null,
        timestamp: null,
        unread: false,
        matchedAt: formatTimestamp(new Date(conversationResponse.created_at)),
        commonInterests: match.commonInterests,
        isNew: true, // Nouvelle conversation sans messages
        isOnline: match.isOnline,
        type: 'conversation'
      };

      setMatches(prevMatches => [
        ...prevMatches.filter(m => m.id !== match.id),
        newConversation
      ]);

      navigate(`/app/chat/${conversationResponse.id}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
      navigate(`/app/messages`);
    }
  };

  const handleMatchClick = async (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    if (match.type === 'conversation') {
      navigate(`/app/chat/${match.conversationId}`);
      return;
    }

    await handleNewMatchClick(match);
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Effet séparé pour le polling de présence (sans boucle infinie)
  useEffect(() => {
    const presenceInterval = setInterval(() => {
      updatePresenceStatus();
    }, 10000); // 10 secondes

    return () => {
      clearInterval(presenceInterval);
    };
  }, []); // Pas de dépendances pour éviter la boucle

  // Écouter les mises à jour de présence du chatStore et synchroniser avec les matches locaux
  useEffect(() => {
    setMatches(prevMatches =>
      prevMatches.map(match => {
        // Chercher la conversation correspondante dans le chatStore
        const storeConversation = storeConversations.find(conv => conv.user.id === match.userId);
        if (storeConversation) {
          return {
            ...match,
            isOnline: storeConversation.user.is_online
          };
        }
        return match;
      })
    );
  }, [storeConversations]);

  // Séparation intelligente :
  // - Nouveaux matchs = tous les éléments de type 'new_match' (incluant les conversations vides)
  // - Conversations = tous les éléments de type 'conversation' avec des messages
  const newMatches = matches.filter(m => m.type === 'new_match') as UINewMatch[];
  const conversations = matches.filter(m => m.type === 'conversation' && !m.isNew) as UIConversation[];

  return {
    matches,
    newMatches,
    conversations,
    loading,
    error,
    handleMatchClick,
    refetch: loadData
  };
}