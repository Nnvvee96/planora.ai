
import React from 'react';

const OrbAnimation = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Central orb - repositioned to be fully visible */}
      <div className="relative w-40 h-40 md:w-64 md:h-64 mx-auto">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-planora-accent-purple to-planora-accent-pink opacity-20 animate-pulse-light"></div>
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-planora-accent-purple to-planora-accent-pink opacity-30 blur-md"></div>
        <div className="absolute inset-0 rounded-full border border-white/20 animate-spin-slow"></div>
        
        {/* Orbiting small orbs - contained within planet boundaries */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
          <div className="absolute w-4 h-4 rounded-full bg-planora-accent-purple animate-orbit" style={{ animationDelay: '0s' }}></div>
          <div className="absolute w-3 h-3 rounded-full bg-planora-accent-pink animate-orbit" style={{ animationDelay: '-5s' }}></div>
          <div className="absolute w-2 h-2 rounded-full bg-planora-accent-blue animate-orbit" style={{ animationDelay: '-10s' }}></div>
          
          {/* Connecting lines */}
          <div className="absolute inset-0 rounded-full border border-dashed border-white/10 animate-spin-slow" style={{ animationDirection: 'reverse' }}></div>
        </div>
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-planora-accent-purple/20 blur-2xl animate-pulse-light" style={{ animationDelay: '-2s' }}></div>
      </div>
    </div>
  );
};

export default OrbAnimation;
