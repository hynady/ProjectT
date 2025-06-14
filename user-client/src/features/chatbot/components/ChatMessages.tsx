import { ScrollArea } from '@/commons/components/scroll-area';
import { ChatMessage as ChatMessageType } from '../types';
import { ChatMessage } from './ChatMessage';
import { useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';

interface ChatMessagesProps {
  messages: ChatMessageType[];
}

export const ChatMessages = ({ messages }: ChatMessagesProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <Bot className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Start a conversation</h3>
            <p className="text-muted-foreground text-sm mt-2">
              Ask me anything! I'm here to help you with questions, problems, or just have a chat.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="text-muted-foreground">Try asking:</div>
            <div className="space-y-1 text-left">
              <div className="bg-muted/50 rounded p-2">"What can you help me with?"</div>
              <div className="bg-muted/50 rounded p-2">"Explain quantum computing"</div>
              <div className="bg-muted/50 rounded p-2">"Write a creative story"</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1" ref={scrollAreaRef}>
      <div className="space-y-1 p-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};
