/**
 * Features Section Component
 * 
 * "Why Choose Planora.ai" section with feature cards
 */

import React from "react";
import {
  MessageCircle,
  Calendar,
  UserPlus,
  Globe,
  RefreshCcw,
  Users,
} from "lucide-react";

export const FeaturesSection: React.FC = () => {
  return (
    <section
      id="features"
      className="py-24 px-4 md:px-6 bg-gradient-to-b from-planora-purple-dark/50 via-planora-purple-dark to-planora-purple-dark/80 relative overflow-hidden"
    >
      {/* Tech pattern background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCA2MCBNIDYwIDMwIEwgMzAgNjAgTSAzMCAwIEwgMCAzMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>

      <div className="container mx-auto relative z-10">
        {/* Enhanced section header with decorative elements */}
        <div className="relative text-center mb-20 max-w-3xl mx-auto">
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-planora-accent-purple/0 via-planora-accent-purple to-planora-accent-purple/0"></div>

          <h2 className="text-3xl md:text-5xl font-bold mb-6 flex flex-col items-center">
            <span className="text-xl md:text-2xl text-planora-accent-purple/80 mb-2 font-normal tracking-wider uppercase">
              Why Choose
            </span>
            <span className="gradient-text">Planora.ai</span>
          </h2>

          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Our intelligent travel assistant makes planning your trips
            effortless, personalized, and enjoyable with cutting-edge AI
            technology.
          </p>
        </div>

        {/* Modern feature cards with tech-inspired design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Natural Conversation */}
          <div className="group relative transform transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 rounded-2xl blur-xl opacity-30 group-hover:opacity-70 transition-opacity duration-300 bg-gradient-to-r from-planora-accent-purple/40 to-planora-accent-blue/40"></div>

            <div className="relative h-full bg-gradient-to-br from-black/70 to-planora-purple-dark/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-lg group-hover:border-white/20 p-8">
              <div className="w-14 h-14 rounded-2xl mb-6 flex items-center justify-center bg-gradient-to-br from-planora-accent-purple/20 to-planora-accent-blue/10 backdrop-blur-md border border-white/10 group-hover:border-white/20 transition-all duration-300 shadow-md">
                <MessageCircle className="w-7 h-7 text-white group-hover:text-planora-accent-purple transition-colors duration-300" />
              </div>

              <h3 className="text-xl font-bold mb-3 group-hover:text-planora-accent-purple transition-colors duration-300">
                Natural Conversation
              </h3>
              <p className="text-white/70 leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                Chat naturally about your travel preferences and let our AI
                understand your needs without filling out complex forms.
              </p>

              {/* Decorative elements */}
              <div className="absolute top-2 right-2 flex space-x-1 opacity-30">
                <div className="w-1 h-1 rounded-full bg-planora-accent-purple"></div>
                <div className="w-1 h-1 rounded-full bg-planora-accent-blue"></div>
              </div>
            </div>
          </div>

          {/* Group Planning */}
          <div className="group relative transform transition-all duration-500 hover:-translate-y-2 lg:translate-y-6">
            <div className="absolute inset-0 rounded-2xl blur-xl opacity-30 group-hover:opacity-70 transition-opacity duration-300 bg-gradient-to-r from-planora-accent-pink/40 to-planora-accent-purple/40"></div>

            <div className="relative h-full bg-gradient-to-br from-black/70 to-planora-purple-dark/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-lg group-hover:border-white/20 p-8">
              <div className="w-14 h-14 rounded-2xl mb-6 flex items-center justify-center bg-gradient-to-br from-planora-accent-pink/20 to-planora-accent-purple/10 backdrop-blur-md border border-white/10 group-hover:border-white/20 transition-all duration-300 shadow-md">
                <UserPlus className="w-7 h-7 text-white group-hover:text-planora-accent-pink transition-colors duration-300" />
              </div>

              <h3 className="text-xl font-bold mb-3 group-hover:text-planora-accent-pink transition-colors duration-300">
                Group Planning
              </h3>
              <p className="text-white/70 leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                Coordinate trips with friends and family by integrating
                everyone's preferences into a harmonious travel plan.
              </p>

              {/* Decorative elements */}
              <div className="absolute top-2 right-2 flex space-x-1 opacity-30">
                <div className="w-1 h-1 rounded-full bg-planora-accent-pink"></div>
                <div className="w-1 h-1 rounded-full bg-planora-accent-purple"></div>
              </div>
            </div>
          </div>

          {/* Smart Scheduling */}
          <div className="group relative transform transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 rounded-2xl blur-xl opacity-30 group-hover:opacity-70 transition-opacity duration-300 bg-gradient-to-r from-planora-accent-blue/40 to-planora-accent-purple/40"></div>

            <div className="relative h-full bg-gradient-to-br from-black/70 to-planora-purple-dark/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-lg group-hover:border-white/20 p-8">
              <div className="w-14 h-14 rounded-2xl mb-6 flex items-center justify-center bg-gradient-to-br from-planora-accent-blue/20 to-planora-accent-purple/10 backdrop-blur-md border border-white/10 group-hover:border-white/20 transition-all duration-300 shadow-md">
                <Calendar className="w-7 h-7 text-white group-hover:text-planora-accent-blue transition-colors duration-300" />
              </div>

              <h3 className="text-xl font-bold mb-3 group-hover:text-planora-accent-blue transition-colors duration-300">
                Smart Scheduling
              </h3>
              <p className="text-white/70 leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                Our AI optimizes your itinerary to maximize experiences
                while respecting your pace and preferences.
              </p>

              {/* Decorative elements */}
              <div className="absolute top-2 right-2 flex space-x-1 opacity-30">
                <div className="w-1 h-1 rounded-full bg-planora-accent-blue"></div>
                <div className="w-1 h-1 rounded-full bg-planora-accent-purple"></div>
              </div>
            </div>
          </div>

          {/* Destination Insights */}
          <div className="group relative transform transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 rounded-2xl blur-xl opacity-30 group-hover:opacity-70 transition-opacity duration-300 bg-gradient-to-r from-planora-accent-purple/40 to-planora-accent-pink/40"></div>

            <div className="relative h-full bg-gradient-to-br from-black/70 to-planora-purple-dark/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-lg group-hover:border-white/20 p-8">
              <div className="w-14 h-14 rounded-2xl mb-6 flex items-center justify-center bg-gradient-to-br from-planora-accent-purple/20 to-planora-accent-pink/10 backdrop-blur-md border border-white/10 group-hover:border-white/20 transition-all duration-300 shadow-md">
                <Globe className="w-7 h-7 text-white group-hover:text-planora-accent-purple transition-colors duration-300" />
              </div>

              <h3 className="text-xl font-bold mb-3 group-hover:text-planora-accent-purple transition-colors duration-300">
                Destination Insights
              </h3>
              <p className="text-white/70 leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                Get personalized recommendations based on your interests,
                budget, and travel style.
              </p>

              {/* Decorative elements */}
              <div className="absolute top-2 right-2 flex space-x-1 opacity-30">
                <div className="w-1 h-1 rounded-full bg-planora-accent-purple"></div>
                <div className="w-1 h-1 rounded-full bg-planora-accent-pink"></div>
              </div>
            </div>
          </div>

          {/* Real-Time Adaptation */}
          <div className="group relative transform transition-all duration-500 hover:-translate-y-2 lg:translate-y-6">
            <div className="absolute inset-0 rounded-2xl blur-xl opacity-30 group-hover:opacity-70 transition-opacity duration-300 bg-gradient-to-r from-planora-accent-pink/40 to-planora-accent-blue/40"></div>

            <div className="relative h-full bg-gradient-to-br from-black/70 to-planora-purple-dark/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-lg group-hover:border-white/20 p-8">
              <div className="w-14 h-14 rounded-2xl mb-6 flex items-center justify-center bg-gradient-to-br from-planora-accent-pink/20 to-planora-accent-blue/10 backdrop-blur-md border border-white/10 group-hover:border-white/20 transition-all duration-300 shadow-md">
                <RefreshCcw className="w-7 h-7 text-white group-hover:text-planora-accent-pink transition-colors duration-300" />
              </div>

              <h3 className="text-xl font-bold mb-3 group-hover:text-planora-accent-pink transition-colors duration-300">
                Real-Time Adaptation
              </h3>
              <p className="text-white/70 leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                Plans change? Our AI adapts your itinerary on the fly based
                on new information or preferences.
              </p>

              {/* Decorative elements */}
              <div className="absolute top-2 right-2 flex space-x-1 opacity-30">
                <div className="w-1 h-1 rounded-full bg-planora-accent-pink"></div>
                <div className="w-1 h-1 rounded-full bg-planora-accent-blue"></div>
              </div>
            </div>
          </div>

          {/* Personalized For You */}
          <div className="group relative transform transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 rounded-2xl blur-xl opacity-30 group-hover:opacity-70 transition-opacity duration-300 bg-gradient-to-r from-planora-accent-blue/40 to-planora-accent-pink/40"></div>

            <div className="relative h-full bg-gradient-to-br from-black/70 to-planora-purple-dark/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-lg group-hover:border-white/20 p-8">
              <div className="w-14 h-14 rounded-2xl mb-6 flex items-center justify-center bg-gradient-to-br from-planora-accent-blue/20 to-planora-accent-pink/10 backdrop-blur-md border border-white/10 group-hover:border-white/20 transition-all duration-300 shadow-md">
                <Users className="w-7 h-7 text-white group-hover:text-planora-accent-blue transition-colors duration-300" />
              </div>

              <h3 className="text-xl font-bold mb-3 group-hover:text-planora-accent-blue transition-colors duration-300">
                Personalized For You
              </h3>
              <p className="text-white/70 leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                The more you use Planora, the better it understands your
                preferences for more tailored recommendations.
              </p>

              {/* Decorative elements */}
              <div className="absolute top-2 right-2 flex space-x-1 opacity-30">
                <div className="w-1 h-1 rounded-full bg-planora-accent-blue"></div>
                <div className="w-1 h-1 rounded-full bg-planora-accent-pink"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 