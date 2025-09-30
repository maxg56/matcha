import { loadStripe } from "@stripe/stripe-js";
// import { Elements } from "@stripe/react-stripe-js";
import { useEffect } from "react";
import { apiService } from '../../services/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);


interface PaymentModalProps {
  onClose: () => void;
  plan: string;
}

export default function PaymentModal({ onClose, plan }: PaymentModalProps) {
  useEffect(() => {
    const startCheckout = async () => {
      try {
        // Utiliser le service API centralisé pour créer une session Stripe
        const session = await apiService.post<{ id: string }>('/api/v1/stripe/create-checkout-session', { plan });

        const stripe = await stripePromise;
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({ sessionId: session.id });
          if (error) console.error(error.message);
        }
      } catch (error) {
        console.error('Erreur lors de la création de la session Stripe:', error);
      }
    };

    startCheckout();
  }, [plan]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-[400px] relative">
        <button onClick={onClose} className="absolute top-2 right-2">✕</button>
        <p>Redirection vers Stripe...</p>
      </div>
    </div>
  );
}
