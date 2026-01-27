import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/stores/chatStore';

interface MessageContextMenuProps {
  messageId: number;
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  onEmojiSelect: (emoji: string) => void;
  onMoreEmojis: () => void;
}

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢'];

export function MessageContextMenu({
  messageId,
  isOpen,
  onClose,
  position,
  onEmojiSelect,
  onMoreEmojis
}: MessageContextMenuProps) {
  const { sendReactionWebSocket } = useChatStore();

  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as Element;
        if (!target.closest('.message-context-menu')) {
          onClose();
        }
      };

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  const handleEmojiClick = (emoji: string) => {
    // console.log('MessageContextMenu: Sending reaction:', { messageId, emoji, action: 'add' });
    sendReactionWebSocket(messageId, emoji, 'add');
    onEmojiSelect(emoji);
    onClose();
  };

  const handleMoreClick = () => {
    onMoreEmojis();
    onClose();
  };

  if (!isOpen) return null;

  // Calculer la position ajustée pour éviter que le menu sorte de l'écran
  const menuWidth = 280; // Largeur approximative du menu (5 emojis + séparateur + bouton plus + padding)
  const menuHeight = 60; // Hauteur approximative du menu
  const margin = 10; // Marge par rapport aux bords de l'écran
  
  const adjustedPosition = {
    x: Math.min(
      Math.max(margin, position.x - menuWidth / 2), // Centrer sur le message mais pas trop à gauche
      window.innerWidth - menuWidth - margin // Pas trop à droite
    ),
    y: Math.max(margin, position.y - menuHeight - 10) // Au-dessus du message avec une petite marge
  };

  return createPortal(
    <div
      className="message-context-menu fixed bg-popover border border-border rounded-lg shadow-lg backdrop-blur-sm animate-in fade-in-0 zoom-in-95 duration-200 z-50"
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
      }}
    >
      <div className="flex items-center p-2 gap-1">
        {/* Quick emoji reactions */}
        {QUICK_EMOJIS.map((emoji) => (
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

        {/* Separator */}
        <div className="w-px h-6 bg-border mx-1" />

        {/* More emojis button */}
        <button
          onClick={handleMoreClick}
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-lg",
            "text-sm transition-all duration-150",
            "hover:bg-accent hover:scale-110 active:scale-95",
            "text-muted-foreground"
          )}
          title="Plus d'émojis"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
          >
            <circle cx="12" cy="12" r="1" fill="currentColor" />
            <circle cx="19" cy="12" r="1" fill="currentColor" />
            <circle cx="5" cy="12" r="1" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>,
    document.body
  );
}