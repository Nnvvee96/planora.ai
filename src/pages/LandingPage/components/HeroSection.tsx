/**
 * Hero Section Component
 * 
 * Main landing section with call-to-action and 3D Earth visualization
 */

import React, { Suspense } from "react";
import { Button } from "@/ui/atoms/Button";
import { Zap, ArrowRight } from "lucide-react";
import { VanillaEarthScene } from "@/ui/organisms/VanillaEarthScene";

interface HeroSectionProps {
  onChatWithPlanora: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onChatWithPlanora }) => {
  const handleLearnMore = () => {
    document
      .getElementById("features")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="min-h-screen flex items-center py-12 md:py-24 px-4 md:px-6 relative overflow-hidden"
    >
      {/* Tech-inspired background elements */}
      <div className="absolute inset-0 z-0">
        {/* Neural network-inspired nodes */}
        <div className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full bg-planora-accent-purple/20 shadow-[0_0_20px_rgba(139,92,246,0.3)] animate-pulse-slow"></div>
        <div className="absolute top-3/4 left-1/3 w-3 h-3 rounded-full bg-planora-accent-blue/20 shadow-[0_0_15px_rgba(30,174,219,0.3)] animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-5 h-5 rounded-full bg-planora-accent-pink/20 shadow-[0_0_25px_rgba(217,70,239,0.3)] animate-pulse-slow-reverse"></div>
        <div className="absolute top-1/4 right-1/3 w-4 h-4 rounded-full bg-planora-accent-blue/20 shadow-[0_0_20px_rgba(30,174,219,0.3)] animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-3 h-3 rounded-full bg-planora-accent-purple/20 shadow-[0_0_15px_rgba(139,92,246,0.3)] animate-pulse-slow-reverse"></div>
        <div className="absolute bottom-1/3 left-1/4 w-4 h-4 rounded-full bg-planora-accent-pink/20 shadow-[0_0_20px_rgba(217,70,239,0.3)] animate-pulse"></div>

        {/* Animated data points */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-white/20 animate-float-random"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left column - Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <div className="flex flex-col md:flex-row items-center lg:items-start gap-2 mb-2">
                <span className="text-white">Travel</span>
                <div className="relative">
                  <span className="gradient-text">Intelligently</span>
                  <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink rounded-full opacity-80"></div>
                </div>
              </div>
              <span className="text-white">
                With{" "}
                <span className="text-planora-accent-blue font-extrabold">
                  Planora.ai
                </span>
              </span>
            </h1>
            <p className="text-lg md:text-xl text-planora-purple-light mb-8 max-w-lg mx-auto lg:mx-0">
              Your intelligent travel companion that crafts personalized
              journeys in minutes. Say goodbye to planning stress and hello
              to your next adventure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                variant="gradient"
                size="lg"
                className="flex items-center gap-2"
                onClick={onChatWithPlanora}
              >
                <Zap className="w-5 h-5" />
                Start Planning for Free
              </Button>
              <Button
                variant="glass"
                size="lg"
                className="flex items-center gap-2"
                onClick={handleLearnMore}
              >
                Learn More
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Right column - 3D Earth Visualization */}
          <div className="order-1 lg:order-2 h-[400px] md:h-[600px] lg:h-full w-full">
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center text-white">
                  Loading 3D Experience...
                </div>
              }
            >
              <VanillaEarthScene />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}; 