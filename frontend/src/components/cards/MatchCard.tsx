import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MatchCardProps {
  match: {
    id: string;
    name: string;
    image: string;
    lastMessage?: string;
    timestamp?: string;
    unread?: boolean;
  };
  onClick?: (id: string) => void;
  className?: string;
}

export function MatchCard({ match, onClick, className }: MatchCardProps) {
  const handleClick = () => onClick?.(match.id);

  return (
    <div
      onClick={handleClick}
      className={cn(
        "flex items-center gap-4 p-4 bg-card rounded-2xl border border-border/50",
        "hover:bg-accent/50 active:scale-[0.98] transition-all duration-200 cursor-pointer",
        className
      )}
    >
      {/* Avatar */}
      <div className="relative">
        <img
          src={match.image}
          alt={match.name}
          className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20"
        />
        {match.unread && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-background" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className={cn(
            "font-semibold text-foreground truncate",
            match.unread && "text-primary"
          )}>
            {match.name}
          </h3>
          {match.timestamp && (
            <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
              {match.timestamp}
            </span>
          )}
        </div>
        
        {match.lastMessage && (
          <p className={cn(
            "text-sm text-muted-foreground truncate",
            match.unread && "font-medium text-foreground"
          )}>
            {match.lastMessage}
          </p>
        )}
      </div>

      {/* Action */}
      <Button
        variant="ghost"
        size="icon"
        className="flex-shrink-0 hover:bg-primary/10 hover:text-primary"
      >
        <MessageCircle className="h-5 w-5" />
      </Button>
    </div>
  );
}