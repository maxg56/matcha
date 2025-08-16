import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, MessageCircle, Search, User } from "lucide-react";

export default function MobileLayout() {
	const [tab, setTab] = useState("conversations");
	const navigate = useNavigate();

	return (
		<div className="h-screen flex flex-col bg-background">
			{/* Header avec bouton retour */}
			<div className="flex items-center justify-between p-4 border-b border-border bg-card">
				<button 
					onClick={() => navigate(-1)}
					className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
				>
					<ArrowLeft className="h-5 w-5" />
					<span>Retour</span>
				</button>
				<h1 className="text-lg font-semibold text-foreground">Conversations</h1>
				<div className="w-16"></div> {/* Spacer pour centrer le titre */}
			</div>

			{/* Contenu */}
			<div className="flex-1 p-4 overflow-auto">
				{tab === "accueil" && <div className="text-foreground">🏠 Accueil</div>}
				{tab === "conversations" && <div className="text-foreground">💬 Conversations - Liste des conversations</div>}
				{tab === "recherche" && <div className="text-foreground">🔍 Recherche</div>}
				{tab === "profil" && <div className="text-foreground">👤 Profil</div>}
			</div>

			{/* Barre d'onglets */}
			<nav className="border-t border-border bg-card flex justify-around py-2 md:hidden">
				<button
					onClick={() => setTab("accueil")}
					className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
						tab === "accueil" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
					}`}
				>
					<Home className="h-5 w-5" />
					<span className="text-xs">Accueil</span>
				</button>
				<button
					onClick={() => setTab("conversations")}
					className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
						tab === "conversations" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
					}`}
				>
					<MessageCircle className="h-5 w-5" />
					<span className="text-xs">Conversations</span>
				</button>
				<button
					onClick={() => setTab("recherche")}
					className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
						tab === "recherche" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
					}`}
				>
					<Search className="h-5 w-5" />
					<span className="text-xs">Recherche</span>
				</button>
				<button
					onClick={() => setTab("profil")}
					className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
						tab === "profil" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
					}`}
				>
					<User className="h-5 w-5" />
					<span className="text-xs">Profil</span>
				</button>
			</nav>
		</div>
	);
}
