import React, { useEffect, useRef } from 'react';

interface OrbAnimationProps {
  className?: string;
}

const OrbAnimation: React.FC<OrbAnimationProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    resize();
    window.addEventListener('resize', resize);

    // Orb configuration
    const orbs: {
      x: number;
      y: number;
      radius: number;
      color: string;
      alpha: number;
      speed: number;
      direction: { x: number; y: number };
    }[] = [];

    const colors = [
      'rgba(147, 51, 234, 0.7)', // Planora purple
      'rgba(192, 132, 252, 0.7)', // Planora accent purple
      'rgba(79, 70, 229, 0.7)',   // Planora accent blue
    ];

    // Create orbs
    for (let i = 0; i < 10; i++) {
      const radius = Math.random() * 50 + 20;
      orbs.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.3,
        speed: Math.random() * 0.5 + 0.2,
        direction: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2
        }
      });
    }

    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      orbs.forEach(orb => {
        // Update position
        orb.x += orb.direction.x * orb.speed;
        orb.y += orb.direction.y * orb.speed;
        
        // Bounce off walls
        if (orb.x - orb.radius < 0 || orb.x + orb.radius > canvas.width) {
          orb.direction.x *= -1;
        }
        
        if (orb.y - orb.radius < 0 || orb.y + orb.radius > canvas.height) {
          orb.direction.y *= -1;
        }
        
        // Draw orb
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fillStyle = orb.color;
        ctx.globalAlpha = orb.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className={`w-full h-full absolute top-0 left-0 -z-10 ${className}`}
    />
  );
};

export { OrbAnimation };
