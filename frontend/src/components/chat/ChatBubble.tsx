import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { MessageReactions } from './MessageReactions';
import { MessageContextMenu } from './MessageContextMenu';
import { EmojiPicker } from './EmojiPicker';
import type { MessageReaction } from '@/services/websocket/types';

interface ChatBubbleProps {
  message: {
    id: string | number;
    content: string;
    timestamp: string;
    isOwn: boolean;
    status?: 'sent' | 'delivered' | 'read';
    reactions?: MessageReaction[];
  };
  className?: string;
}

export function ChatBubble({ message, className }: ChatBubbleProps) {
  const messageId = typeof message.id === 'string' ? parseInt(message.id) : message.id;
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  // Debug: log message data
  console.log('ChatBubble message:', {
    id: message.id,
    content: message.content.substring(0, 20) + '...',
    hasReactions: !!message.reactions,
    reactionsCount: message.reactions?.length || 0,
    reactions: message.reactions
  });

  const handleLongPressStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    longPressTimer.current = setTimeout(() => {
      setContextMenuPosition({ x: clientX, y: clientY });
      setShowContextMenu(true);
    }, 500); // 500ms for long press
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleContextMenuClose = () => {
    setShowContextMenu(false);
  };

  const handleEmojiSelect = (emoji: string) => {
    // Handled in the context menu component
  };

  const handleMoreEmojis = () => {
    setShowEmojiPicker(true);
  };

  const handleEmojiPickerClose = () => {
    setShowEmojiPicker(false);
  };

  // Test: force reactions for demo - À SUPPRIMER PLUS TARD
  const testReactions = message.reactions && message.reactions.length > 0 ?
    message.reactions :
    (message.id === 1 ? [{
      id: 999,
      message_id: 1,
      user_id: 123,
      emoji: '👍',
      created_at: new Date().toISOString()
    }] : []);

  return (
    <div className={cn(
      "flex w-full mb-3 px-4",
      message.isOwn ? "justify-end" : "justify-start",
      className
    )}>
      <div className={cn(
        "flex flex-col gap-1",
        "max-w-[85%] sm:max-w-[75%] lg:max-w-[65%]",
        message.isOwn ? "items-end" : "items-start"
      )}>
        {/* Message bubble */}
        <div
          ref={bubbleRef}
          className={cn(
            "relative px-4 py-3 rounded-2xl select-none",
            "break-words text-wrap", // Permet le retour à la ligne
            "shadow-sm transition-all duration-200",
            "user-select-none cursor-pointer",
            message.isOwn ? [
              "bg-gradient-to-r from-purple-600 to-blue-600",
              "text-white rounded-br-md",
              "shadow-purple-500/20"
            ] : [
              "bg-white dark:bg-gray-800",
              "text-gray-900 dark:text-gray-100 rounded-bl-md",
              "border border-gray-200 dark:border-gray-700",
              "shadow-gray-500/10"
            ]
          )}
          onMouseDown={handleLongPressStart}
          onMouseUp={handleLongPressEnd}
          onMouseLeave={handleLongPressEnd}
          onTouchStart={handleLongPressStart}
          onTouchEnd={handleLongPressEnd}
          onTouchCancel={handleLongPressEnd}
          onContextMenu={(e) => {
            e.preventDefault(); // Empêche le menu contextuel du navigateur
            const rect = bubbleRef.current?.getBoundingClientRect();
            if (rect) {
              setContextMenuPosition({
                x: rect.left + rect.width / 2,
                y: rect.top
              });
              setShowContextMenu(true);
            }
          }}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>

        {/* Reactions */}
        <MessageReactions
          messageId={messageId}
          reactions={testReactions}
          className={message.isOwn ? "mr-2" : "ml-2"}
        />

        {/* Timestamp and status */}
        <div className={cn(
          "flex items-center gap-2 px-2",
          message.isOwn ? "flex-row-reverse" : "flex-row"
        )}>
          <span className="text-xs text-muted-foreground">
            {message.timestamp}
          </span>

          {message.isOwn && message.status && (
            <div className="flex items-center gap-0.5">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                message.status === 'sent' && "bg-muted-foreground/40",
                message.status === 'delivered' && "bg-muted-foreground/60",
                message.status === 'read' && "bg-primary"
              )} />
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                message.status === 'delivered' && "bg-muted-foreground/60",
                message.status === 'read' && "bg-primary"
              )} />
            </div>
          )}
        </div>
      </div>

      {/* Context menu */}
      <MessageContextMenu
        messageId={messageId}
        isOpen={showContextMenu}
        onClose={handleContextMenuClose}
        position={contextMenuPosition}
        onEmojiSelect={handleEmojiSelect}
        onMoreEmojis={handleMoreEmojis}
      />

      {/* Emoji picker */}
      <EmojiPicker
        messageId={messageId}
        isOpen={showEmojiPicker}
        onClose={handleEmojiPickerClose}
        onEmojiSelect={handleEmojiSelect}
      />
    </div>
  );
}