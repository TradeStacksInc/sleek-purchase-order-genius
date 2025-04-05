
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface IconWithBackgroundProps {
  icon: LucideIcon;
  bgClass?: string;
  iconClass?: string;
  size?: number;
}

const IconWithBackground: React.FC<IconWithBackgroundProps> = ({
  icon: Icon,
  bgClass = "bg-primary/10",
  iconClass = "text-primary",
  size = 16
}) => {
  return (
    <div className={`rounded-full ${bgClass} p-1.5 flex items-center justify-center`}>
      <Icon className={`h-${size / 4} w-${size / 4} ${iconClass}`} />
    </div>
  );
};

export default IconWithBackground;
