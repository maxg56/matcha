import { useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/stores/chatStore';

interface EmojiPickerProps {
  messageId: number;
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
}

const EMOJI_CATEGORIES = {
  'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
  'Gestures': ['👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
  'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝'],
  'Faces': ['😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥸', '😈', '👿', '👹', '👺', '🤡', '💩'],
};

export function EmojiPicker({ messageId, isOpen, onClose, onEmojiSelect }: EmojiPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof EMOJI_CATEGORIES>('Smileys');
  const { sendReactionWebSocket } = useChatStore();

  const handleEmojiClick = (emoji: string) => {
    sendReactionWebSocket(messageId, emoji, 'add');
    onEmojiSelect(emoji);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in-0 duration-200">
      <div className="bg-popover border border-border rounded-lg shadow-lg max-w-sm w-full mx-4 max-h-96 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Choisir un emoji</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex border-b border-border">
          {Object.keys(EMOJI_CATEGORIES).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category as keyof typeof EMOJI_CATEGORIES)}
              className={cn(
                "flex-1 px-3 py-2 text-xs font-medium transition-colors",
                selectedCategory === category
                  ? "bg-primary/10 text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Emoji grid */}
        <div className="p-4 max-h-64 overflow-y-auto">
          <div className="grid grid-cols-6 gap-2">
            {EMOJI_CATEGORIES[selectedCategory].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-lg",
                  "text-xl transition-all duration-150",
                  "hover:bg-accent hover:scale-110 active:scale-95"
                )}
                title={`Réagir avec ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}