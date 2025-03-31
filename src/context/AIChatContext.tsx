
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useApp } from './AppContext';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

interface AIChatContextType {
  isOpen: boolean;
  messages: ChatMessage[];
  toggleChat: () => void;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  apiKey: string | null;
  setApiKey: (key: string) => void;
  hasApiKey: boolean;
}

const AIChatContext = createContext<AIChatContextType | undefined>(undefined);

export const useAIChat = () => {
  const context = useContext(AIChatContext);
  if (!context) {
    throw new Error('useAIChat must be used within an AIChatProvider');
  }
  return context;
};

const API_KEY_STORAGE_KEY = 'ai_chat_api_key';

const AIChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const { purchaseOrders, logs, suppliers, logAIInteraction } = useApp();

  // Initialize with stored API key if available
  useEffect(() => {
    const storedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (storedApiKey) {
      setApiKeyState(storedApiKey);
    }
  }, []);

  // Initialize with a welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. How can I help you with your purchase orders today?',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  const clearMessages = () => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. How can I help you with your purchase orders today?',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const setApiKey = (key: string) => {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
    setApiKeyState(key);
  };

  // This function would connect to a real AI service in production
  const sendMessage = async (message: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    let response = '';
    
    if (apiKey) {
      try {
        // Simulate API call to external AI service
        console.log(`Using API key: ${apiKey.substring(0, 4)}...`);
        
        // In a real implementation, we would make an actual API call here
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For now, we'll continue with the mock responses but pretend we're using the API
        const lowercaseMessage = message.toLowerCase();
        
        // Context-aware responses based on the query
        if (lowercaseMessage.includes('how many orders') || lowercaseMessage.includes('total orders')) {
          response = `There are currently ${purchaseOrders.length} orders in the system.`;
        } 
        else if (lowercaseMessage.includes('pending orders')) {
          const pendingCount = purchaseOrders.filter(po => po.status === 'pending').length;
          response = `There are ${pendingCount} pending orders awaiting payment.`;
        }
        else if (lowercaseMessage.includes('active orders')) {
          const activeCount = purchaseOrders.filter(po => po.status === 'active').length;
          response = `There are ${activeCount} active orders that have been paid and are awaiting delivery.`;
        }
        else if (lowercaseMessage.includes('fulfilled orders')) {
          const fulfilledCount = purchaseOrders.filter(po => po.status === 'fulfilled').length;
          response = `There are ${fulfilledCount} fulfilled orders that have been delivered.`;
        }
        else if (lowercaseMessage.includes('suppliers') || lowercaseMessage.includes('vendors')) {
          response = `There are ${suppliers.length} suppliers in the system. Some of them include ${suppliers.slice(0, 3).map(s => s.name).join(', ')}.`;
        }
        else if (lowercaseMessage.includes('recent activity') || lowercaseMessage.includes('latest logs')) {
          const recentLogs = logs.slice(0, 3);
          response = `Recent activity: ${recentLogs.map(log => log.action).join('; ')}`;
        }
        else if (lowercaseMessage.includes('total value') || lowercaseMessage.includes('order value')) {
          const totalValue = purchaseOrders.reduce((sum, po) => sum + po.grandTotal, 0);
          response = `The total value of all purchase orders is ₦${totalValue.toLocaleString()}.`;
        }
        else if (lowercaseMessage.includes('help') || lowercaseMessage.includes('what can you do')) {
          response = "I can help you with information about your purchase orders, suppliers, and system activity. You can ask questions like 'How many pending orders do we have?', 'What is the total value of all orders?', or 'Show me recent activity'.";
        }
        else {
          response = "I'm here to help with your purchase order system! You can ask about orders, suppliers, or system activity. If you need specific information, please provide more details in your question.";
        }
      } catch (error) {
        console.error('Error calling AI API:', error);
        response = "I'm sorry, there was an error processing your request. Please try again later.";
      }
    } else {
      response = "Please set your API key in the settings to use AI chat features.";
    }

    // Add AI response
    const aiMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, aiMessage]);
    
    // Log the AI interaction to the activity log
    logAIInteraction(message, response);
  };

  return (
    <AIChatContext.Provider value={{ 
      isOpen, 
      messages, 
      toggleChat, 
      sendMessage, 
      clearMessages,
      apiKey,
      setApiKey,
      hasApiKey: !!apiKey
    }}>
      {children}
    </AIChatContext.Provider>
  );
};

export default AIChatProvider;
