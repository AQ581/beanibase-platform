import { FC } from 'react';
import { cn } from '../lib/utils';

interface BeanibaseLogoProps {
  className?: string;
  iconClassName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const BeanibaseLogo: FC<BeanibaseLogoProps> = ({ className, iconClassName, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-28 h-28',
    xl: 'w-56 h-56',
  };

  return (
    <div className={cn(
      "bg-orange-500 rounded-[30%] flex items-center justify-center shadow-2xl shadow-orange-200/50 overflow-hidden relative group",
      sizeClasses[size],
      className
    )}>
      {/* Custom SVG Logo: The "Minimalist Cat" */}
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={cn("w-[70%] h-[70%] text-white transition-all duration-700 group-hover:scale-110", iconClassName)}
      >
        {/* Ears */}
        <path 
          d="M7 10L5 4L10 7" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M17 10L19 4L14 7" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        {/* Head/Body */}
        <path 
          d="M4 12C4 9.79086 5.79086 8 8 8H16C18.2091 8 20 9.79086 20 12V17C20 19.2091 18.2091 21 16 21H8C5.79086 21 4 19.2091 4 17V12Z" 
          fill="currentColor" 
        />
        {/* Eyes */}
        <circle cx="8.5" cy="13.5" r="1.2" fill="white" fillOpacity="0.6" />
        <circle cx="15.5" cy="13.5" r="1.2" fill="white" fillOpacity="0.6" />
        {/* Nose/Mouth area */}
        <path 
          d="M11 16L12 17L13 16" 
          stroke="white" 
          strokeWidth="1.5" 
          strokeOpacity="0.4"
          strokeLinecap="round"
        />
        {/* Tail */}
        <path 
          d="M20 17C22 17 23 15 23 13" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round"
        />
      </svg>
      
      {/* Premium Glass Shine */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/15 to-white/0 pointer-events-none" />
    </div>
  );
};
