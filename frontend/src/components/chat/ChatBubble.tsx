import { cn } from '@/lib/utils';

interface ChatBubbleProps {
  message: {
    id: string;
    content: string;
    timestamp: string;
    isOwn: boolean;
    status?: 'sent' | 'delivered' | 'read';
  };
  className?: string;
}

export function ChatBubble({ message, className }: ChatBubbleProps) {
  return (
    <div className={cn(
      "flex w-full mb-4",
      message.isOwn ? "justify-end" : "justify-start",
      className
    )}>
      <div className={cn(
        "max-w-[80%] px-4 py-2 rounded-3xl",
        "transform transition-all duration-200 hover:scale-[1.02]",
        message.isOwn
          ? "glass-purple text-white rounded-br-lg shadow-lg"
          : "glass-card text-foreground rounded-bl-lg shadow-lg"
      )}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>

        <div className={cn(
          "flex items-center justify-end gap-1 mt-1",
          message.isOwn ? "text-white/70" : "text-muted-foreground"
        )}>
          <span className="text-xs">
            {message.timestamp}
          </span>

          {message.isOwn && message.status && (
            <div className="flex">
              <div className={cn(
                "w-1 h-1 rounded-full mx-0.5",
                message.status === 'sent' && "bg-white/50",
                message.status === 'delivered' && "bg-white/70",
                message.status === 'read' && "bg-white"
              )} />
              <div className={cn(
                "w-1 h-1 rounded-full",
                message.status === 'delivered' && "bg-white/70",
                message.status === 'read' && "bg-white"
              )} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
