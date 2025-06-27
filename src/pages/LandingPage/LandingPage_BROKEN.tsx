/**
 * Landing Page (Refactored)
 *
 * Main landing page component that orchestrates all sections
 * Reduced from 1830+ lines to a clean, maintainable structure
 */

import React from "react";
import { Navigation } from "@/ui/organisms/Navigation";
import { Footer } from "@/ui/organisms/Footer";
import { HeroSection } from "./components/HeroSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { PricingSection } from "./components/PricingSection";
import { ReviewsSection } from "./components/ReviewsSection";
import { FAQSection } from "./components/FAQSection";
import { NewsletterSection } from "./components/NewsletterSection";

export const LandingPage = () => {
  return (
    <div className="relative min-h-screen bg-planora-purple-dark flex flex-col overflow-hidden">
      {/* Enhanced modern background with animated gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-planora-purple-dark via-planora-purple-dark to-black opacity-90 z-0"></div>

      {/* Tech-inspired animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-gradient-to-r from-planora-accent-purple/10 to-planora-accent-blue/10 blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-r from-planora-accent-blue/10 to-planora-accent-purple/10 blur-3xl animate-pulse-slow-reverse"></div>

        {/* Floating tech elements */}
        <div className="absolute top-[15%] left-[10%] w-1 h-1 bg-planora-accent-purple rounded-full animate-float opacity-60"></div>
        <div className="absolute top-[35%] left-[30%] w-2 h-2 bg-white rounded-full animate-float-reverse opacity-30"></div>
        <div className="absolute top-[25%] right-[15%] w-1.5 h-1.5 bg-planora-accent-pink rounded-full animate-float-delay opacity-50"></div>
        <div className="absolute bottom-[20%] left-[20%] w-1 h-1 bg-planora-accent-blue rounded-full animate-float-slow opacity-40"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header with Navigation */}
        <Navigation />

        {/* Hero Section */}
        <HeroSection />

        {/* Features Section */}
        <FeaturesSection />

        {/* How It Works Section */}
        <HowItWorksSection />

        {/* Pricing Section */}
        <PricingSection />

        {/* Reviews Section */}
        <ReviewsSection />

        {/* FAQ Section */}
        <FAQSection />

        {/* Newsletter Section */}
        <NewsletterSection />

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}; 