
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AIChatSettings from './AIChatSettings';

interface AIChatHeaderProps {
  hasApiKey: boolean;
  toggleChat: () => void;
  handleClearChat: () => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  newApiKey: string;
  setNewApiKey: (key: string) => void;
  apiKey: string | null;
  handleSaveApiKey: () => void;
}

const AIChatHeader: React.FC<AIChatHeaderProps> = ({
  hasApiKey,
  toggleChat,
  handleClearChat,
  settingsOpen,
  setSettingsOpen,
  newApiKey,
  setNewApiKey,
  apiKey,
  handleSaveApiKey
}) => {
  return (
    <div className="p-4 border-b border-purple-500/30 bg-gradient-to-r from-gray-800/90 to-indigo-900/40 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 bg-gradient-to-br from-purple-500 to-blue-600 p-[2px]">
          <AvatarImage src="/placeholder.svg" alt="AI" className="rounded-full bg-black p-1" />
          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white">AI</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium text-sm text-white">Filling Station AI Assistant</h3>
          <p className="text-xs text-purple-300/80">
            {hasApiKey ? "Connected" : "API Key Required"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <AIChatSettings 
          open={settingsOpen}
          setOpen={setSettingsOpen}
          newApiKey={newApiKey}
          setNewApiKey={setNewApiKey}
          apiKey={apiKey}
          handleSaveApiKey={handleSaveApiKey}
        />
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleClearChat}
          className="h-8 w-8 text-purple-300 hover:text-white hover:bg-purple-800/30" 
          aria-label="Clear chat"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleChat}
          className="h-8 w-8 text-purple-300 hover:text-white hover:bg-purple-800/30" 
          aria-label="Close chat"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AIChatHeader;
