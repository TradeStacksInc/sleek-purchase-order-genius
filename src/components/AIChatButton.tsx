
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';

interface AIChatButtonProps {
  isOpen: boolean;
  toggleChat: () => void;
}

const AIChatButton: React.FC<AIChatButtonProps> = ({ isOpen, toggleChat }) => {
  return (
    <Button
      onClick={toggleChat}
      className="fixed right-4 bottom-4 rounded-full w-12 h-12 p-0 shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-300/20 hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 relative"
      aria-label="Open AI Chat"
    >
      {!isOpen && (
        <>
          <div className="absolute inset-0 rounded-full bg-purple-500/10 animate-ping-slow"></div>
          <div className="absolute inset-[-4px] rounded-full bg-purple-500/10 animate-ping-slower"></div>
          <div className="absolute inset-[-8px] rounded-full bg-purple-500/5 animate-ping-slowest"></div>
        </>
      )}
      {isOpen ? (
        <X className="h-5 w-5 text-white" />
      ) : (
        <MessageCircle className="h-5 w-5 text-white" />
      )}
    </Button>
  );
};

export default AIChatButton;
