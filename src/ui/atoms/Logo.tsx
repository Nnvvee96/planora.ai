import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/features/auth/components/AuthProvider';

interface LogoProps {
  className?: string;
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'text' | 'icon' | 'full';
}

const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  href, 
  size = 'md',
  variant = 'full' 
}) => {
  // Use the AuthContext directly to get real-time auth state
  const { isAuthenticated } = useAuthContext();
  
  // Determine correct href based on auth state and explicit props
  // Always prioritize explicit href if provided
  const getDestination = () => {
    // First priority: explicitly provided href from props
    if (href) return href;
    
    try {
      // Second priority: auth-based navigation (with safety checks)
      // Note: if auth context throws an error or is undefined, default to landing page
      return isAuthenticated ? '/dashboard' : '/';
    } catch (error) {
      // If there's any error accessing auth state, default to landing page
      console.warn('Auth state error in Logo component, defaulting to landing page');
      return '/';
    }
  };
  
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  // Icon component with orbiting elements
  const LogoIcon = () => (
    <div className={cn("relative", iconSizes[size])}>
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
        <span className="text-white font-bold text-sm">P</span>
      </div>
    </div>
  );

  // Text component
  const LogoText = () => (
    <span className={cn(`font-bold`, sizeClasses[size])}>
      <span className="text-planora-accent-purple">lanora</span>
      <span className="text-planora-accent-blue">.ai</span>
    </span>
  );

  // Content based on variant
  const renderContent = () => {
    switch (variant) {
      case 'icon':
        return <LogoIcon />;
      case 'text':
        return <LogoText />;
      case 'full':
      default:
        return (
          <div className="flex items-center gap-1">
            <LogoIcon />
            <LogoText />
          </div>
        );
    }
  };

  // The single return statement for the component
  return (
    <Link
      to={getDestination()}
      className={cn(
        'font-bold tracking-tight transition-colors',
        sizeClasses[size],
        className
      )}
    >
      {renderContent()}
    </Link>
  );
};

export { Logo };
