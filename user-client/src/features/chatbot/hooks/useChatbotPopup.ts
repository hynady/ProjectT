import { useState, useCallback, useEffect } from 'react';
import { ChatMessage, ChatSession } from '../types';
import { chatService } from '../services/chatService';

export const useChatbotPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  const openPopup = useCallback(() => setIsOpen(true), []);
  const closePopup = useCallback(() => setIsOpen(false), []);
  const togglePopup = useCallback(() => setIsOpen(prev => !prev), []);

  const loadSessions = useCallback(async () => {
    try {
      setIsLoadingSessions(true);
      const sessions = await chatService.getSessions(0, 10);
      setSessions(sessions);
      
      // Auto-select the latest session if available
      if (sessions.length > 0 && !currentSessionId) {
        const latestSession = sessions.reduce((latest, session) => {
          const latestTime = latest.lastMessageTimestamp || latest.lastActivity || '0';
          const sessionTime = session.lastMessageTimestamp || session.lastActivity || '0';
          return sessionTime > latestTime ? session : latest;
        });        setCurrentSessionId(latestSession.sessionId);
        // Load history for the latest session inline to avoid dependency issues
        try {
          const history = await chatService.getChatHistory(latestSession.sessionId);
          setMessages(history.reverse());
        } catch (historyError) {
          console.error('Error loading latest session history:', historyError);
        }
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }  }, [currentSessionId]);

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
      });

      // Update session info
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

  // Load sessions when popup opens
  useEffect(() => {
    if (isOpen && sessions.length === 0) {
      loadSessions();
    }
  }, [isOpen, sessions.length, loadSessions]);

  // Create new session if none exists when popup opens
  useEffect(() => {
    if (isOpen && !currentSessionId && sessions.length === 0 && !isLoadingSessions) {
      createNewSession();
    }
  }, [isOpen, currentSessionId, sessions.length, isLoadingSessions, createNewSession]);

  return {
    isOpen,
    openPopup,
    closePopup,
    togglePopup,
    messages,
    isLoading,
    currentSessionId,
    sessions,
    isLoadingSessions,
    sendMessage,
    createNewSession,
    loadSessions
  };
};
