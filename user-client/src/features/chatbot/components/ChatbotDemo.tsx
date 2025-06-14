import { useState } from 'react';
import { Card } from '@/commons/components/card';
import { Button } from '@/commons/components/button';
import { useChatbot } from '../hooks/useChatbot';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { ChatSidebar } from './ChatSidebar';
import { Bot, Menu, X } from 'lucide-react';
import { cn } from '@/commons/lib/utils/utils';

export const ChatbotDemo = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
    const {
    messages,
    isLoading,
    currentSessionId,
    sessions,
    isLoadingSessions,
    sendMessage,
    createNewSession,
    switchSession,
    clearCurrentChat
  } = useChatbot();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 h-screen">
        <Card className="h-full flex overflow-hidden">
          {/* Sidebar */}
          <div className={cn(
            "transition-all duration-300 ease-in-out",
            sidebarOpen ? "w-80" : "w-0"
          )}>
            <div className={cn(
              "h-full",
              !sidebarOpen && "overflow-hidden"
            )}>              <ChatSidebar
                sessions={sessions}
                currentSessionId={currentSessionId}
                onSessionSelect={switchSession}
                onNewSession={createNewSession}
                isLoadingSessions={isLoadingSessions}
                className="h-full"
              />
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="border-b p-4 flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSidebar}
                  className="h-8 w-8 p-0"
                >
                  {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </Button>
                
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="font-semibold">AI Assistant</h1>
                    <p className="text-xs text-muted-foreground">
                      Powered by Gemini AI
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCurrentChat}
                  disabled={messages.length === 0}
                >
                  Clear Chat
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={createNewSession}
                >
                  New Session
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <ChatMessages messages={messages} />

            {/* Input Area */}
            <ChatInput
              onSendMessage={sendMessage}
              isLoading={isLoading}
              disabled={!currentSessionId}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};
