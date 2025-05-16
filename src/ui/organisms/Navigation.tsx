import React, { useState } from 'react';
import { Button } from '@/ui/atoms/Button';
import { Logo } from '@/ui/atoms/Logo';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const scrollToSection = (id: string) => {
    // Map navigation items to their actual section IDs if different
    const sectionMap: Record<string, string> = {
      'home': 'hero', // Map 'home' navigation item to 'hero' section ID
      // Add other mappings if needed
    };
    
    // Get the correct section ID from the map or use the provided ID
    const targetId = sectionMap[id] || id;
    
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else if (id === 'home' && window.location.pathname !== '/') {
      // If home is clicked and we're not on the landing page, navigate to it
      window.location.href = '/';
    }
    
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-[1400px] mx-auto px-0 md:px-2 py-4">
        <div className="flex items-center justify-between">
          <div className="pl-2 md:pl-3">
            <Logo className="ml-0" />  
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <button onClick={() => scrollToSection('home')} className="text-sm text-white hover:text-planora-accent-purple transition-colors">Home</button>
            <button onClick={() => scrollToSection('features')} className="text-sm text-white hover:text-planora-accent-purple transition-colors">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="text-sm text-white hover:text-planora-accent-purple transition-colors">Experience Travel Planning</button>
            <button onClick={() => scrollToSection('examples')} className="text-sm text-white hover:text-planora-accent-purple transition-colors">Examples</button>
            <button onClick={() => scrollToSection('pricing')} className="text-sm text-white hover:text-planora-accent-purple transition-colors">Pricing</button>
            <button onClick={() => scrollToSection('tech')} className="text-sm text-white hover:text-planora-accent-purple transition-colors">Technology</button>
            <button onClick={() => scrollToSection('faq')} className="text-sm text-white hover:text-planora-accent-purple transition-colors">FAQ</button>
            <button onClick={() => scrollToSection('cta')} className="text-sm text-white hover:text-planora-accent-purple transition-colors">Get Started</button>
            <div className="ml-4 flex items-center space-x-3">
              <Link to="/login">
                <Button variant="outline" className="border-white/20 hover:bg-white/10 text-white">Log In</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink hover:opacity-90 text-white">Sign Up</Button>
              </Link>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <button className="md:hidden p-2" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-6 space-y-4">
            <button onClick={() => scrollToSection('home')} className="block py-2 text-left w-full text-white hover:text-planora-accent-purple transition-colors">Home</button>
            <button onClick={() => scrollToSection('features')} className="block py-2 text-left w-full text-white hover:text-planora-accent-purple transition-colors">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="block py-2 text-left w-full text-white hover:text-planora-accent-purple transition-colors">Experience Travel Planning</button>
            <button onClick={() => scrollToSection('examples')} className="block py-2 text-left w-full text-white hover:text-planora-accent-purple transition-colors">Examples</button>
            <button onClick={() => scrollToSection('pricing')} className="block py-2 text-left w-full text-white hover:text-planora-accent-purple transition-colors">Pricing</button>
            <button onClick={() => scrollToSection('tech')} className="block py-2 text-left w-full text-white hover:text-planora-accent-purple transition-colors">Technology</button>
            <button onClick={() => scrollToSection('faq')} className="block py-2 text-left w-full text-white hover:text-planora-accent-purple transition-colors">FAQ</button>
            <button onClick={() => scrollToSection('cta')} className="block py-2 text-left w-full text-white hover:text-planora-accent-purple transition-colors">Get Started</button>
            <div className="pt-4 flex flex-col space-y-3">
              <Link to="/login">
                <Button variant="outline" className="w-full border-white/20 hover:bg-white/10 text-white">Log In</Button>
              </Link>
              <Link to="/register">
                <Button className="w-full bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink hover:opacity-90 text-white">Sign Up</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export { Navigation };
