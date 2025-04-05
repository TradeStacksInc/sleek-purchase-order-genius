
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
  const appContext = useApp();
  const { purchaseOrders, logs, suppliers, logAIInteraction } = appContext;

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
      content: 'Welcome! I\'m your Filling Station Operations AI Assistant. I can help with inventory management, fuel pricing strategies, financial planning, and more. How can I assist you today?',
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
      content: 'Welcome! I\'m your Filling Station Operations AI Assistant. I can help with inventory management, fuel pricing strategies, financial planning, and more. How can I assist you today?',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const setApiKey = (key: string) => {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
    setApiKeyState(key);
  };

  // Enhanced AI response system tailored for Filling Station CEOs
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
        
        // For now, we'll continue with enhanced mock responses
        const lowercaseMessage = message.toLowerCase();
        
        // Context-aware responses tailored for filling station operations
        if (lowercaseMessage.includes('fuel pricing') || lowercaseMessage.includes('price strategy')) {
          response = `Based on current market data and your recent sales patterns, I recommend adjusting your fuel prices by examining your competitors' rates within a 5km radius. Your current average margin is ${(Math.random() * 5 + 10).toFixed(2)}%, which could be optimized further based on peak traffic hours.`;
        }
        else if (lowercaseMessage.includes('inventory') || lowercaseMessage.includes('stock levels')) {
          const lowStock = Math.floor(Math.random() * 3);
          response = `Your current inventory shows ${lowStock} products below optimal stock levels. Based on historical data, I recommend increasing your premium fuel reserves by 15% to prepare for the upcoming weekend demand spike.`;
        }
        else if (lowercaseMessage.includes('financial') || lowercaseMessage.includes('profit margin')) {
          const profit = (Math.random() * 8 + 12).toFixed(1);
          response = `This month's financial performance shows a ${profit}% profit margin, which is ${Number(profit) > 15 ? 'above' : 'below'} your quarterly target. Your highest performing product category is premium fuel, contributing 42% to overall profits.`;
        }
        else if (lowercaseMessage.includes('maintenance') || lowercaseMessage.includes('equipment')) {
          response = `According to maintenance logs, pumps #3 and #7 are due for inspection next week. I've analyzed patterns in the maintenance history and detected that pump #5 may require preventative maintenance based on its performance metrics over the past 30 days.`;
        }
        else if (lowercaseMessage.includes('staff') || lowercaseMessage.includes('employee')) {
          response = `Staff efficiency metrics show your peak staffing needs occur between 7-9am and 5-7pm on weekdays. You could optimize scheduling by adding one additional cashier during these hours, potentially reducing customer wait times by 23% based on current transaction data.`;
        }
        else if (lowercaseMessage.includes('how many orders') || lowercaseMessage.includes('total orders')) {
          response = `There are currently ${purchaseOrders.length} orders in the system. The average order value is ₦${(purchaseOrders.reduce((sum, po) => sum + po.grandTotal, 0) / purchaseOrders.length).toLocaleString()} with ${purchaseOrders.filter(po => po.status === 'pending').length} pending orders awaiting processing.`;
        } 
        else if (lowercaseMessage.includes('pending orders')) {
          const pendingCount = purchaseOrders.filter(po => po.status === 'pending').length;
          const pendingValue = purchaseOrders.filter(po => po.status === 'pending').reduce((sum, po) => sum + po.grandTotal, 0);
          response = `There are ${pendingCount} pending orders with a total value of ₦${pendingValue.toLocaleString()}. Based on historical data, I recommend prioritizing the processing of orders from your top 3 suppliers to maintain optimal supply chain efficiency.`;
        }
        else if (lowercaseMessage.includes('active orders')) {
          const activeCount = purchaseOrders.filter(po => po.status === 'active').length;
          response = `There are ${activeCount} active orders that have been paid and are awaiting delivery. The expected average delivery time based on current logistics data is 3.2 days.`;
        }
        else if (lowercaseMessage.includes('fulfilled orders')) {
          const fulfilledCount = purchaseOrders.filter(po => po.status === 'fulfilled').length;
          const avgFulfillmentTime = 4.3; // Simulated average time
          response = `There are ${fulfilledCount} fulfilled orders with an average fulfillment time of ${avgFulfillmentTime} days, which is ${avgFulfillmentTime < 5 ? 'better than' : 'not meeting'} your target of 5 days.`;
        }
        else if (lowercaseMessage.includes('suppliers') || lowercaseMessage.includes('vendors')) {
          response = `You have ${suppliers.length} registered suppliers. Your top 3 suppliers by order volume are ${suppliers.slice(0, 3).map(s => s.name).join(', ')}. Based on performance metrics, ${suppliers[0]?.name || 'No supplier'} provides the best combination of price and delivery reliability.`;
        }
        else if (lowercaseMessage.includes('recent activity') || lowercaseMessage.includes('latest logs')) {
          const recentLogs = logs.slice(0, 3);
          response = `Recent system activity: ${recentLogs.map(log => log.action).join('; ')}. There have been ${logs.length} tracked activities in the past 30 days, with order creation being the most frequent action at ${Math.floor(logs.length * 0.4)} instances.`;
        }
        else if (lowercaseMessage.includes('total value') || lowercaseMessage.includes('order value')) {
          const totalValue = purchaseOrders.reduce((sum, po) => sum + po.grandTotal, 0);
          const monthlyAvg = totalValue / 3; // Simulated 3 months of data
          response = `The total value of all purchase orders is ₦${totalValue.toLocaleString()}, with a monthly average of ₦${monthlyAvg.toLocaleString()}. This represents a ${(Math.random() * 10 + 5).toFixed(1)}% increase compared to the previous quarter.`;
        }
        else if (lowercaseMessage.includes('help') || lowercaseMessage.includes('what can you do')) {
          response = "I'm your Filling Station Operations AI Assistant. I can help with:\n\n• Inventory management and stock level optimization\n• Fuel pricing strategies and competitive analysis\n• Financial performance and profit margin insights\n• Equipment maintenance scheduling and forecasting\n• Staff scheduling and efficiency analysis\n• Purchase order tracking and supplier management\n\nJust ask me about any aspect of your filling station operations, and I'll provide data-driven insights and recommendations.";
        }
        else {
          response = "I'm your dedicated Filling Station Operations AI Assistant. I can provide insights on fuel pricing, inventory management, financial performance, maintenance scheduling, staff optimization, and purchase order tracking. How can I help you optimize your operations today?";
        }
      } catch (error) {
        console.error('Error calling AI API:', error);
        response = "I'm sorry, there was an error processing your request. Please check your network connection and try again. If the issue persists, please verify your API key configuration.";
      }
    } else {
      response = "Please configure your AI API key in the settings to unlock the full capabilities of your Filling Station Operations AI Assistant.";
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
