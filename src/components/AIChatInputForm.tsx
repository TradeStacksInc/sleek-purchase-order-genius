
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface AIChatInputFormProps {
  input: string;
  setInput: (input: string) => void;
  handleSendMessage: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  hasApiKey: boolean;
}

const AIChatInputForm: React.FC<AIChatInputFormProps> = ({
  input,
  setInput,
  handleSendMessage,
  isLoading,
  hasApiKey
}) => {
  return (
    <form onSubmit={handleSendMessage} className="p-4 border-t border-purple-500/30 bg-gray-900/70">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={hasApiKey ? "Type your message..." : "Set API key to start chat"}
          disabled={isLoading || !hasApiKey}
          className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:ring-purple-500 focus:border-purple-500"
        />
        <Button 
          type="submit" 
          size="icon"
          disabled={isLoading || !input.trim() || !hasApiKey}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

export default AIChatInputForm;
