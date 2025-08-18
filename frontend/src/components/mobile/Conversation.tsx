import ConversationList from './ConversationList';
import ConversationView from './ConversationView';
import { useState, useEffect } from 'react';

export type Message = {
	fromMe: boolean;
	text: string;
};

export type Conversation = {
	id: number;
	name: string;
	avatar: string;
	messages: Message[];
};

const initialConversations: Conversation[] = [
{
		id: 1,
		name: 'Alice',
		avatar: 'https://i.pravatar.cc/40?img=1',
		messages: [
			{ fromMe: false, text: 'Salut 👋' },
			{ fromMe: true, text: 'Hey Alice, ça va ?' },
		],
	},
	{
		id: 2,
		name: 'Bob',
		avatar: 'https://i.pravatar.cc/40?img=2',
		messages: [{ fromMe: false, text: 'Yo mec' }],
	},
];

export default function ConversationApp() {
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [activeConvId, setActiveConvId] = useState<number | null>(null);
	const [inputValue, setInputValue] = useState('');

	useEffect(() => {
    const saved = localStorage.getItem('conversations');
		if (saved) {
			setConversations(JSON.parse(saved));
		} else {
			setConversations(initialConversations);
		}
	}, []);

	useEffect(() => {
		if (conversations.length > 0) {
			localStorage.setItem('conversations', JSON.stringify(conversations));
		}
	}, [conversations]);

	const activeConv = conversations.find(c => c.id === activeConvId) || null;

	const sendMessage = () => {
		if (!activeConv || !inputValue.trim()) return;
			const newMessage: Message = { fromMe: true, text: inputValue.trim() };
			setConversations(prev => prev.map(conv =>
			conv.id === activeConv.id ? { ...conv, messages: [...conv.messages, newMessage] } : conv
		));
		setInputValue('');
	};

	return (
    <div className="flex flex-col h-full border">
	{activeConv ? (
        <ConversationView
			conversation={activeConv}
			sendMessage={sendMessage}
			inputValue={inputValue}
			setInputValue={setInputValue}
			goBack={() => setActiveConvId(null)}
        />
		) : (
        <>
			<h1 className="text-xl font-bold p-4 border-b">💬 Conversations</h1>
			<ConversationList
				conversations={conversations}
				setActiveConvId={setActiveConvId}
			/>
        </>
			)}
    </div>
	);
}
