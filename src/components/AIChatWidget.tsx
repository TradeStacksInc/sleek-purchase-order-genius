
import React, { useState, useRef, useEffect } from 'react';
import { useAIChat } from '@/context/AIChatContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MessageCircle, 
  X, 
  Send,
  Trash2,
  Settings
} from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const AIChatWidget: React.FC = () => {
  const { isOpen, messages, toggleChat, sendMessage, clearMessages, apiKey, setApiKey, hasApiKey } = useAIChat();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
      {/* Chat trigger button - floating in bottom-right */}
      <Button
        onClick={toggleChat}
        className="fixed right-4 bottom-4 rounded-full w-12 h-12 p-0 shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-300/20 hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 animate-pulse"
        aria-label="Open AI Chat"
      >
        <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping"></div>
        {isOpen ? (
          <X className="h-5 w-5 text-white" />
        ) : (
          <MessageCircle className="h-5 w-5 text-white" />
        )}
      </Button>

      {/* Centered chat modal with futuristic design */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-[90%] max-w-[500px] h-[80vh] max-h-[600px] rounded-xl overflow-hidden border-2 border-purple-500/30 shadow-[0_0_15px_rgba(139,92,246,0.3)] bg-gradient-to-b from-gray-900/90 to-gray-950/90">
            {/* Chat header with alien-tech styling */}
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
                <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-purple-300 hover:text-white hover:bg-purple-800/30" 
                      aria-label="Settings"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-gray-900 border-purple-500/30 text-white">
                    <DialogHeader>
                      <DialogTitle className="text-white">AI Configuration</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Enter your API key to enable the AI assistant functionality.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="apiKey" className="text-right text-gray-300">
                          API Key
                        </Label>
                        <Input
                          id="apiKey"
                          type="password"
                          value={newApiKey}
                          onChange={(e) => setNewApiKey(e.target.value)}
                          className="col-span-3 bg-gray-800 border-gray-700 text-white"
                          placeholder={apiKey ? "••••••••" : "Enter your API key"}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={handleSaveApiKey} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500">Save changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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

            {/* Chat messages with futuristic styling */}
            <ScrollArea className="flex-1 p-4 bg-transparent">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    } animate-fadeIn`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl p-3 shadow-md ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                          : 'bg-gradient-to-r from-gray-800 to-gray-900 text-gray-100 border border-purple-500/20'
                      }`}
                    >
                      <p className="text-sm break-words">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1 text-right">
                        {format(msg.timestamp, 'p')}
                      </p>
                    </div>
                  </div>
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

            {/* Chat input with futuristic styling */}
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
          </Card>
        </div>
      )}

      {/* Add animation keyframes to global styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default AIChatWidget;
