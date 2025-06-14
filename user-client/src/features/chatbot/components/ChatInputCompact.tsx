import { useState, KeyboardEvent } from 'react';
import { Button } from '@/commons/components/button';
import { Textarea } from '@/commons/components/textarea';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputCompactProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export const ChatInputCompact = ({ onSendMessage, disabled, isLoading }: ChatInputCompactProps) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  return (
    <div className="flex gap-2 items-end w-full">
      <div className="flex-1">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Bạn muốn hỏi gì..."
          disabled={disabled || isLoading}
          className="min-h-[40px] max-h-[80px] resize-none text-sm w-full"
          rows={1}
        />
      </div>
      <Button
        onClick={handleSend}
        disabled={!message.trim() || disabled || isLoading}
        size="icon"
        className="h-[40px] w-10 flex-shrink-0"
      >
        {isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Send className="w-3 h-3" />
        )}
      </Button>
    </div>
  );
};
