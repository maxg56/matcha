import type { UIMatch, UINewMatch, UIConversation } from '@/hooks/useMessagesData';

// Type that matches what the UI components expect
export interface ComponentMatch {
  id: string;
  name: string;
  age: number;
  image: string;
  images?: string[];
  matchedAt: string;
  commonInterests: string[];
  isNew: boolean;
  lastMessage?: string | null;
  timestamp?: string | null;
  unread: boolean;
  bio?: string;
  location?: string;
  occupation?: string;
  interests?: string[];
  distance?: number;
}

/**
 * Converts UIMatch (UINewMatch or UIConversation) to ComponentMatch format
 * that the UI components expect
 */
export function convertUIMatchToComponentMatch(uiMatch: UIMatch): ComponentMatch {
  const baseMatch: ComponentMatch = {
    id: uiMatch.id,
    name: uiMatch.name,
    age: uiMatch.age,
    image: uiMatch.image,
    images: uiMatch.images,
    matchedAt: uiMatch.matchedAt,
    commonInterests: uiMatch.commonInterests,
    isNew: uiMatch.isNew,
    unread: false, // Default value, will be overridden for conversations
  };

  if (uiMatch.type === 'conversation') {
    const conversation = uiMatch as UIConversation;
    return {
      ...baseMatch,
      lastMessage: conversation.lastMessage,
      timestamp: conversation.timestamp,
      unread: conversation.unread ?? false,
    };
  } else {
    // new_match type
    const newMatch = uiMatch as UINewMatch;
    return {
      ...baseMatch,
      bio: newMatch.bio,
      location: newMatch.location,
      occupation: newMatch.occupation,
      interests: newMatch.interests,
      distance: newMatch.distance,
      unread: false, // New matches are not unread
    };
  }
}