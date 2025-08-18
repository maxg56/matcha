import { useState } from "react";

export default function DesktopLayout() {
	const [isOpen, setIsOpen] = useState(true);

	return (
		<div
			className={`h-screen grid transition-all duration-300 ${
				isOpen
					? "grid-cols-[250px_1fr_200px]"
					: "grid-cols-[250px_1fr]"
			}`}
		>
			{/* Colonne gauche : Conversations */}
			<aside className="border-r p-4 bg-gray-50">
				<h2 className="font-bold mb-4">Conversations</h2>
				<ul className="space-y-2">
					<li>Nom 1</li>
					<li>Nom 2</li>
					<li>Nom 3</li>
				</ul>
			</aside>

			{/* Zone centrale : Chat/Photos */}
			<main className="p-4 flex flex-col relative">
				<div className="flex-1 bg-gray-100 rounded-lg p-4">
					Zone Chat / Photo
				</div>

				{/* Bouton flottant pour rouvrir (bas droite de la zone centrale) */}
				{!isOpen && (
					<button
						onClick={() => setIsOpen(true)}
						className="absolute top-20 right-0 bg-gray-200 px-2 py-1 rounded-l shadow hover:bg-gray-300"
					>
						⬅️
					</button>
				)}
			</main>

			{/* Colonne droite : Options */}
			{isOpen && (
				<aside className="border-l p-4 bg-gray-50 overflow-hidden transition-all duration-300">
					<div className="flex justify-between items-center mb-4">
						<button
							onClick={() => setIsOpen(false)}
							className="font-bold text-left hover:underline focus:outline-none"
						>
							➡️
						</button>
					</div>
					<button className="w-full bg-blue-500 text-white rounded p-2">
						Action
					</button>
				</aside>
			)}
		</div>
	);
}
