import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { matchService, type UserProfile, type MatchCandidate, type MatchingAlgorithmParams, type InteractionResponse } from '@/services/matchService';

interface UseMatchesState {
  candidates: MatchCandidate[];
  profiles: Map<number, UserProfile>;
  currentIndex: number;
  loading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMoreCandidates: boolean;
  currentOffset: number;
}

export function useMatches(initialParams: MatchingAlgorithmParams = {}) {
  // Stabiliser les paramètres avec useMemo pour éviter les re-renders inutiles
  const stableParams = useMemo(() => initialParams, [
    initialParams.limit,
    initialParams.max_distance,
    initialParams.age_min,
    initialParams.age_max,
    initialParams.algorithm_type
  ]);

  const [state, setState] = useState<UseMatchesState>({
    candidates: [],
    profiles: new Map(),
    currentIndex: 0,
    loading: true,
    isLoadingMore: false,
    error: null,
    hasMoreCandidates: true,
    currentOffset: 0,
  });

  // Références stables pour éviter les dépendances circulaires
  const paramsStringRef = useRef<string>('');
  const isUnmountedRef = useRef(false);

  // Fonction utilitaire pour réinitialiser l'état
  const resetState = useCallback(() => {
    setState(prev => ({
      ...prev,
      candidates: [],
      profiles: new Map(),
      currentIndex: 0,
      loading: true,
      isLoadingMore: false,
      error: null,
      hasMoreCandidates: true,
      currentOffset: 0,
    }));
  }, []);

  // Fonction pour charger les profils utilisateur
  const loadUserProfile = useCallback(async (userId: number) => {
    // Éviter les chargements doublons
    setState(prev => {
      if (prev.profiles.has(userId) || isUnmountedRef.current) return prev;

      // Démarrer le chargement du profil de façon asynchrone
      matchService.getUserProfile(userId)
        .then(profile => {
          if (!isUnmountedRef.current) {
            setState(prevState => ({
              ...prevState,
              profiles: new Map(prevState.profiles.set(userId, profile))
            }));
          }
        })
        .catch(error => {
          console.error(`Erreur lors du chargement du profil ${userId}:`, error);
        });

      return prev;
    });
  }, []);

  // Fonction principale pour charger les candidats
  const loadCandidates = useCallback(async (reset: boolean = false, offset: number = 0) => {
    try {
      if (reset) {
        setState(prev => ({ ...prev, loading: true, error: null }));
      } else {
        setState(prev => ({ ...prev, isLoadingMore: true, error: null }));
      }

      const response = await matchService.getMatchingCandidates({
        limit: 20,
        algorithm_type: 'vector_based',
        offset,
        reset_seen: reset, // ✅ Reset la liste des profils vus côté serveur lors d'un reset
        ...stableParams
      });

      if (isUnmountedRef.current) return;

      setState(prev => {
        const newCandidates = reset ? response.candidates : [...prev.candidates, ...response.candidates];

        // Filtrer les doublons si on ajoute à la liste existante
        const uniqueCandidates = reset ? newCandidates : (() => {
          const existingIds = new Set(prev.candidates.map(c => c.id));
          const filteredNew = response.candidates.filter(c => !existingIds.has(c.id));
          return [...prev.candidates, ...filteredNew];
        })();

        return {
          ...prev,
          candidates: uniqueCandidates,
          profiles: reset ? new Map() : prev.profiles, // ✅ Vider les profils lors d'un reset
          loading: false,
          isLoadingMore: false,
          currentIndex: reset ? 0 : prev.currentIndex,
          hasMoreCandidates: response.candidates.length === 20, // Assume qu'il y en a plus si on reçoit la limite demandée
          currentOffset: offset + response.candidates.length,
        };
      });

      // Précharger le premier profil si on reset
      if (reset && response.candidates.length > 0) {
        loadUserProfile(response.candidates[0].id);
      }

      // Précharger les 3 premiers profils nouveaux si on ajoute
      if (!reset && response.candidates.length > 0) {
        response.candidates.slice(0, 3).forEach(candidate => {
          loadUserProfile(candidate.id);
        });
      }

    } catch (error) {
      if (isUnmountedRef.current) return;

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
        isLoadingMore: false,
        error: errorMessage
      }));
    }
  }, [stableParams, loadUserProfile]);

  // Fonction pour charger plus de candidats
  const loadMoreCandidates = useCallback(async () => {
    if (state.isLoadingMore || !state.hasMoreCandidates) return;

    console.log('📥 Chargement de candidats supplémentaires...');
    await loadCandidates(false, state.currentOffset);
  }, [loadCandidates, state.isLoadingMore, state.hasMoreCandidates, state.currentOffset]);

  // Fonction pour passer au profil suivant
  const nextProfile = useCallback(() => {
    setState(prev => {
      const nextIndex = prev.currentIndex + 1;

      // Si on arrive à la fin de la liste, essayer de charger plus
      if (nextIndex >= prev.candidates.length) {
        if (prev.hasMoreCandidates && !prev.isLoadingMore) {
          console.log('🔄 Fin de liste atteinte, chargement de nouveaux candidats...');
          loadMoreCandidates();
        }
        return prev; // Ne pas changer l'index pour l'instant
      }

      // Précharger le profil courant et suivant
      if (nextIndex < prev.candidates.length) {
        const currentCandidate = prev.candidates[nextIndex];
        if (!prev.profiles.has(currentCandidate.id)) {
          loadUserProfile(currentCandidate.id);
        }

        // Précharger le profil suivant
        const preloadIndex = nextIndex + 1;
        if (preloadIndex < prev.candidates.length) {
          const preloadCandidate = prev.candidates[preloadIndex];
          if (!prev.profiles.has(preloadCandidate.id)) {
            loadUserProfile(preloadCandidate.id);
          }
        }

        // Si on approche de la fin (moins de 5 profils restants), charger plus
        const remainingProfiles = prev.candidates.length - nextIndex;
        if (remainingProfiles <= 5 && prev.hasMoreCandidates && !prev.isLoadingMore) {
          console.log('🔄 Approche de la fin de liste, chargement préventif...');
          setTimeout(() => loadMoreCandidates(), 500);
        }
      }

      return { ...prev, currentIndex: nextIndex };
    });
  }, [loadUserProfile, loadMoreCandidates]);

  // Actions utilisateur
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

  // Fonction refresh manuelle
  const refresh = useCallback(async () => {
    console.log('🔄 Refresh manuel des candidats...');
    // loadCandidates avec reset=true fait déjà le reset complet
    await loadCandidates(true, 0);
  }, [loadCandidates]);

  // Effet pour le montage initial
  useEffect(() => {
    isUnmountedRef.current = false;
    loadCandidates(true, 0);

    return () => {
      isUnmountedRef.current = true;
    };
  }, []); // Pas de dépendance sur loadCandidates pour éviter les re-renders

  // Effet pour détecter les changements de paramètres de filtre
  useEffect(() => {
    const currentParamsString = JSON.stringify(stableParams);

    if (paramsStringRef.current && paramsStringRef.current !== currentParamsString) {
      console.log('🔄 Changement de filtres détecté, rechargement des candidats...');
      console.log('Anciens paramètres:', paramsStringRef.current);
      console.log('Nouveaux paramètres:', currentParamsString);

      // Délai pour éviter les appels trop rapides lors de changements multiples
      const timeoutId = setTimeout(() => {
        // loadCandidates avec reset=true fait déjà le reset complet
        loadCandidates(true, 0);
      }, 300);

      paramsStringRef.current = currentParamsString;

      return () => clearTimeout(timeoutId);
    } else {
      paramsStringRef.current = currentParamsString;
    }
  }, [stableParams, loadCandidates]);

  // Valeurs de retour calculées
  const currentCandidate = state.candidates[state.currentIndex] || null;
  const currentProfile = currentCandidate ? state.profiles.get(currentCandidate.id) || null : null;
  const isProfileLoading = currentCandidate && !currentProfile && !state.error;

  return {
    currentProfile,
    currentCandidate,
    loading: state.loading,
    isLoadingMore: state.isLoadingMore,
    error: state.error,
    isProfileLoading,
    hasMoreCandidates: state.hasMoreCandidates,
    totalCandidates: state.candidates.length,
    currentIndex: state.currentIndex,
    actions: {
      like: likeUser,
      pass: passUser,
      block: blockUser,
      refresh,
      loadMore: loadMoreCandidates
    }
  };
}