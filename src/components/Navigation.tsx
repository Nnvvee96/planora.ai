
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Logo from './Logo';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <Logo />
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <button onClick={() => scrollToSection('home')} className="text-sm text-white hover:text-planora-accent-purple transition-colors">Home</button>
            <button onClick={() => scrollToSection('how-it-works')} className="text-sm text-white hover:text-planora-accent-purple transition-colors">Experience Travel Planning</button>
            <button onClick={() => scrollToSection('features')} className="text-sm text-white hover:text-planora-accent-purple transition-colors">Features</button>
            <button onClick={() => scrollToSection('why-planora')} className="text-sm text-white hover:text-planora-accent-purple transition-colors">Why Planora</button>
            <button onClick={() => scrollToSection('comparison')} className="text-sm text-white hover:text-planora-accent-purple transition-colors">Comparison</button>
            <button onClick={() => scrollToSection('ai-powered')} className="text-sm text-white hover:text-planora-accent-purple transition-colors">AI-Powered</button>
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
            <button onClick={() => scrollToSection('how-it-works')} className="block py-2 text-left w-full text-white hover:text-planora-accent-purple transition-colors">Experience Travel Planning</button>
            <button onClick={() => scrollToSection('features')} className="block py-2 text-left w-full text-white hover:text-planora-accent-purple transition-colors">Features</button>
            <button onClick={() => scrollToSection('why-planora')} className="block py-2 text-left w-full text-white hover:text-planora-accent-purple transition-colors">Why Planora</button>
            <button onClick={() => scrollToSection('comparison')} className="block py-2 text-left w-full text-white hover:text-planora-accent-purple transition-colors">Comparison</button>
            <button onClick={() => scrollToSection('ai-powered')} className="block py-2 text-left w-full text-white hover:text-planora-accent-purple transition-colors">AI-Powered</button>
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

export default Navigation;
