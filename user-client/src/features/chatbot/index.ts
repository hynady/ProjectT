// Components
export { ChatbotDemo } from './components/ChatbotDemo';
export { ChatMessage } from './components/ChatMessage';
export { ChatMessageCompact } from './components/ChatMessageCompact';
export { ChatInput } from './components/ChatInput';
export { ChatInputCompact } from './components/ChatInputCompact';
export { ChatMessages } from './components/ChatMessages';
export { ChatSidebar } from './components/ChatSidebar';
export { ChatbotPopup } from './components/ChatbotPopup';
export { GlobalChatbot } from './components/GlobalChatbot';
export { BackgroundContextManagement } from './components/BackgroundContextManagement';

// Hooks
export { useChatbot } from './hooks/useChatbot';
export { useChatbotPopup } from './hooks/useChatbotPopup';
export { useBackgroundContext } from './hooks/useBackgroundContext';

// Services
export { chatService } from './services/chatService';
export { backgroundContextService } from './services/backgroundContextService';

// Types
export type {
  ChatMessage as ChatMessageType,
  ChatRequest,
  ChatResponse,
  ChatSession,
  ChatSessionsResponse
} from './types';
