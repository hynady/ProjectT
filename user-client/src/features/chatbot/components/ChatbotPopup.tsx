import { useState, useRef, useEffect } from "react";
import { Button } from "@/commons/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/commons/components/card";
import { ScrollArea } from "@/commons/components/scroll-area";
import { useAuth } from "@/features/auth/contexts";
import { useUser } from "@/features/auth/contexts/UserContext";
import { useChatbotPopup } from "../hooks/useChatbotPopup";
import { ChatMessageCompact } from "./ChatMessageCompact";
import { ChatInputCompact } from "./ChatInputCompact";
import { X, Plus, LogIn } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Avatar } from "@/commons/components/avatar";
export const ChatbotPopup = () => {
  const { isAuthenticated } = useAuth();
  const { displayName } = useUser();
  const location = useLocation();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const {
    isOpen,
    togglePopup,
    closePopup,
    messages,
    isLoading,
    sendMessage,
    createNewSession,
  } = useChatbotPopup();  // Define paths where chatbot should not be shown
  const hiddenPaths = [
    '/login',
    '/register', 
    '/rs-pw'
  ];

  // Define known valid paths (this helps detect 404)
  const validPathPatterns = [
    '/',
    '/search',
    '/occas',
    '/my-ticket',
    '/chatbot',
    '/settings',
    '/organize',
    '/admin',
    '/ticket-check-in',
    '/preview'
  ];

  // Check if current path is a 404 (doesn't match any valid pattern)
  const is404Page = !validPathPatterns.some(pattern => 
    location.pathname === pattern || 
    location.pathname.startsWith(pattern + '/') ||
    (pattern === '/' && location.pathname === '/')
  );

  // Check if current path should hide chatbot
  const shouldHideChatbot = hiddenPaths.includes(location.pathname) || 
                           location.pathname.startsWith('/login') ||
                           location.pathname.startsWith('/register') ||
                           location.pathname.startsWith('/rs-pw') ||
                           is404Page;
  // Handle scrolling to bottom
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        // Find the ScrollArea viewport element
        const scrollViewport = messagesContainerRef.current?.querySelector(
          "[data-radix-scroll-area-viewport]"
        ) as HTMLElement;
        if (scrollViewport) {
          if (isInitialLoad) {
            // For initial load, scroll immediately to bottom
            scrollViewport.scrollTop = scrollViewport.scrollHeight;
            setIsInitialLoad(false);
          } else {
            // For subsequent messages, smooth scroll to bottom
            scrollViewport.scrollTo({
              top: scrollViewport.scrollHeight,
              behavior: "smooth",
            });
          }
        }
      });
    }
  }, [messages, isOpen, isInitialLoad]);

  // Reset initial load state when popup closes
  useEffect(() => {
    if (!isOpen) {
      setIsInitialLoad(true);
    }
  }, [isOpen]);

  const handleTogglePopup = () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    togglePopup();
  };

  const handleSendMessage = (message: string) => {
    if (!isAuthenticated) return;
    sendMessage(message);
  };
  const handleCreateNewSession = () => {
    if (!isAuthenticated) return;
    createNewSession();
  };
  // Don't render chatbot on auth pages or 404 pages
  if (shouldHideChatbot) {
    return null;
  }

  return (
    <>
      {" "}
      {/* Floating Action Button */}
      <div className="fixed bottom-4 right-4 z-40">
        {" "}
        <Button
          onClick={handleTogglePopup}
          className="group h-14 rounded-full shadow-2xl hover:shadow-xl transition-all duration-300 bg-primary/45 hover:bg-primary/90 active:scale-95 border-2 border-accent overflow-hidden w-14 hover:w-auto hover:px-4 p-0"
        >
          {isOpen ? (
            <>
              {/* X Icon always visible */}
              <div className="flex items-center justify-center w-14 h-14 absolute left-0 top-0">
                <X className="w-6 h-6" />
              </div>
              {/* Text appears on hover */}
              <div className="flex items-center pl-14 pr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                <span className="text-sm font-medium text-white">
                  Đóng chat
                </span>
              </div>
            </>
          ) : (
            <>
              {/* Avatar always visible */}
              <div className="flex items-center justify-center w-14 h-14 absolute left-0 top-0">
                <Avatar className="w-10 h-10">
                  <img src="/ticky-avatar.png" alt="Ticky Avatar" />
                </Avatar>
              </div>
              {/* Text appears on hover */}
              <div className="flex items-center pl-14 pr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                <span className="text-sm font-medium text-white">
                  Trợ lý ảo Ticky
                </span>
              </div>
            </>
          )}
        </Button>
      </div>
      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 ">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 bg-card/10 rounded-full flex items-center justify-center mb-4">
                <img src="/ticky-avatar.png" className="w-20 h-20 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Trợ lý Ticky</h3>
              <p className="text-muted-foreground text-sm">
                Tính năng trợ lý ảo Ticky chỉ khả dụng khi bạn đã đăng nhập. Đăng nhập
                ngay nhé.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/login" className="w-full">
                <Button
                  className="w-full"
                  onClick={() => setShowLoginPrompt(false)}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Đăng nhập
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowLoginPrompt(false)}
              >
                Hủy
              </Button>
            </CardContent>
          </Card>
        </div>
      )}{" "}
      {/* Chatbot Popup */}
      {isOpen && isAuthenticated && (
        <div className="fixed bottom-20 right-4 z-50 w-80 h-96 sm:w-96 sm:h-[500px] max-sm:bottom-4 max-sm:right-2 max-sm:left-2 max-sm:w-auto animate-flip-up animate-duration-300">
          <Card className="h-full flex flex-col shadow-2xl border-2 overflow-hidden">
            {/* Header */}
            <CardHeader className="pb-2 border-b bg-muted/20 px-3 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center">
                    <Avatar className="w-10 h-10 text-primary-foreground">
                      <img src="/ticky-avatar.png" alt="Ticky Avatar" />
                    </Avatar>
                  </div>{" "}
                  <div>
                    <h3 className="text-base font-bold">Trợ lý Ticky</h3>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      Xin chào {displayName ? displayName : "bạn"}!
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    onClick={handleCreateNewSession}
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    title="New Session"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={closePopup}
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    title="Close"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>{" "}
            {/* Messages */}
            <div className="flex-1 flex flex-col min-h-0">
              <ScrollArea className="flex-1 p-0" ref={messagesContainerRef}>
                <div className="p-2 sm:p-3 space-y-2">
                  {messages.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                      <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mb-3">
                        <img src="/ticky-avatar.png" className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground" />
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                        Bạn muốn hỏi gì?
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Hỏi đi đừng ngại, tôi sẽ cố gắng trả lời!
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div key={message.id} className="mb-2">
                        <ChatMessageCompact message={message} />
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
            {/* Input Footer */}
            <CardFooter className="border-t bg-background p-2 sm:p-3 rounded-b-lg overflow-hidden">
              <ChatInputCompact
                onSendMessage={handleSendMessage}
                disabled={!isAuthenticated}
                isLoading={isLoading}
              />
            </CardFooter>
          </Card>
        </div>
      )}
      {/* Mobile Overlay */}
      {isOpen && isAuthenticated && (
        <div
          className="fixed inset-0 bg-black/20 z-40 sm:hidden"
          onClick={closePopup}
        />
      )}
    </>
  );
};
