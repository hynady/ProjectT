import { Button } from '@/commons/components/button';
import { ScrollArea } from '@/commons/components/scroll-area';
import { Separator } from '@/commons/components/separator';
import { Badge } from '@/commons/components/badge';
import { ChatSession } from '../types';
import { MessageCircle, Plus, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/commons/lib/utils/utils';

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession?: (sessionId: string) => void;
  isLoadingSessions?: boolean;
  className?: string;
}

export const ChatSidebar = ({
  sessions,
  currentSessionId,
  onSessionSelect,
  onNewSession,
  onDeleteSession,
  isLoadingSessions = false,
  className
}: ChatSidebarProps) => {
  return (
    <div className={cn("border-r bg-muted/10 flex flex-col", className)}>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Chat Sessions</h2>
          <Button
            onClick={onNewSession}
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <Button
          onClick={onNewSession}
          variant="default"
          className="w-full justify-start"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      <Separator />      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoadingSessions ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
              Loading sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No chat sessions yet
            </div>
          ) : (            sessions.map((session) => (
              <div
                key={session.sessionId}
                className={cn(
                  "group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50",
                  session.sessionId === currentSessionId && "bg-muted"
                )}
                onClick={() => onSessionSelect(session.sessionId)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-medium truncate">
                      {session.title || `Session ${session.sessionId.slice(-8)}`}
                    </span>
                  </div>
                  
                  {session.lastMessage && (
                    <p className="text-xs text-muted-foreground truncate">
                      {session.lastMessage.length > 50 
                        ? session.lastMessage.substring(0, 50) + '...' 
                        : session.lastMessage}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {session.messageCount} messages
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {session.lastActivity 
                        ? new Date(session.lastActivity).toLocaleDateString()
                        : session.lastMessageTimestamp 
                          ? new Date(session.lastMessageTimestamp).toLocaleDateString()
                          : 'Recent'
                      }
                    </span>
                  </div>
                </div>
                
                {onDeleteSession && session.sessionId !== currentSessionId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.sessionId);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
