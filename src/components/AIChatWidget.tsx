
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
      {/* Chat trigger button */}
      <Button
        onClick={toggleChat}
        className="fixed right-4 bottom-4 rounded-full w-12 h-12 p-0 shadow-lg"
        aria-label="Open AI Chat"
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-5 w-5" />
        )}
      </Button>

      {/* Chat window */}
      {isOpen && (
        <Card className="fixed right-4 bottom-20 w-[350px] sm:w-[400px] h-[500px] rounded-lg shadow-lg flex flex-col z-40 border overflow-hidden">
          {/* Chat header */}
          <div className="p-3 border-b bg-card flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" alt="AI" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-sm">AI Assistant</h3>
                <p className="text-xs text-muted-foreground">
                  {hasApiKey ? "Connected" : "API Key Required"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    aria-label="Settings"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>API Configuration</DialogTitle>
                    <DialogDescription>
                      Enter your API key to enable the AI chat functionality.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="apiKey" className="text-right">
                        API Key
                      </Label>
                      <Input
                        id="apiKey"
                        type="password"
                        value={newApiKey}
                        onChange={(e) => setNewApiKey(e.target.value)}
                        className="col-span-3"
                        placeholder={apiKey ? "••••••••" : "Enter your API key"}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleSaveApiKey}>Save changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleClearChat}
                className="h-8 w-8" 
                aria-label="Clear chat"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleChat}
                className="h-8 w-8" 
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chat messages */}
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm break-words">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {format(msg.timestamp, 'p')}
                    </p>
                  </div>
                </div>
              ))}
              {!hasApiKey && messages.length === 1 && (
                <div className="flex justify-center my-4">
                  <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Configure API Key
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Chat input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={hasApiKey ? "Type your message..." : "Set API key to start chat"}
                disabled={isLoading || !hasApiKey}
                className="flex-1"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={isLoading || !input.trim() || !hasApiKey}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>
      )}
    </>
  );
};

export default AIChatWidget;
