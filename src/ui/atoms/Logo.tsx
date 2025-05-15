import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

const Logo = ({ className }: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 bg-gradient-to-br from-planora-accent-purple via-planora-accent-pink to-planora-accent-blue rounded-full opacity-70"></div>
        <div className="absolute inset-[2px] rounded-full bg-gradient-to-br from-planora-accent-blue/20 to-planora-accent-purple/20"></div>
        <div className="absolute inset-0 rounded-full border border-white/10"></div>
        {/* Small orbiting plane */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
          <div className="absolute animate-orbit-logo" style={{ animationDuration: '4s' }}>
            <div className="absolute -top-0.5 -left-0.5 w-1 h-1 bg-white rounded-full"></div>
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-lg">P</span>
        </div>
      </div>
      <span className="font-semibold text-lg text-white">lanora.ai</span>
    </div>
  );
};

export default Logo;
