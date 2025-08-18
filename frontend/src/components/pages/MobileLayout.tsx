import { useState } from "react";
import Gallery from "../mobile/Gallery";
import Conversation from "../mobile/Conversation";
import Research from "../mobile/Research";
import Profil from "../mobile/Profil";

export default function MobileLayout() {
	const [tab, setTab] = useState("accueil");

	return (
		<div className="h-screen flex flex-col"> 
			<div className="flex-1 p-4 overflow-auto">
				{tab === "gallery" && <Gallery />}
				{tab === "conversations" && <Conversation />}
				{tab === "research" && <Research />}
				{tab === "profil" && <Profil />}
			</div>

			<nav className="border-t bg-white flex justify-around py-2 md:hidden">
				<button onClick={() => setTab("gallery")} className={`flex flex-col items-center ${tab === "gallery" ? "text-blue-500" : ""}`}>
					🏠
					<span className="text-xs">Accueil</span>
				</button>
				<button onClick={() => setTab("conversations")} className={`flex flex-col items-center ${tab === "conversations" ? "text-blue-500" : ""}`}>
					💬
					<span className="text-xs">Conversations</span>
				</button>
				<button onClick={() => setTab("research")} className={`flex flex-col items-center ${tab === "research" ? "text-blue-500" : ""}`}>
					🔍
					<span className="text-xs">Recherche</span>
				</button>
				<button onClick={() => setTab("profil")} className={`flex flex-col items-center ${tab === "profil" ? "text-blue-500" : ""}`}>
					👤
					<span className="text-xs">Profil</span>
				</button>
			</nav>
		</div>
	);
}
