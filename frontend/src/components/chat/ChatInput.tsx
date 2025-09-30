import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ChatInput({ 
  onSendMessage, 
  placeholder = "Tapez votre message...", 
  disabled = false, 
  className 
}: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn(
      "sticky bottom-0 glass-card backdrop-blur-md border-t border-border/30 p-4",
      className
    )}>
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "min-h-0 resize-none border-border/30 rounded-2xl",
              "focus:ring-primary/50 pr-12",
              "glass-light backdrop-blur-sm",
              "chat-input-auto-height"
            )}
            rows={1}
          />
          
          <Button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            size="icon"
            className={cn(
              "absolute right-2 bottom-2 h-8 w-8 rounded-full",
              "transition-all duration-200 shadow-lg",
              message.trim() 
                ? "glass-purple hover:scale-110 scale-100" 
                : "glass-light scale-75"
            )}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}