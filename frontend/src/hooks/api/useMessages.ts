import { useEffect } from 'react';
import { useConversationsStore } from '@/stores/chat/conversationsStore';
import { useDiscoverStore } from '@/stores/discoverStore';
import type { Conversation } from '@/types/chat';
import type { Match } from '@/types/discover';

export interface MessageMatch {
  id: string;
  name: string;
  age: number;
  image: string;
  images?: string[];
  bio?: string;
  location?: string;
  occupation?: string;
  interests?: string[];
  distance?: number;
  lastMessage?: string | null;
  timestamp?: string | null;
  unread: boolean;
  matchedAt: string;
  commonInterests: string[];
  isNew: boolean;
}

export function useMessages() {
  const {
    conversations,
    isLoading: conversationsLoading,
    error: conversationsError,
    fetchConversations,
  } = useConversationsStore();

  const {
    matches,
    isLoading: matchesLoading,
    error: matchesError,
    fetchMatches,
  } = useDiscoverStore();

  // Load data on mount
  useEffect(() => {
    if (conversations.length === 0 && !conversationsLoading) {
      fetchConversations().catch(console.error);
    }
  }, [conversations.length, conversationsLoading, fetchConversations]);

  useEffect(() => {
    if (matches.length === 0 && !matchesLoading) {
      fetchMatches().catch(console.error);
    }
  }, [matches.length, matchesLoading, fetchMatches]);

  // Transform conversations to match format
  const conversationMatches: MessageMatch[] = conversations.map((conv: Conversation) => ({
    id: conv.id.toString(),
    name: conv.user.first_name,
    age: calculateAge(conv.user.last_seen), // Approximate age calculation
    image: conv.user.profile_image || '',
    images: conv.user.profile_image ? [conv.user.profile_image] : [],
    bio: '', // Bio not available in conversation
    location: '',
    occupation: '',
    interests: [],
    distance: 0,
    lastMessage: conv.last_message?.content || null,
    timestamp: conv.last_message ? formatTimestamp(conv.last_message.sent_at) : null,
    unread: conv.unread_count > 0,
    matchedAt: formatTimestamp(conv.updated_at),
    commonInterests: [], // Would need additional API call to get interests
    isNew: false, // Conversations are not new matches
  }));

  // Transform matches to match format
  const newMatches: MessageMatch[] = matches
    .filter((match: Match) => match.is_mutual)
    .map((match: Match) => ({
      id: match.id.toString(),
      name: match.user.first_name,
      age: match.user.age,
      image: match.user.images?.[0]?.url || '',
      images: match.user.images?.map(img => img.url) || [],
      bio: match.user.bio,
      location: match.user.location,
      occupation: match.user.occupation,
      interests: match.user.interests,
      distance: match.user.distance,
      lastMessage: null, // New matches don't have messages yet
      timestamp: null,
      unread: false,
      matchedAt: formatTimestamp(match.matched_at),
      commonInterests: [], // Would need to calculate based on current user interests
      isNew: true,
    }));

  // Separate new matches from existing conversations
  const existingConversationIds = new Set(conversations.map(c => c.id.toString()));
  const filteredNewMatches = newMatches.filter(match => !existingConversationIds.has(match.id));

  const refreshData = async () => {
    try {
      await Promise.all([
        fetchConversations(),
        fetchMatches(),
      ]);
    } catch (error) {
      console.error('Failed to refresh messages data:', error);
    }
  };

  return {
    newMatches: filteredNewMatches,
    conversationMatches,
    isLoading: conversationsLoading || matchesLoading,
    error: conversationsError || matchesError,
    refreshData,
  };
}

// Helper functions
function calculateAge(_lastSeen: string): number {
  // This is a placeholder - in real app, age should come from profile data
  return 25;
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffHours / 24;

  if (diffHours < 1) {
    return 'À l\'instant';
  } else if (diffHours < 24) {
    return `${Math.floor(diffHours)}h`;
  } else if (diffDays < 7) {
    return `${Math.floor(diffDays)}j`;
  } else {
    return date.toLocaleDateString('fr-FR');
  }
}