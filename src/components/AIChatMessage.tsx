
import React from 'react';
import { format } from 'date-fns';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatMessageProps {
  message: ChatMessage;
}

const AIChatMessage: React.FC<AIChatMessageProps> = ({ message }) => {
  return (
    <div
      className={`flex ${
        message.role === 'user' ? 'justify-end' : 'justify-start'
      } animate-fadeIn`}
    >
      <div
        className={`max-w-[85%] rounded-xl p-3 shadow-md ${
          message.role === 'user'
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
            : 'bg-gradient-to-r from-gray-800 to-gray-900 text-gray-100 border border-purple-500/20'
        }`}
      >
        <p className="text-sm break-words">{message.content}</p>
        <p className="text-xs opacity-70 mt-1 text-right">
          {format(message.timestamp, 'p')}
        </p>
      </div>
    </div>
  );
};

export default AIChatMessage;
