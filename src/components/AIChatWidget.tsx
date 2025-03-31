
import React, { useState } from 'react';
import { useAIChat } from '@/context/AIChatContext';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import AIChatButton from './AIChatButton';
import AIChatHeader from './AIChatHeader';
import AIChatMessages from './AIChatMessages';
import AIChatInputForm from './AIChatInputForm';
import AIChatAnimations from './AIChatAnimations';

const AIChatWidget: React.FC = () => {
  const { isOpen, messages, toggleChat, sendMessage, clearMessages, apiKey, setApiKey, hasApiKey } = useAIChat();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    setIsLoading(true);
    try {
      await sendMessage(input);
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to send message",
        description: "There was an error processing your request.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    clearMessages();
    toast({
      title: "Chat cleared",
      description: "All previous messages have been cleared.",
    });
  };

  const handleSaveApiKey = () => {
    if (newApiKey.trim()) {
      setApiKey(newApiKey.trim());
      setNewApiKey('');
      setSettingsOpen(false);
      toast({
        title: "API Key Saved",
        description: "Your API key has been saved successfully.",
      });
    }
  };

  return (
    <>
      <AIChatButton isOpen={isOpen} toggleChat={toggleChat} />

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className={`${isMobile ? 'w-[95%] h-[90vh]' : 'w-[90%] max-w-[500px] h-[80vh] max-h-[600px]'} rounded-xl overflow-hidden border-2 border-purple-500/30 shadow-[0_0_15px_rgba(139,92,246,0.3)] bg-gradient-to-b from-gray-900/90 to-gray-950/90`}>
            <AIChatHeader
              hasApiKey={hasApiKey}
              toggleChat={toggleChat}
              handleClearChat={handleClearChat}
              settingsOpen={settingsOpen}
              setSettingsOpen={setSettingsOpen}
              newApiKey={newApiKey}
              setNewApiKey={setNewApiKey}
              apiKey={apiKey}
              handleSaveApiKey={handleSaveApiKey}
            />

            <AIChatMessages 
              messages={messages}
              hasApiKey={hasApiKey}
              settingsOpen={settingsOpen}
              setSettingsOpen={setSettingsOpen}
            />

            <AIChatInputForm
              input={input}
              setInput={setInput}
              handleSendMessage={handleSendMessage}
              isLoading={isLoading}
              hasApiKey={hasApiKey}
            />
          </Card>
        </div>
      )}

      <AIChatAnimations />
    </>
  );
};

export default AIChatWidget;
