import { useState, useCallback, useEffect } from 'react';
import { ChatMessage, ChatSession } from '../types';
import { chatService } from '../services/chatService';

export const useChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const createNewSession = useCallback(() => {
    const newSessionId = chatService.generateSessionId();
    setCurrentSessionId(newSessionId);
    setMessages([]);
    
    const newSession: ChatSession = {
      sessionId: newSessionId,
      title: 'New Chat',
      lastActivity: new Date().toISOString(),
      messageCount: 0
    };
    
    setSessions(prev => [newSession, ...prev]);
  }, []);
  const loadSessions = useCallback(async () => {
    try {
      setIsLoadingSessions(true);
      const sessions = await chatService.getSessions(0, 10);
      setSessions(sessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  const loadChatHistory = useCallback(async (sessionId: string) => {
    try {
      setIsLoading(true);
      const history = await chatService.getChatHistory(sessionId);
      setMessages(history.reverse()); // Reverse to show oldest first
      setCurrentSessionId(sessionId);
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || !currentSessionId) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      message: messageText,
      timestamp: new Date().toISOString()
    };

    const loadingMessage: ChatMessage = {
      id: `loading_${Date.now()}`,
      role: 'model',
      message: 'Thinking...',
      timestamp: new Date().toISOString(),
      isLoading: true
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage({
        sessionId: currentSessionId,
        message: messageText
      });

      const botMessage: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'model',
        message: response.reply,
        timestamp: response.timestamp
      };

      setMessages(prev => {
        const withoutLoading = prev.filter(msg => !msg.isLoading);
        return [...withoutLoading, botMessage];
      });      // Update session info
      setSessions(prev => prev.map(session => 
        session.sessionId === currentSessionId
          ? {
              ...session,
              lastMessage: messageText,
              lastActivity: new Date().toISOString(),
              lastMessageTimestamp: new Date().toISOString(),
              messageCount: session.messageCount + 2,
              title: session.title === 'New Chat' ? messageText.substring(0, 30) + '...' : session.title
            }
          : session
      ));

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'model',
        message: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId]);

  const switchSession = useCallback((sessionId: string) => {
    loadChatHistory(sessionId);
  }, [loadChatHistory]);

  const clearCurrentChat = useCallback(() => {
    setMessages([]);
  }, []);

  // Initialize with loading sessions and creating new session if needed
  useEffect(() => {
    loadSessions();
    if (!currentSessionId) {
      createNewSession();
    }
  }, [loadSessions, currentSessionId, createNewSession]);

  return {
    messages,
    isLoading,
    currentSessionId,
    sessions,
    isLoadingSessions,
    sendMessage,
    createNewSession,
    switchSession,
    clearCurrentChat,
    loadChatHistory,
    loadSessions
  };
};
