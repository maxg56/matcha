export default function DesktopLayout() {
	return (
    <div className="h-screen grid grid-cols-[250px_1fr_200px]">
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
		<main className="p-4 flex flex-col">
			<div className="flex-1 bg-gray-100 rounded-lg p-4">
			Zone Chat / Photo
			</div>
		</main>

      {/* Colonne droite : Options */}
		<aside className="border-l p-4 bg-gray-50">
			<h2 className="font-bold mb-4">Options</h2>
			<button className="w-full bg-blue-500 text-white rounded p-2">
			Action
			</button>
		</aside>
	</div>
	);
}
