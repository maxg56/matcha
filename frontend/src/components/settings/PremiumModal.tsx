import { useState } from "react";
import PaymentModal from "./PayementModal";

export default function PremiumModal({ onClose }: { onClose: () => void }) {
	const [openPayment, setOpenPayment] = useState(false);
	const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

	return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
		<div className="bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 rounded-lg w-[400px] relative">
			<button onClick={onClose} className="absolute top-2 right-2 text-gray-600">✕</button>

			<h2 className="text-lg text-primary font-bold mb-4">Choisis ton abonnement</h2>

			<div className="space-y-3">
				<button 
					onClick={() => setSelectedPlan("mensuel")}
					className={`w-full text-primary p-3 rounded border ${selectedPlan === "mensuel" ? "border-sidebar-primary bg-secondary-foreground" : "border-gray-300"}`}
				>
					Mensuel - 9,99€
				</button>

				<button 
					onClick={() => setSelectedPlan("annuel")}
					className={`w-full text-primary p-3 rounded border ${selectedPlan === "annuel" ? "border-sidebar-primary bg-secondary-foreground" : "border-gray-300"}`}
					>
					Annuel - 99,99€
				</button>
			</div>

			<button
				disabled={!selectedPlan}
				onClick={() => setOpenPayment(true)}
				className="mt-4 w-full bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
			>
				Payer
			</button>

        {openPayment && (
			<PaymentModal 
				onClose={() => setOpenPayment(false)} 
				plan={selectedPlan!} 
			/>
        )}
		</div>
    </div>
	);
}
