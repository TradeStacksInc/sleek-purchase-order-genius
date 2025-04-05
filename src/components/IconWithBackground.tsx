
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface IconWithBackgroundProps {
  icon: LucideIcon;
  bgClass?: string;
  iconClass?: string;
  size?: number;
  style?: 'circle' | 'underground-tank';
  isConnected?: boolean;
  isActive?: boolean;
  productType?: string;
  volume?: number;
  capacity?: number;
}

const IconWithBackground: React.FC<IconWithBackgroundProps> = ({
  icon: Icon,
  bgClass = "bg-primary/10",
  iconClass = "text-primary",
  size = 16,
  style = 'circle',
  isConnected = false,
  isActive = false,
  productType,
  volume,
  capacity
}) => {
  if (style === 'underground-tank') {
    // Calculate fill percentage
    const fillPercentage = capacity ? Math.min(100, Math.max(0, (volume || 0) / capacity * 100)) : 0;
    
    // Determine color based on status
    let tankBorderColor = "border-gray-300";
    let tankFillColor = "bg-blue-500";
    
    if (isActive) {
      tankBorderColor = "border-green-500";
    }
    
    if (isConnected) {
      tankBorderColor = isActive ? "border-green-600" : "border-blue-600";
    }
    
    // Product type determines fill color
    if (productType === 'PMS') tankFillColor = "bg-red-500";
    if (productType === 'AGO') tankFillColor = "bg-amber-500";
    if (productType === 'DPK') tankFillColor = "bg-purple-500";
    
    return (
      <div className="flex flex-col items-center">
        {/* Underground tank shape */}
        <div className={`relative w-24 h-14 rounded-t-3xl border-2 ${tankBorderColor} overflow-hidden ${isConnected ? 'ring-2 ring-blue-300' : ''}`}>
          {/* Fill level */}
          <div 
            className={`absolute bottom-0 left-0 right-0 ${tankFillColor} transition-all duration-500`} 
            style={{ height: `${fillPercentage}%` }}
          />
          
          {/* Tank info overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-xs font-medium">
            <span className="drop-shadow-md">{productType || ''}</span>
            {volume !== undefined && <span className="drop-shadow-md">{Math.round(volume).toLocaleString()}L</span>}
          </div>

          {/* Connected indicator */}
          {isConnected && (
            <div className="absolute -top-1 -right-1">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
            </div>
          )}
        </div>
        
        {/* Underground pipe */}
        <div className={`w-4 h-4 ${tankBorderColor} border-r-2 border-l-2`}></div>
        
        {/* Status indicator text */}
        <div className="text-xs mt-1 font-medium">
          {isActive ? 
            <span className="text-green-600">Active</span> : 
            <span className="text-gray-500">Inactive</span>
          }
          {isConnected && 
            <span className="ml-1 text-blue-600">• Connected</span>
          }
        </div>
      </div>
    );
  }
  
  // Original circular background icon
  return (
    <div className={`rounded-full ${bgClass} p-1.5 flex items-center justify-center`}>
      <Icon className={`h-${size / 4} w-${size / 4} ${iconClass}`} />
    </div>
  );
};

export default IconWithBackground;
