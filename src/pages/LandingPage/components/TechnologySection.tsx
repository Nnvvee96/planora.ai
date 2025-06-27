import React from 'react';
import { Code, Globe, Sparkles, Shield } from 'lucide-react';

const TechnologySection = () => {
  return (
    <section
      id="tech"
      className="py-24 px-4 md:px-6 bg-black/30 backdrop-blur-lg relative overflow-hidden"
    >
      {/* Tech-inspired background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-planora-accent-blue/5 to-transparent opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-planora-accent-purple/5 blur-3xl"></div>

        {/* Tech grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCA2MCBNIDYwIDMwIEwgMzAgNjAgTSAzMCAwIEwgMCAzMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-10"></div>

        {/* Decorative circuit patterns */}
        <div className="absolute right-10 top-20 w-32 h-32 opacity-10">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 10H50V50H90"
              stroke="url(#tech-gradient)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            <circle cx="10" cy="10" r="4" fill="#8B5CF6" />
            <circle cx="50" cy="50" r="4" fill="#1EAEDB" />
            <circle cx="90" cy="50" r="4" fill="#D946EF" />
            <defs>
              <linearGradient
                id="tech-gradient"
                x1="0"
                y1="0"
                x2="100"
                y2="100"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#8B5CF6" />
                <stop offset="0.5" stopColor="#1EAEDB" />
                <stop offset="1" stopColor="#D946EF" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div className="container mx-auto relative z-10">
        {/* Enhanced section header */}
        <div className="text-center mb-16 relative">
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-px h-12 bg-gradient-to-b from-planora-accent-purple/0 to-planora-accent-purple"></div>

          <h2 className="text-3xl md:text-4xl font-bold mb-6 relative inline-block">
            <span className="text-white">Powered by</span>
            <span className="ml-3 gradient-text">Planora.ai</span>
            <div className="absolute -bottom-3 left-0 w-full h-0.5 bg-gradient-to-r from-planora-accent-purple/0 via-planora-accent-purple to-planora-accent-purple/0"></div>
          </h2>

          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Our platform leverages cutting-edge technology to create
            personalized travel experiences.
          </p>
        </div>

        {/* Modern tech cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Natural Language Processing */}
          <div className="group relative transform transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 rounded-2xl blur-xl opacity-30 group-hover:opacity-70 transition-opacity duration-300 bg-gradient-to-r from-planora-accent-purple/30 to-planora-accent-blue/30"></div>

            <div className="relative h-full bg-gradient-to-br from-black/60 to-planora-purple-dark/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-lg p-6 text-center group-hover:border-white/20">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-planora-accent-purple/20 to-planora-accent-blue/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10 group-hover:border-white/20 transition-all duration-300">
                <Code className="w-8 h-8 text-white group-hover:text-planora-accent-purple transition-colors duration-300" />
              </div>

              <h3 className="text-xl font-bold mb-3 group-hover:text-planora-accent-purple transition-colors duration-300">
                Natural Language Processing
              </h3>
              <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                Our AI understands your travel preferences through natural
                conversation.
              </p>
            </div>
          </div>

          {/* Destination Database */}
          <div className="group relative transform transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 rounded-2xl blur-xl opacity-30 group-hover:opacity-70 transition-opacity duration-300 bg-gradient-to-r from-planora-accent-blue/30 to-planora-accent-purple/30"></div>

            <div className="relative h-full bg-gradient-to-br from-black/60 to-planora-purple-dark/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-lg p-6 text-center group-hover:border-white/20">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-planora-accent-blue/20 to-planora-accent-purple/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10 group-hover:border-white/20 transition-all duration-300">
                <Globe className="w-8 h-8 text-white group-hover:text-planora-accent-blue transition-colors duration-300" />
              </div>

              <h3 className="text-xl font-bold mb-3 group-hover:text-planora-accent-blue transition-colors duration-300">
                Destination Database
              </h3>
              <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                Comprehensive information on thousands of destinations
                worldwide.
              </p>
            </div>
          </div>

          {/* Personalized Recommendations */}
          <div className="group relative transform transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 rounded-2xl blur-xl opacity-30 group-hover:opacity-70 transition-opacity duration-300 bg-gradient-to-r from-planora-accent-pink/30 to-planora-accent-purple/30"></div>

            <div className="relative h-full bg-gradient-to-br from-black/60 to-planora-purple-dark/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-lg p-6 text-center group-hover:border-white/20">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-planora-accent-pink/20 to-planora-accent-purple/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10 group-hover:border-white/20 transition-all duration-300">
                <Sparkles className="w-8 h-8 text-white group-hover:text-planora-accent-pink transition-colors duration-300" />
              </div>

              <h3 className="text-xl font-bold mb-3 group-hover:text-planora-accent-pink transition-colors duration-300">
                Personalized Recommendations
              </h3>
              <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                Our system learns from your interactions to provide better
                recommendations.
              </p>
            </div>
          </div>

          {/* Secure Platform */}
          <div className="group relative transform transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 rounded-2xl blur-xl opacity-30 group-hover:opacity-70 transition-opacity duration-300 bg-gradient-to-r from-planora-accent-green/30 to-planora-accent-blue/30"></div>

            <div className="relative h-full bg-gradient-to-br from-black/60 to-planora-purple-dark/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-lg p-6 text-center group-hover:border-white/20">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-planora-accent-green/20 to-planora-accent-blue/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10 group-hover:border-white/20 transition-all duration-300">
                <Shield className="w-8 h-8 text-white group-hover:text-planora-accent-green transition-colors duration-300" />
              </div>

              <h3 className="text-xl font-bold mb-3 group-hover:text-planora-accent-green transition-colors duration-300">
                Secure Platform
              </h3>
              <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                Enterprise-grade security protecting your personal
                information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { TechnologySection }; 