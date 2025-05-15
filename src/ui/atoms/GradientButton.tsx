import React from 'react';
import { cn } from '@/lib/utils';

interface GradientButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  size?: 'default' | 'sm' | 'lg';
  type?: 'button' | 'submit' | 'reset';
}

const GradientButton = ({ 
  children, 
  className, 
  onClick,
  size = 'default',
  type = 'button'
}: GradientButtonProps) => {
  const sizeClasses = {
    sm: 'text-sm px-4 py-2',
    default: 'px-6 py-3',
    lg: 'text-lg px-8 py-4'
  };

  return (
    <button 
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden font-bold rounded-lg",
        sizeClasses[size],
        className
      )}
      onClick={onClick}
      type={type}
    >
      <span className="absolute inset-0 w-full h-full transition duration-300 ease-out opacity-80 bg-gradient-to-br from-planora-accent-purple via-planora-accent-pink to-planora-accent-blue"></span>
      <span className="absolute top-0 left-0 w-full h-full transition-all duration-500 ease-out rounded-lg opacity-0 bg-gradient-to-br from-planora-accent-purple via-planora-accent-pink to-planora-accent-blue hover:opacity-70 hover:blur-lg"></span>
      <span className="relative z-10 flex items-center justify-center text-white transition-all duration-300 whitespace-normal break-words">{children}</span>
    </button>
  );
};

export default GradientButton;
