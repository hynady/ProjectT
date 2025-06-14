import { BaseService } from '@/commons/base.service';
import { ChatRequest, ChatResponse, ChatMessage, ChatSession } from '../types';

class ChatService extends BaseService {
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    return this.request({
      method: 'POST',
      url: '/chat/send',
      data: request,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            reply: `This is a mock response to: "${request.message}". The chatbot is not connected to a real backend yet.`,
            timestamp: new Date().toISOString()
          });
        }, 1000 + Math.random() * 2000); // Random delay 1-3 seconds
      })
    });
  }

  async getChatHistory(sessionId: string, page: number = 0, size: number = 20): Promise<ChatMessage[]> {
    return this.request({
      method: 'GET',
      url: `/chat/history?sessionId=${sessionId}&page=${page}&size=${size}`,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => {
          // Mock chat history
          const mockHistory: ChatMessage[] = [
            {
              id: '1',
              role: 'user',
              message: 'Hello, how are you?',
              timestamp: new Date(Date.now() - 60000).toISOString()
            },
            {
              id: '2',
              role: 'model',
              message: 'Hello! I\'m doing well, thank you for asking. How can I help you today?',
              timestamp: new Date(Date.now() - 50000).toISOString()
            }
          ];
          resolve(mockHistory);
        }, 500);
      }),
      defaultValue: []
    });
  }

  async getMessageCount(sessionId: string): Promise<number> {
    return this.request({
      method: 'GET',
      url: `/chat/count?sessionId=${sessionId}`,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => resolve(2), 300);
      }),
      defaultValue: 0
    });
  }
  async getSessions(page: number = 0, size: number = 10): Promise<ChatSession[]> {
    return this.request({
      method: 'GET',
      url: `/chat/sessions?page=${page}&size=${size}`,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => {
          const mockSessions: ChatSession[] = [
            {
              sessionId: 'session_1',
              title: 'General Questions',
              lastMessage: 'Hello, how are you?',
              lastActivity: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
              messageCount: 8
            },
            {
              sessionId: 'session_2', 
              title: 'Programming Help',
              lastMessage: 'Can you help me with React?',
              lastActivity: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
              messageCount: 15
            },
            {
              sessionId: 'session_3',
              title: 'Creative Writing',
              lastMessage: 'Write a short story about...',
              lastActivity: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
              messageCount: 5
            }
          ];
          
          resolve(mockSessions);
        }, 500);
      }),
      defaultValue: []
    });
  }

  generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const chatService = new ChatService();
