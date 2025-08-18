import { useState, useEffect, useRef, useCallback } from 'react';

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  status: 'sent' | 'delivered' | 'read';
}

interface ChatUser {
  id: string;
  name: string;
  image: string;
  isOnline: boolean;
}

export function useChat(matchId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [chatUser, setChatUser] = useState<ChatUser | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate loading chat data
    const loadChatData = async () => {
      setIsLoading(true);

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Set mock data
      setMessages([
        {
          id: '1',
          content: 'Salut ! Comment ça va ? 😊',
          timestamp: '14:30',
          isOwn: false,
          status: 'read',
        },
        {
          id: '2',
          content: 'Salut Emma ! Ça va très bien merci 😄 Et toi ?',
          timestamp: '14:32',
          isOwn: true,
          status: 'read',
        },
        {
          id: '3',
          content: 'Super ! J\'ai vu que tu aimais la photographie, moi aussi ! Tu as un appareil préféré ?',
          timestamp: '14:33',
          isOwn: false,
          status: 'read',
        },
        {
          id: '4',
          content: 'Oui j\'adore ça ! J\'utilise principalement un Canon R6, et toi ?',
          timestamp: '14:35',
          isOwn: true,
          status: 'delivered',
        },
      ]);

      setChatUser({
        id: matchId,
        name: 'Emma',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
        isOnline: true,
      });

      setIsLoading(false);
    };

    loadChatData();
  }, [matchId]);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageToSend = newMessage.trim();
    setNewMessage('');

    // Add message optimistically
    const tempMessage: Message = {
      id: Date.now().toString(),
      content: messageToSend,
      timestamp: new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      isOwn: true,
      status: 'sent',
    };

    setMessages(prev => [...prev, tempMessage]);

    try {
      // TODO: Send message to API
      console.log('Sending message:', messageToSend);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update message status
      setMessages(prev =>
        prev.map(msg =>
          msg.id === tempMessage.id
            ? { ...msg, status: 'delivered' as const }
            : msg
        )
      );

      // Simulate other user typing and responding
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          // Add a mock response (you would remove this in real implementation)
          const response: Message = {
            id: (Date.now() + 1).toString(),
            content: 'Intéressant ! 📸',
            timestamp: new Date().toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            isOwn: false,
            status: 'read',
          };
          setMessages(prev => [...prev, response]);
        }, 2000);
      }, 1000);

    } catch (error) {
      console.error('Error sending message:', error);
      // Handle error - maybe show a retry option
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const markMessagesAsRead = useCallback(() => {
    // TODO: Mark messages as read via API
    console.log('Marking messages as read');
  }, []);

  const startCall = (type: 'voice' | 'video') => {
    console.log(`Starting ${type} call with ${chatUser?.name}`);
    // TODO: Implement call functionality
  };

  return {
    messages,
    newMessage,
    setNewMessage,
    isLoading,
    isTyping,
    chatUser,
    messagesEndRef,
    sendMessage,
    handleKeyPress,
    markMessagesAsRead,
    startCall,
  };
}
