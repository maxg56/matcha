import { loadStripe } from "@stripe/stripe-js";
// import { Elements } from "@stripe/react-stripe-js";
import { useEffect } from "react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);


interface PaymentModalProps {
  onClose: () => void;
  plan: string;
}

export default function PaymentModal({ onClose, plan }: PaymentModalProps) {
  useEffect(() => {
    const startCheckout = async () => {
      // Appeler ton backend pour créer une session Stripe
      const API_URL = import.meta.env.VITE_API_URL;

      const res = await fetch(`${API_URL}/api/stripe/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const session = await res.json();

      const stripe = await stripePromise;
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId: session.id });
        if (error) console.error(error.message);
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
