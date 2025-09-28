import { cn } from '@/lib/utils';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import type { MessageReaction } from '@/services/websocket/types';


interface MessageReactionsProps {
  messageId: number;
  reactions?: MessageReaction[];
  className?: string;
}

export function MessageReactions({ messageId, reactions = [], className }: MessageReactionsProps) {
  const { sendReactionWebSocket } = useChatStore();
  const { user } = useAuthStore();
  const currentUserId = user?.id;



  // Ne rien afficher si aucune réaction
  if (!reactions || reactions.length === 0) {
    return null;
  }

  // Group reactions by emoji
  const reactionSummary = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = {
        count: 0,
        users: [],
        hasCurrentUser: false
      };
    }
    acc[reaction.emoji].count++;
    acc[reaction.emoji].users.push(reaction.user_id);
    if (currentUserId && reaction.user_id === currentUserId) {
      acc[reaction.emoji].hasCurrentUser = true;
    }
    return acc;
  }, {} as Record<string, { count: number; users: number[]; hasCurrentUser: boolean }>);

  const handleReactionClick = (emoji: string) => {
    const hasReacted = reactionSummary[emoji]?.hasCurrentUser;
    sendReactionWebSocket(messageId, emoji, hasReacted ? 'remove' : 'add');
  };

  return (
    <div className={cn("flex items-center gap-1 mt-1", className)}>
      {/* Existing reactions only */}
      {Object.entries(reactionSummary).map(([emoji, data]) => (
        <button
          key={emoji}
          onClick={() => handleReactionClick(emoji)}
          title={`${data.count} personne${data.count > 1 ? 's' : ''} ${data.hasCurrentUser ? '(vous inclus)' : ''}`}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs",
            "transition-all duration-200 hover:scale-105 hover:shadow-sm",
            "border backdrop-blur-sm font-medium",
            data.hasCurrentUser
              ? "bg-primary/15 border-primary/30 text-primary hover:bg-primary/20"
              : "bg-background/70 hover:bg-background/90 border-border/30 text-foreground"
          )}
        >
          <span className="text-sm">{emoji}</span>
          <span>{data.count}</span>
        </button>
      ))}
    </div>
  );
}