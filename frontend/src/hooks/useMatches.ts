import { useState, useEffect, useCallback } from 'react';
import { matchService, type UserProfile, type MatchCandidate, type MatchingAlgorithmParams, type InteractionResponse } from '@/services/matchService';

interface UseMatchesState {
  candidates: MatchCandidate[];
  profiles: Map<number, UserProfile>;
  seenProfileIds: Set<number>; // Profils déjà vus
  currentIndex: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadingProfiles: Set<number>;
}

export function useMatches(initialParams: MatchingAlgorithmParams = {}) {
  const [state, setState] = useState<UseMatchesState>({
    candidates: [],
    profiles: new Map(),
    seenProfileIds: new Set(),
    currentIndex: 0,
    loading: true,
    error: null,
    hasMore: true,
    loadingProfiles: new Set(),
  });

  const fetchCandidates = useCallback(async (params: MatchingAlgorithmParams = {}, isLoadMore = false) => {
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
      
      const response = await matchService.getMatchingCandidates({
        limit: 20,
        algorithm_type: 'vector_based',
        ...initialParams,
        ...params
      });

      // Filtrer les candidats déjà vus
      const newCandidates = response.candidates.filter(candidate => 
        !state.seenProfileIds.has(candidate.id)
      );

      setState(prev => {
        const updatedCandidates = isLoadMore 
          ? [...prev.candidates, ...newCandidates] 
          : newCandidates;

        // Ajouter les nouveaux IDs aux profils vus
        const updatedSeenIds = new Set(prev.seenProfileIds);
        newCandidates.forEach(candidate => updatedSeenIds.add(candidate.id));

        return {
          ...prev,
          candidates: updatedCandidates,
          seenProfileIds: updatedSeenIds,
          loading: false,
          hasMore: newCandidates.length > 0,
          currentIndex: isLoadMore ? prev.currentIndex : 0
        };
      });

      // Pre-load les premiers profils
      const firstBatch = newCandidates.slice(0, 5);
      firstBatch.forEach(candidate => {
        loadUserProfile(candidate.id);
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement des candidats';
      
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
  }, [state.seenProfileIds]);

  const loadUserProfile = useCallback(async (userId: number) => {
    // Ne pas charger si déjà en cours ou déjà chargé
    setState(prev => {
      if (prev.loadingProfiles.has(userId) || prev.profiles.has(userId)) {
        return prev;
      }
      
      return {
        ...prev,
        loadingProfiles: new Set([...prev.loadingProfiles, userId])
      };
    });

    try {
      const profile = await matchService.getUserProfile(userId);
      
      setState(prev => ({
        ...prev,
        profiles: new Map(prev.profiles.set(userId, profile)),
        loadingProfiles: new Set([...prev.loadingProfiles].filter(id => id !== userId))
      }));
    } catch (error) {
      console.error(`Erreur lors du chargement du profil ${userId}:`, error);
      
      setState(prev => ({
        ...prev,
        loadingProfiles: new Set([...prev.loadingProfiles].filter(id => id !== userId))
      }));
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

  const loadMoreCandidates = useCallback(async () => {
    if (state.currentIndex >= state.candidates.length - 3 && state.hasMore && !state.loading) {
      console.log('Loading more candidates...', {
        currentIndex: state.currentIndex,
        candidatesLength: state.candidates.length,
        hasMore: state.hasMore
      });
      
      // Ajouter un délai pour éviter le rate limiting
      setTimeout(() => {
        fetchCandidates({}, true); // isLoadMore = true
      }, 1000);
    }
  }, [state.currentIndex, state.candidates.length, state.hasMore, state.loading, fetchCandidates]);

  // Pre-load des profils suivants quand on s'approche de la fin
  useEffect(() => {
    const nextBatch = state.candidates.slice(state.currentIndex + 1, state.currentIndex + 6);
    nextBatch.forEach(candidate => {
      if (!state.profiles.has(candidate.id) && !state.loadingProfiles.has(candidate.id)) {
        loadUserProfile(candidate.id);
      }
    });
  }, [state.currentIndex, state.candidates, state.profiles, state.loadingProfiles, loadUserProfile]);

  // Auto-trigger loadMore quand on s'approche de la fin
  useEffect(() => {
    if (state.currentIndex >= state.candidates.length - 2) {
      loadMoreCandidates();
    }
  }, [state.currentIndex, loadMoreCandidates]);

  useEffect(() => {
    // Ajouter un délai avant le premier chargement pour éviter les requêtes simultanées
    const timer = setTimeout(() => {
      fetchCandidates();
    }, 500);

    return () => clearTimeout(timer);
  }, []); // Retirer fetchCandidates de la dépendance pour éviter la boucle

  const currentCandidate = state.candidates[state.currentIndex] || null;
  const currentProfile = currentCandidate ? state.profiles.get(currentCandidate.id) || null : null;
  const remainingCount = Math.max(0, state.candidates.length - state.currentIndex);

  return {
    currentProfile,
    currentCandidate,
    remainingCount,
    loading: state.loading,
    error: state.error,
    hasMore: state.hasMore,
    isProfileLoading: currentCandidate ? state.loadingProfiles.has(currentCandidate.id) : false,
    actions: {
      like: likeUser,
      pass: passUser,
      block: blockUser,
      refresh: () => {
        // Reset les profils vus et recharge complètement
        setState(prev => ({
          ...prev,
          seenProfileIds: new Set(),
          candidates: [],
          currentIndex: 0
        }));
        fetchCandidates();
      },
      loadMore: loadMoreCandidates,
    }
  };
}