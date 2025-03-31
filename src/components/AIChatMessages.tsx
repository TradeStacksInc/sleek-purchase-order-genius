
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import AIChatMessage from './AIChatMessage';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatMessagesProps {
  messages: ChatMessage[];
  hasApiKey: boolean;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
}

const AIChatMessages: React.FC<AIChatMessagesProps> = ({ 
  messages, 
  hasApiKey, 
  settingsOpen, 
  setSettingsOpen 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-1 p-4 bg-transparent">
      <div className="space-y-4">
        {messages.map((msg) => (
          <AIChatMessage key={msg.id} message={msg} />
        ))}
        {!hasApiKey && messages.length === 1 && (
          <div className="flex justify-center my-4">
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="bg-transparent border-purple-500 text-purple-300 hover:bg-purple-900/30">
                  Configure API Key
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default AIChatMessages;
