import { useState } from "react";

export default function MobileLayout() {
	const [tab, setTab] = useState("accueil");

	return (
		<div className="h-screen flex flex-col">
			{/* Contenu */}
			<div className="flex-1 p-4 overflow-auto">
				{tab === "accueil" && <div>🏠 Accueil</div>}
				{tab === "conversations" && <div>💬 Conversations</div>}
				{tab === "recherche" && <div>🔍 Recherche</div>}
				{tab === "profil" && <div>👤 Profil</div>}
			</div>

			{/* Barre d’onglets */}
			<nav className="border-t bg-white flex justify-around py-2 md:hidden">
				<button
					onClick={() => setTab("accueil")}
					className={`flex flex-col items-center ${tab === "accueil" ? "text-blue-500" : ""}`}
				>
					🏠
					<span className="text-xs">Accueil</span>
				</button>
				<button
					onClick={() => setTab("conversations")}
					className={`flex flex-col items-center ${tab === "conversations" ? "text-blue-500" : ""}`}
				>
					💬
					<span className="text-xs">Conversations</span>
				</button>
				<button
					onClick={() => setTab("recherche")}
					className={`flex flex-col items-center ${tab === "recherche" ? "text-blue-500" : ""}`}
				>
					🔍
					<span className="text-xs">Recherche</span>
				</button>
				<button
					onClick={() => setTab("profil")}
					className={`flex flex-col items-center ${tab === "profil" ? "text-blue-500" : ""}`}
				>
					👤
					<span className="text-xs">Profil</span>
				</button>
			</nav>
		</div>
	);
}
