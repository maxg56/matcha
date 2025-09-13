import { useState, useEffect } from 'react';
import { paymentService, type SubscriptionStatus } from '../services/paymentService';

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      const status = await paymentService.getSubscriptionStatus();
      setSubscription(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Note: L'endpoint cancel-subscription n'est pas encore implémenté dans le backend
  const cancelSubscription = async () => {
    setError('La fonction d\'annulation n\'est pas encore disponible');
    return false;
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  return {
    subscription,
    loading,
    error,
    refetch: fetchSubscription,
    cancel: cancelSubscription,
    isActive: subscription?.is_active === true,
    isPastDue: subscription?.status === 'past_due',
    isCanceled: subscription?.status === 'canceled',
    hasSubscription: subscription?.has_subscription === true,
  };
};