import type { Conversation } from './Conversation';

type Props = {
	conversation: Conversation;
	inputValue: string;
	setInputValue: (val: string) => void;
	sendMessage: () => void;
	goBack: () => void;
};

export default function ConversationView({ conversation, inputValue, setInputValue, sendMessage, goBack }: Props) {
	return (
    <div className="flex flex-col h-full">
		{/* Header */}
		<div className="flex items-center gap-2 p-4 border-b">
			<button onClick={goBack} className="text-blue-500">←</button>
			<img src={conversation.avatar} alt={conversation.name} className="w-8 h-8 rounded-full" />
			<h2 className="font-bold">{conversation.name}</h2>
		</div>

		{/* Messages */}
		<div className="flex-1 overflow-y-auto p-4 space-y-2">
			{conversation.messages.map((msg, i) => (
			<div key={i} className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}>
				<div className={`px-3 py-2 rounded-lg max-w-xs ${msg.fromMe ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-black rounded-bl-none'}`}>
				{msg.text}
				</div>
			</div>
			))}
		</div>

		{/* Zone de saisie */}
		<div className="p-3 border-t flex gap-2">
			<input
			type="text"
			placeholder="Écrire un message..."
			value={inputValue}
			onChange={e => setInputValue(e.target.value)}
			onKeyDown={e => e.key === 'Enter' && sendMessage()}
			className="flex-1 border rounded px-3 py-2"
			/>
			<button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded">
				Envoyer
			</button>
		</div>
	</div>
	);
}
