import React from 'react';
import { BackgroundContextManagement } from '@/features/chatbot/components/BackgroundContextManagement';

const ChatbotContextPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chatbot Context</h1>
        <p className="text-muted-foreground">
          Quản lý nội dung hướng dẫn cho chatbot AI
        </p>
      </div>
      
      <BackgroundContextManagement />
    </div>
  );
};

export default ChatbotContextPage;
