import { memo } from "react";
import { ChatMessage as ChatMessageType } from "../types";
import { Avatar, AvatarFallback } from "@/commons/components/avatar";
import { Bot, User } from "lucide-react";
import { useUser } from "@/features/auth/contexts/UserContext";
import ReactMarkdown from "react-markdown";

interface ChatMessageCompactProps {
  message: ChatMessageType;
}

export const ChatMessageCompact = memo(
  ({ message }: ChatMessageCompactProps) => {
    const isUser = message.role === "user";
    const isLoading = message.isLoading;
    const { avatarUrl } = useUser();

    return (
      <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        <Avatar className="w-6 h-6 flex-shrink-0">
          {isUser ? (
            // User avatar from useUser
            <img
              src={avatarUrl}
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            // Ticky avatar for bot
            <img
              src="/ticky-avatar.png"
              alt="Ticky Avatar"
              className="w-full h-full object-cover"
            />
          )}
          <AvatarFallback
            className={`text-xs ${
              isUser ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}
          >
            {isUser ? (
              <User className="w-3 h-3" />
            ) : (
              <Bot className="w-3 h-3" />
            )}
          </AvatarFallback>
        </Avatar>

        <div className={`flex-1 ${isUser ? "text-right" : "text-left"}`}>
          <div
            className={`inline-block max-w-[85%] rounded-lg px-3 py-2 text-sm min-h-5 ${
              isUser ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-1">
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-current rounded-full animate-jump animate-infinite animate-duration-[1000ms] animate-delay-[0ms] animate-ease-in-out"></div>
                  <div className="w-1 h-1 bg-current rounded-full animate-jump animate-infinite animate-duration-[1000ms] animate-delay-[200ms] animate-ease-in-out"></div>
                  <div className="w-1 h-1 bg-current rounded-full animate-jump animate-infinite animate-duration-[1000ms] animate-delay-[400ms] animate-ease-in-out"></div>
                </div>
              </div>
            ) : isUser ? (
              <p className="whitespace-pre-wrap break-words">
                {message.message}
              </p>
            ) : (
              <div className="prose prose-xs max-w-none dark:prose-invert">
                <ReactMarkdown>{message.message}</ReactMarkdown>
              </div>
            )}
          </div>

          <div
            className={`text-xs text-muted-foreground mt-1 ${
              isUser ? "text-right" : "text-left"
            }`}
          >
            {message.timestamp
              ? new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
          </div>
        </div>
      </div>
    );
  }
);

ChatMessageCompact.displayName = "ChatMessageCompact";
