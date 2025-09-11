import { useState, useEffect, useCallback } from 'react';
import { matchService, type UserProfile, type MatchingAlgorithmParams, type InteractionResponse } from '@/services/matchService';

interface UseMatchesState {
  profiles: UserProfile[];
  currentIndex: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
}

export function useMatches(initialParams: MatchingAlgorithmParams = {}) {
  const [state, setState] = useState<UseMatchesState>({
    profiles: [],
    currentIndex: 0,
    loading: true,
    error: null,
    hasMore: true,
  });

  const fetchProfiles = useCallback(async (params: MatchingAlgorithmParams = {}) => {
    // Vérifier si un token est présent
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Vous devez être connecté pour voir des profils'
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await matchService.getMatchingAlgorithm({
        limit: 20,
        algorithm_type: 'vector_based',
        ...initialParams,
        ...params
      });

      setState(prev => ({
        ...prev,
        profiles: response.matches,
        loading: false,
        hasMore: response.matches.length > 0,
        currentIndex: 0
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement des profils';
      
      // Si c'est une erreur d'authentification, suggérer une reconnexion
      if (error instanceof Error && (error.message.includes('401') || error.message.includes('unauthorized'))) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Votre session a expiré. Veuillez vous reconnecter.'
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage
        }));
      }
    }
  }, []);

  const likeUser = useCallback(async (userId: number): Promise<InteractionResponse> => {
    try {
      const response = await matchService.likeUser(userId);
      
      // Passer au profil suivant
      setState(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1
      }));

      return response;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Erreur lors du like');
    }
  }, []);

  const passUser = useCallback(async (userId: number): Promise<InteractionResponse> => {
    try {
      const response = await matchService.passUser(userId);
      
      // Passer au profil suivant
      setState(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1
      }));

      return response;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Erreur lors du pass');
    }
  }, []);

  const blockUser = useCallback(async (userId: number): Promise<InteractionResponse> => {
    try {
      const response = await matchService.blockUser(userId);
      
      // Passer au profil suivant
      setState(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1
      }));

      return response;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Erreur lors du blocage');
    }
  }, []);

  const loadMoreProfiles = useCallback(async () => {
    if (state.currentIndex >= state.profiles.length - 3 && state.hasMore && !state.loading) {
      // Ajouter un délai pour éviter le rate limiting
      setTimeout(() => {
        fetchProfiles();
      }, 1000);
    }
  }, [state.currentIndex, state.profiles.length, state.hasMore, state.loading, fetchProfiles]);

  useEffect(() => {
    // Ajouter un délai avant le premier chargement pour éviter les requêtes simultanées
    const timer = setTimeout(() => {
      fetchProfiles();
    }, 500);

    return () => clearTimeout(timer);
  }, []); // Retirer fetchProfiles de la dépendance pour éviter la boucle

  const currentProfile = state.profiles[state.currentIndex] || null;
  const remainingCount = Math.max(0, state.profiles.length - state.currentIndex);

  return {
    currentProfile,
    remainingCount,
    loading: state.loading,
    error: state.error,
    hasMore: state.hasMore,
    actions: {
      like: likeUser,
      pass: passUser,
      block: blockUser,
      refresh: () => fetchProfiles(),
      loadMore: loadMoreProfiles,
    }
  };
}