
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings } from 'lucide-react';
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AIChatSettingsProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  newApiKey: string;
  setNewApiKey: (key: string) => void;
  apiKey: string | null;
  handleSaveApiKey: () => void;
}

const AIChatSettings: React.FC<AIChatSettingsProps> = ({ 
  open, 
  setOpen, 
  newApiKey, 
  setNewApiKey, 
  apiKey, 
  handleSaveApiKey 
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
  );
};

export default AIChatSettings;
