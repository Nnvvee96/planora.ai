import React from "react";
import { Button } from "@/ui/atoms/Button";
import { MessageCircle, Zap, Clock, Shield } from "lucide-react";

interface HowItWorksSectionProps {
  onChatWithPlanora: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ onChatWithPlanora }) => {
  return (
    <section
      id="how-it-works"
      className="py-24 px-4 md:px-6 bg-black/30 backdrop-blur-lg relative overflow-hidden"
    >
      {/* Modern geometric background shapes */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-planora-accent-purple/5 rotate-45 translate-x-1/2 -translate-y-1/2 rounded-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-planora-accent-blue/5 rotate-12 -translate-x-1/4 translate-y-1/4 rounded-3xl"></div>
      </div>

      {/* Animated path connector */}
      <div className="hidden md:block absolute left-1/2 top-[250px] bottom-[300px] w-0.5 transform -translate-x-1/2 z-0">
        <div className="h-full w-full bg-gradient-to-b from-planora-accent-purple via-planora-accent-pink to-planora-accent-blue opacity-20"></div>
      </div>

      <div className="container mx-auto relative z-10">
        {/* Enhanced section header */}
        <div className="text-center mb-20 max-w-3xl mx-auto relative">
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-px h-12 bg-gradient-to-b from-planora-accent-purple/0 to-planora-accent-purple"></div>

          <h2 className="text-3xl md:text-5xl font-bold mb-6 relative inline-block">
            <span className="relative">How </span>
            <span className="gradient-text">Planora.ai</span>
            <span className="relative"> Works</span>
            <div className="absolute -bottom-4 left-0 w-full h-0.5 bg-gradient-to-r from-planora-accent-purple/0 via-planora-accent-purple to-planora-accent-purple/0"></div>
          </h2>

          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Experience a new way of planning travel through AI-powered
            conversations and intelligent recommendations.
          </p>
        </div>

        {/* Enhanced step cards with modern styling */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 max-w-6xl mx-auto relative z-10">
          {/* Step 1 Card */}
          <div className="group bg-gradient-to-br from-black/60 to-planora-purple-dark/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center relative shadow-lg transition-all duration-300 hover:shadow-planora-accent-purple/20 hover:border-planora-accent-purple/30 hover:-translate-y-1">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink flex items-center justify-center text-white font-bold shadow-lg shadow-planora-accent-purple/20 group-hover:shadow-planora-accent-purple/40 transition-all duration-300">
              1
            </div>

            <div className="bg-planora-accent-purple/10 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Zap className="h-8 w-8 text-planora-accent-purple group-hover:text-white transition-colors duration-300" />
            </div>

            <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-planora-accent-purple transition-colors duration-300">
              Chat Naturally
            </h3>

            <p className="text-white/80 leading-relaxed group-hover:text-white transition-colors duration-300">
              Tell Planora about your travel preferences, interests, and
              constraints through simple, natural conversation.
            </p>
          </div>

          {/* Step 2 Card */}
          <div className="group bg-gradient-to-br from-black/60 to-planora-purple-dark/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center relative shadow-lg transition-all duration-300 hover:shadow-planora-accent-blue/20 hover:border-planora-accent-blue/30 hover:-translate-y-1 md:translate-y-8">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-planora-accent-blue to-planora-accent-purple flex items-center justify-center text-white font-bold shadow-lg shadow-planora-accent-blue/20 group-hover:shadow-planora-accent-blue/40 transition-all duration-300">
              2
            </div>

            <div className="bg-planora-accent-blue/10 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Clock className="h-8 w-8 text-planora-accent-blue group-hover:text-white transition-colors duration-300" />
            </div>

            <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-planora-accent-blue transition-colors duration-300">
              Get Personalized Plans
            </h3>

            <p className="text-white/80 leading-relaxed group-hover:text-white transition-colors duration-300">
              Our AI analyzes thousands of options to create custom travel
              plans based on your preferences, budget, and schedule.
            </p>
          </div>

          {/* Step 3 Card */}
          <div className="group bg-gradient-to-br from-black/60 to-planora-purple-dark/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center relative shadow-lg transition-all duration-300 hover:shadow-planora-accent-pink/20 hover:border-planora-accent-pink/30 hover:-translate-y-1">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-planora-accent-pink to-planora-accent-purple flex items-center justify-center text-white font-bold shadow-lg shadow-planora-accent-pink/20 group-hover:shadow-planora-accent-pink/40 transition-all duration-300">
              3
            </div>

            <div className="bg-planora-accent-pink/10 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Shield className="h-8 w-8 text-planora-accent-pink group-hover:text-white transition-colors duration-300" />
            </div>

            <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-planora-accent-pink transition-colors duration-300">
              Refine & Confirm
            </h3>

            <p className="text-white/80 leading-relaxed group-hover:text-white transition-colors duration-300">
              Review your personalized itinerary, make adjustments through
              conversation, and confirm your perfect travel plans.
            </p>
          </div>
        </div>

        {/* Enhanced CTA area */}
        <div className="mt-20 text-center relative">
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-px h-10 bg-gradient-to-t from-planora-accent-purple/0 to-planora-accent-purple"></div>

          <Button
            variant="gradient"
            size="lg"
            className="text-lg flex items-center gap-2 mx-auto px-8 py-6 shadow-xl shadow-planora-accent-purple/20 hover:shadow-planora-accent-purple/30 transition-all duration-300 group"
            onClick={onChatWithPlanora}
          >
            <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
            <span className="group-hover:translate-x-1 transition-transform duration-300">
              Start Planning Now
            </span>
          </Button>
        </div>
      </div>
    </section>
  );
}; 