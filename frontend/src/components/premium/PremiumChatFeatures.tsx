import React, { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCheck, MoreHorizontal, Crown, Send } from 'lucide-react';
import { usePremiumStore } from '@/stores/premiumStore';
import { type Message } from '@/stores/chatStore';

interface PremiumChatFeaturesProps {
  conversationId: number;
  messages: Message[];
  onSendMessage?: (content: string) => void;
  currentUserId: number;
}

interface MessageWithStatus extends Message {
  status?: 'sent' | 'delivered' | 'read';
}

const PremiumChatFeatures: React.FC<PremiumChatFeaturesProps> = ({
  conversationId,
  messages,
  onSendMessage,
  currentUserId
}) => {
  const {
    isPremium,
    chatFeatures,
    readReceipts,
    typingIndicators,
    sendTypingIndicator,
    markMessageAsRead
  } = usePremiumStore();

  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationTyping = typingIndicators.get(conversationId) || [];
  const activeTyping = conversationTyping.filter(t => t.is_typing && t.user_id !== currentUserId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTyping]);

  // Mark messages as read when they come into view
  useEffect(() => {
    const unreadMessages = messages.filter(msg =>
      !msg.is_read && msg.sender_id !== currentUserId
    );

    if (isPremium && unreadMessages.length > 0) {
      unreadMessages.forEach(msg => {
        markMessageAsRead(msg.id, conversationId);
      });
    }
  }, [messages, isPremium, currentUserId, conversationId, markMessageAsRead]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    if (isPremium && chatFeatures?.typing_indicators) {
      if (!isTyping && e.target.value.length > 0) {
        setIsTyping(true);
        sendTypingIndicator(conversationId, true);
      }

      // Reset typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        if (isTyping) {
          setIsTyping(false);
          sendTypingIndicator(conversationId, false);
        }
      }, 3000);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (inputValue.trim() && onSendMessage) {
      onSendMessage(inputValue.trim());
      setInputValue('');

      // Stop typing indicator
      if (isTyping) {
        setIsTyping(false);
        sendTypingIndicator(conversationId, false);
      }
    }
  };

  const getMessageStatus = (message: Message): 'sent' | 'delivered' | 'read' => {
    if (message.sender_id !== currentUserId) return 'delivered';

    const messageReceipts = readReceipts.get(message.id) || [];
    if (messageReceipts.length > 0) return 'read';
    if (message.is_read) return 'read';
    return 'delivered';
  };

  const renderReadReceipt = (message: Message) => {
    if (!isPremium || !chatFeatures?.read_receipts || message.sender_id !== currentUserId) {
      return null;
    }

    const status = getMessageStatus(message);
    const messageReceipts = readReceipts.get(message.id) || [];

    return (
      <div className="flex items-center gap-1 mt-1">
        {status === 'read' ? (
          <CheckCheck className="w-3 h-3 text-blue-500" />
        ) : (
          <CheckCheck className="w-3 h-3 text-gray-400" />
        )}
        {messageReceipts.length > 0 && (
          <span className="text-xs text-gray-500">
            Lu {new Date(messageReceipts[0].read_at).toLocaleTimeString('fr', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        )}
      </div>
    );
  };

  const renderTypingIndicator = () => {
    if (!isPremium || !chatFeatures?.typing_indicators || activeTyping.length === 0) {
      return null;
    }

    return (
      <div className="flex items-center gap-2 px-4 py-2 text-gray-500 text-sm">
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="ml-2">
            {activeTyping.length === 1
              ? `${activeTyping[0].username} tape...`
              : `${activeTyping.length} personnes tapent...`
            }
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Premium Status Indicator */}
      {isPremium && (
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-200 dark:border-purple-700">
          <Crown className="w-4 h-4 text-purple-500" />
          <span className="text-sm text-purple-700 dark:text-purple-300">
            Fonctionnalités Premium actives
          </span>
          <div className="flex gap-1 ml-auto">
            {chatFeatures?.read_receipts && (
              <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                Accusés de réception
              </Badge>
            )}
            {chatFeatures?.typing_indicators && (
              <Badge variant="outline" className="text-xs border-blue-500 text-blue-600">
                Indicateurs de frappe
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender_id === currentUserId
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs opacity-70">
                  {new Date(message.sent_at).toLocaleTimeString('fr', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                {renderReadReceipt(message)}
              </div>
            </div>
          </div>
        ))}

        {renderTypingIndicator()}
        <div ref={messagesEndRef} />
      </div>

      {/* Premium Features Notice for Non-Premium Users */}
      {!isPremium && (
        <div className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-t border-purple-200 dark:border-purple-700">
          <div className="flex items-center gap-2 text-sm">
            <Crown className="w-4 h-4 text-purple-500" />
            <span className="text-purple-700 dark:text-purple-300">
              Passez au Premium pour les accusés de réception et indicateurs de frappe
            </span>
          </div>
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Tapez votre message..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!onSendMessage}
            />
            {isPremium && isTyping && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <MoreHorizontal className="w-4 h-4 text-gray-400 animate-pulse" />
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || !onSendMessage}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Typing status for current user */}
        {isPremium && isTyping && (
          <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
            <MoreHorizontal className="w-3 h-3 animate-pulse" />
            <span>Vous tapez...</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default PremiumChatFeatures;