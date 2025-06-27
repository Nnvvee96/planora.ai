import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/ui/atoms/Button';
import { Input } from '@/ui/atoms/Input';

interface CTASectionProps {
  onChatWithPlanora: () => void;
}

const CTASection = ({ onChatWithPlanora }: CTASectionProps) => {
  const navigate = useNavigate();

  return (
    <section
      id="cta"
      className="relative py-24 px-4 md:px-6 overflow-hidden"
    >
      {/* Tech-inspired background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] rounded-full bg-planora-accent-purple/10 blur-3xl"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-planora-accent-blue/10 blur-3xl"></div>

        {/* Tech grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCA2MCBNIDYwIDMwIEwgMzAgNjAgTSAzMCAwIEwgMCAzMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-10"></div>

        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div
            className="absolute w-2 h-2 bg-planora-accent-blue rounded-full top-1/4 left-1/3 animate-pulse"
            style={{ animationDuration: '3s' }}
          ></div>
          <div
            className="absolute w-3 h-3 bg-planora-accent-purple rounded-full bottom-1/3 right-1/4 animate-pulse"
            style={{ animationDuration: '4s' }}
          ></div>
          <div
            className="absolute w-2 h-2 bg-planora-accent-pink rounded-full top-1/2 right-1/3 animate-pulse"
            style={{ animationDuration: '5s' }}
          ></div>
        </div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-black/60 via-planora-purple-dark/60 to-black/60 backdrop-blur-xl p-10 md:p-16 shadow-[0_0_50px_rgba(139,92,246,0.1)]">
          {/* Decorative circuit lines */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-planora-accent-purple/0 via-planora-accent-purple/30 to-planora-accent-purple/0"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-planora-accent-blue/0 via-planora-accent-blue/30 to-planora-accent-blue/0"></div>
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-planora-accent-purple/0 via-planora-accent-purple/30 to-planora-accent-purple/0"></div>
          <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-planora-accent-blue/0 via-planora-accent-blue/30 to-planora-accent-blue/0"></div>

          <div className="relative z-10 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 relative inline-block">
              <span className="text-white">Ready to </span>
              <span className="gradient-text">Redefine</span>
              <span className="text-white"> Your Travel?</span>
              <div className="absolute -bottom-3 left-0 w-full h-0.5 bg-gradient-to-r from-planora-accent-purple/0 via-planora-accent-pink to-planora-accent-blue/0"></div>
            </h2>

            <p className="text-xl mb-12 text-white/80 max-w-3xl mx-auto leading-relaxed">
              Experience the future of travel planning with Planora.ai.
              Start planning your next adventure with the power of AI and
              save hours of research time.
            </p>

            {/* Newsletter Section - Enhanced Design */}
            <div className="max-w-2xl mx-auto mb-12 bg-gradient-to-br from-black/60 to-planora-purple-dark/20 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-lg transform transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-planora-accent-purple/0 via-planora-accent-purple to-planora-accent-purple/0"></div>

              <h3 className="text-2xl font-bold mb-4">
                Stay Updated on{' '}
                <span className="gradient-text">Travel Trends</span>
              </h3>
              <p className="text-lg text-white/80 max-w-xl mx-auto mb-6">
                Subscribe to our newsletter for travel inspiration, AI
                insights, and exclusive offers.
              </p>

              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  placeholder="Enter your email address"
                  className="bg-black/40 border-white/20 flex-grow focus:border-planora-accent-purple/50 focus:ring-planora-accent-purple/20"
                />
                <Button
                  variant="glow"
                  className="bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink hover:opacity-90 md:w-auto group transition-all duration-300"
                >
                  <Mail className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                  Subscribe
                </Button>
              </div>

              <p className="text-sm text-white/50 mt-4">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>

            <div className="flex flex-wrap gap-6 justify-center">
              <Button
                variant="gradient"
                size="lg"
                className="text-lg font-medium flex items-center gap-3 px-8 py-6 bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink shadow-lg hover:shadow-[0_0_25px_rgba(139,92,246,0.3)] group"
                onClick={onChatWithPlanora}
              >
                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                Chat with Planora
              </Button>
              <Button
                variant="glow"
                size="lg"
                className="border-white/20 bg-black/30 hover:bg-black/50 text-white group text-lg font-medium flex items-center gap-2 px-8 py-6" // Retained text-lg, font-medium, flex, items-center, gap-2, px-8, py-6 from original for sizing consistency with Chat with Planora
                onClick={() => navigate('/faq')}
              >
                Learn More
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </div>
          </div>

          {/* Decorative elements - simplified */}
          <div className="absolute top-0 left-0 w-40 h-40 bg-planora-accent-purple/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-planora-accent-blue/30 rounded-full blur-3xl"></div>
          <div className="absolute -top-10 -right-10 w-80 h-80 border border-white/10 rounded-full"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 border border-white/5 rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export { CTASection }; 