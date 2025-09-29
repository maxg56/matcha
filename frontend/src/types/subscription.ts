export type PlanType = 'gratuit' | 'mensuel' | 'annuel';

export type SubscriptionStatus = 'active' | 'inactive' | 'canceled' | 'past_due' | 'unpaid';

export interface PricingPlan {
  id: PlanType;
  name: string;
  price: number;
  originalPrice?: number;
  currency: string;
  period: string;
  popular?: boolean;
  features: string[];
  limitations?: string[];
}

export interface UserSubscription {
  id: string;
  userId: string;
  planType: PlanType;
  status: SubscriptionStatus;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
}

export interface BillingPortalResponse {
  url: string;
}

export interface CheckoutSessionResponse {
  id: string;
  url: string;
}

export interface PaymentHistory {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethodType?: string;
  createdAt: string;
  failureReason?: string;
}

export interface PaymentStats {
  totalPaid: number;
  totalPayments: number;
  averagePayment: number;
  currency: string;
  lastPaymentDate?: string;
}