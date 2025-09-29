import { useState, useEffect, useCallback } from 'react';
import { matchService, type UserProfile, type MatchCandidate, type MatchingAlgorithmParams, type InteractionResponse } from '@/services/matchService';

interface UseMatchesState {
  candidates: MatchCandidate[];
  profiles: Map<number, UserProfile>;
  currentIndex: number;
  loading: boolean;
  error: string | null;
}

export function useMatches(initialParams: MatchingAlgorithmParams = {}) {
  const [state, setState] = useState<UseMatchesState>({
    candidates: [],
    profiles: new Map(),
    currentIndex: 0,
    loading: true,
    error: null,
  });

  const fetchCandidates = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await matchService.getMatchingCandidates({
        limit: 20,
        algorithm_type: 'vector_based',
        ...initialParams
      });

      setState(prev => ({
        ...prev,
        candidates: response.candidates,
        loading: false,
        currentIndex: 0
      }));

      if (response.candidates.length > 0) {
        loadUserProfile(response.candidates[0].id);
      }
    } catch (error) {
      let errorMessage = 'Erreur lors du chargement des candidats';

      if (error instanceof Error) {
        if (error.message.includes('location')) {
          errorMessage = 'location_required';
        } else {
          errorMessage = error.message;
        }
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  }, [initialParams]);

  const loadUserProfile = useCallback(async (userId: number) => {
    setState(prev => {
      if (prev.profiles.has(userId)) return prev;

      // Démarrer le chargement du profil de façon asynchrone
      matchService.getUserProfile(userId)
        .then(profile => {
          setState(prevState => ({
            ...prevState,
            profiles: new Map(prevState.profiles.set(userId, profile))
          }));
        })
        .catch(error => {
          console.error(`Erreur lors du chargement du profil ${userId}:`, error);
        });

      return prev;
    });
  }, []);

  const nextProfile = useCallback(() => {
    setState(prev => {
      const nextIndex = prev.currentIndex + 1;

      if (nextIndex < prev.candidates.length) {
        const nextCandidate = prev.candidates[nextIndex];
        if (!prev.profiles.has(nextCandidate.id)) {
          loadUserProfile(nextCandidate.id);
        }
      }

      return { ...prev, currentIndex: nextIndex };
    });
  }, [loadUserProfile]);

  const likeUser = useCallback(async (userId: number): Promise<InteractionResponse> => {
    try {
      const response = await matchService.likeUser(userId);
      nextProfile();
      return response;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Erreur lors du like');
    }
  }, [nextProfile]);

  const passUser = useCallback(async (userId: number): Promise<InteractionResponse> => {
    try {
      const response = await matchService.passUser(userId);
      nextProfile();
      return response;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Erreur lors du pass');
    }
  }, [nextProfile]);

  const blockUser = useCallback(async (userId: number): Promise<InteractionResponse> => {
    try {
      const response = await matchService.blockUser(userId);
      nextProfile();
      return response;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Erreur lors du blocage');
    }
  }, [nextProfile]);

  const refresh = useCallback(async () => {
    setState(prev => ({
      ...prev,
      candidates: [],
      profiles: new Map(),
      currentIndex: 0,
      loading: true,
      error: null
    }));

    try {
      const response = await matchService.getMatchingCandidates({
        limit: 20,
        algorithm_type: 'vector_based',
        ...initialParams
      });

      setState(prev => ({
        ...prev,
        candidates: response.candidates,
        loading: false,
        currentIndex: 0
      }));

      if (response.candidates.length > 0) {
        loadUserProfile(response.candidates[0].id);
      }
    } catch (error) {
      let errorMessage = 'Erreur lors du chargement des candidats';

      if (error instanceof Error) {
        if (error.message.includes('location')) {
          errorMessage = 'location_required';
        } else {
          errorMessage = error.message;
        }
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  }, [initialParams, loadUserProfile]);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const currentCandidate = state.candidates[state.currentIndex] || null;
  const currentProfile = currentCandidate ? state.profiles.get(currentCandidate.id) || null : null;
  const isProfileLoading = currentCandidate && !currentProfile && !state.error;

  return {
    currentProfile,
    currentCandidate,
    loading: state.loading,
    error: state.error,
    isProfileLoading,
    actions: {
      like: likeUser,
      pass: passUser,
      block: blockUser,
      refresh
    }
  };
}