
import React from 'react';

const AIChatAnimations: React.FC = () => {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.8; }
          70% { transform: scale(1.7); opacity: 0; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        @keyframes ping-slower {
          0% { transform: scale(1); opacity: 0.5; }
          70% { transform: scale(2); opacity: 0; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes ping-slowest {
          0% { transform: scale(1); opacity: 0.3; }
          70% { transform: scale(2.3); opacity: 0; }
          100% { transform: scale(2.3); opacity: 0; }
        }
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-ping-slower {
          animation: ping-slower 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          animation-delay: 0.3s;
        }
        .animate-ping-slowest {
          animation: ping-slowest 3s cubic-bezier(0, 0, 0.2, 1) infinite;
          animation-delay: 0.5s;
        }
      `
    }} />
  );
};

export default AIChatAnimations;
