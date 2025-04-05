
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface IconWithBackgroundProps {
  icon: LucideIcon;
  bgClass: string;
  iconClass: string;
}

const IconWithBackground: React.FC<IconWithBackgroundProps> = ({
  icon: Icon,
  bgClass,
  iconClass,
}) => {
  return (
    <div className={`rounded-full p-2 ${bgClass}`}>
      <Icon className={`h-5 w-5 ${iconClass}`} />
    </div>
  );
};

export default IconWithBackground;
