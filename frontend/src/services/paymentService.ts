const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:8443';

export interface CreateCheckoutSessionRequest {
  plan: 'mensuel' | 'annuel';
}

export interface CreateCheckoutSessionResponse {
  session_id: string;
  url: string;
}

export interface SubscriptionStatus {
  has_subscription: boolean;
  status: string;
  plan?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  is_active?: boolean;
}

export const paymentService = {
  async createCheckoutSession(data: CreateCheckoutSessionRequest): Promise<CreateCheckoutSessionResponse> {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${API_BASE_URL}/api/v1/stripe/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = 'Erreur lors de la création de la session de paiement';
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
      } catch {
        // If response is not JSON, use response text or status
        const text = await response.text();
        errorMessage = text || `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    try {
      const result = await response.json();
      return result.success ? result.data : result;
    } catch (error) {
      const text = await response.text();
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
    }
  },

  async getSubscriptionStatus(): Promise<SubscriptionStatus | null> {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${API_BASE_URL}/api/v1/stripe/subscription/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // No active subscription
      }
      let errorMessage = 'Erreur lors de la récupération du statut d\'abonnement';
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
      } catch {
        const text = await response.text();
        errorMessage = text || `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    try {
      const result = await response.json();
      return result.success ? result.data : result;
    } catch (error) {
      const text = await response.text();
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
    }
  },

};