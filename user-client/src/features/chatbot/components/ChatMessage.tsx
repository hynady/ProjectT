import { memo } from 'react';
import { ChatMessage as ChatMessageType } from '../types';
import { Avatar, AvatarFallback } from '@/commons/components/avatar';
import { Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/commons/lib/utils/utils';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage = memo(({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  const isLoading = message.isLoading;

  return (
    <div className={cn(
      "flex gap-3 p-4 rounded-lg transition-colors",
      isUser 
        ? "bg-primary/5 flex-row-reverse" 
        : "bg-muted/50"
    )}>
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback className={cn(
          "text-sm",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}>
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn(
        "flex-1 space-y-2",
        isUser ? "text-right" : "text-left"
      )}>
        <div className="text-sm text-muted-foreground">
          {isUser ? "You" : "AI Assistant"}
        </div>
        
        <div className={cn(
          "prose prose-sm max-w-none",
          isUser 
            ? "prose-slate text-right" 
            : "prose-slate",
          isLoading && "animate-pulse"
        )}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-muted-foreground">Thinking...</span>
            </div>
          ) : isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.message}</p>
          ) : (
            <ReactMarkdown>{message.message}</ReactMarkdown>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';
