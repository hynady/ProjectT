export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  message: string;
  timestamp: string;
  isLoading?: boolean;
}

export interface ChatRequest {
  sessionId: string;
  message: string;
}

export interface ChatResponse {
  reply: string;
  timestamp: string;
}

export interface ChatHistoryResponse {
  messages: ChatMessage[];
  totalCount: number;
}

export interface ChatSession {
  sessionId: string;
  title?: string;
  lastMessage?: string;
  lastActivity?: string;
  lastMessageTimestamp?: string;
  messageCount: number;
}

export interface ChatSessionsResponse {
  sessions: ChatSession[];
  totalPages: number;
  totalElements: number;
}
