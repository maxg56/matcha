import { apiService } from './api';
import type {
  UserSubscription,
  BillingPortalResponse,
  CheckoutSessionResponse,
  PaymentHistory,
  PaymentStats,
  PlanType
} from '../types/subscription';

class SubscriptionService {
  /**
   * Récupère l'abonnement actuel de l'utilisateur
   */
  async getCurrentSubscription(): Promise<UserSubscription | null> {
    try {
      const subscription = await apiService.get<UserSubscription>('/api/stripe/subscription/');
      return subscription;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'abonnement:', error);
      return null;
    }
  }

  /**
   * Crée une session de checkout Stripe pour un plan donné
   */
  async createCheckoutSession(planType: PlanType): Promise<CheckoutSessionResponse> {
    return await apiService.post<CheckoutSessionResponse>('/api/stripe/create-checkout-session', {
      plan: planType
    });
  }

  /**
   * Crée un abonnement via l'API moderne
   */
  async createSubscription(planType: PlanType): Promise<CheckoutSessionResponse> {
    return await apiService.post<CheckoutSessionResponse>('/api/stripe/subscription/', {
      plan_type: planType
    });
  }

  /**
   * Annule l'abonnement actuel
   */
  async cancelSubscription(): Promise<{ success: boolean; message: string }> {
    return await apiService.delete<{ success: boolean; message: string }>('/api/stripe/subscription/');
  }

  /**
   * Obtient l'URL du portail de facturation Stripe
   */
  async getBillingPortalUrl(): Promise<string> {
    const response = await apiService.get<BillingPortalResponse>('/api/stripe/subscription/billing-portal');
    return response.url;
  }

  /**
   * Récupère l'historique des paiements de l'utilisateur
   */
  async getPaymentHistory(): Promise<PaymentHistory[]> {
    return await apiService.get<PaymentHistory[]>('/api/stripe/payment/history');
  }

  /**
   * Récupère les statistiques de paiement de l'utilisateur
   */
  async getPaymentStats(): Promise<PaymentStats> {
    return await apiService.get<PaymentStats>('/api/stripe/payment/stats');
  }

  /**
   * Vérifie si l'utilisateur a un abonnement actif
   */
  async isPremiumUser(): Promise<boolean> {
    try {
      const subscription = await this.getCurrentSubscription();
      return subscription?.status === 'active' || false;
    } catch (error) {
      console.error('Erreur lors de la vérification du statut premium:', error);
      return false;
    }
  }

  /**
   * Redirige vers Stripe Checkout
   */
  async redirectToCheckout(sessionId: string): Promise<void> {
    console.log('🔄 Début de redirectToCheckout avec sessionId:', sessionId);
    console.log('🔑 Clé publique Stripe:', import.meta.env.VITE_STRIPE_PUBLIC_KEY);

    const stripe = await import('@stripe/stripe-js').then(module =>
      module.loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
    );

    console.log('📦 Stripe instance chargée:', !!stripe);

    const stripeInstance = stripe;
    if (stripeInstance) {
      console.log('✅ Stripe instance valide, redirection en cours...');
      const { error } = await stripeInstance.redirectToCheckout({ sessionId });
      if (error) {
        console.error('❌ Erreur lors de la redirection vers Stripe:', error);
        throw new Error(error.message || 'Erreur lors de la redirection vers le paiement');
      }
      console.log('🚀 Redirection réussie');
    } else {
      console.error('❌ Impossible de charger Stripe');
      throw new Error('Impossible de charger Stripe');
    }
  }
}

export const subscriptionService = new SubscriptionService();