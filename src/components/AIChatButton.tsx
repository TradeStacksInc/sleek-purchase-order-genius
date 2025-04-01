
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface AIChatButtonProps {
  isOpen: boolean;
  toggleChat: () => void;
}

const AIChatButton: React.FC<AIChatButtonProps> = ({ isOpen, toggleChat }) => {
  const isMobile = useIsMobile();
  
  return (
    <Button
      onClick={toggleChat}
      className={`fixed z-50 ${isMobile ? 'right-4 bottom-4 w-12 h-12' : 'right-8 bottom-8 w-14 h-14'} rounded-full p-0 shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-300/20 hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 relative`}
      aria-label="Open AI Chat"
    >
      {!isOpen && (
        <>
          <div className="absolute inset-0 rounded-full bg-purple-500/10 animate-[ping_2s_ease-in-out_infinite]"></div>
          <div className="absolute inset-[-4px] rounded-full bg-purple-500/10 animate-[ping_2.5s_ease-in-out_infinite]"></div>
          <div className="absolute inset-[-8px] rounded-full bg-purple-500/5 animate-[ping_3s_ease-in-out_infinite]"></div>
        </>
      )}
      {isOpen ? (
        <X className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-white`} />
      ) : (
        <MessageCircle className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-white`} />
      )}
    </Button>
  );
};

export default AIChatButton;
