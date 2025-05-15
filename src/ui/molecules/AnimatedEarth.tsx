import React, { useRef, useEffect } from 'react';

const AnimatedEarth: React.FC = () => {
  const earthRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const earthElement = earthRef.current;
    if (!earthElement) return;
    
    let rotation = 0;
    let animationId: number;
    
    const animate = () => {
      rotation += 0.1; // Control rotation speed
      if (earthElement) {
        earthElement.style.transform = `rotate(${rotation}deg)`;
      }
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div 
        ref={earthRef}
        className="w-[400px] h-[400px] rounded-full bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80')",
          boxShadow: "0 0 50px rgba(66, 153, 225, 0.5), inset 0 0 100px rgba(0, 0, 0, 0.8)"
        }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-transparent to-blue-400/20"></div>
      </div>
      <div className="absolute inset-0 rounded-full bg-blue-400/5 animate-pulse"></div>
    </div>
  );
};

export default AnimatedEarth;
