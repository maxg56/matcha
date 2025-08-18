import type { Conversation } from './Conversation';

type Props = {
	conversations: Conversation[];
	setActiveConvId: (id: number) => void;
};

export default function ConversationList({ conversations, setActiveConvId }: Props) {
return (
	<ul className="flex-1 overflow-y-auto divide-y">
		{conversations.map(conv => {
		const lastMsg = conv.messages[conv.messages.length - 1];
			return (
				<li
				key={conv.id}
				className="flex items-center gap-3 p-4 hover:bg-gray-100 cursor-pointer"
				onClick={() => setActiveConvId(conv.id)}
				>
				<img src={conv.avatar} alt={conv.name} className="w-10 h-10 rounded-full" />
				<div className="flex-1">
					<p className="font-semibold">{conv.name}</p>
					<p className="text-sm text-gray-500 truncate">
					{lastMsg ? lastMsg.text : 'Pas encore de messages'}
					</p>
				</div>
				</li>
			);
		})}
	</ul>
);
}
