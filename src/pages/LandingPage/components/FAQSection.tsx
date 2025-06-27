import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/ui/atoms/Button';
import { faqItems } from '../data/faqItems';

const FAQSection = () => {
  const navigate = useNavigate();

  return (
    <section
      id="faq"
      className="py-24 px-4 md:px-6 relative overflow-hidden"
    >
      {/* Tech-inspired background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-lg"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-planora-accent-blue/5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-planora-accent-purple/5 blur-3xl"></div>

        {/* Tech grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCA2MCBNIDYwIDMwIEwgMzAgNjAgTSAzMCAwIEwgMCAzMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-10"></div>

        {/* Decorative circuit patterns */}
        <div className="absolute left-10 bottom-20 w-48 h-48 opacity-10">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 90H50V50H90"
              stroke="url(#faq-gradient)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            <circle cx="10" cy="90" r="4" fill="#8B5CF6" />
            <circle cx="50" cy="50" r="4" fill="#1EAEDB" />
            <circle cx="90" cy="50" r="4" fill="#D946EF" />
            <defs>
              <linearGradient
                id="faq-gradient"
                x1="0"
                y1="100"
                x2="100"
                y2="0"
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
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-px h-12 bg-gradient-to-b from-planora-accent-blue/0 to-planora-accent-blue"></div>

          <h2 className="text-3xl md:text-4xl font-bold mb-6 relative inline-block">
            <span className="text-white">Frequently Asked</span>
            <span className="ml-3 gradient-text">Questions</span>
            <div className="absolute -bottom-3 left-0 w-full h-0.5 bg-gradient-to-r from-planora-accent-blue/0 via-planora-accent-blue to-planora-accent-blue/0"></div>
          </h2>

          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Find answers to common questions about how Planora.ai works.
          </p>
        </div>

        {/* Modern FAQ accordion */}
        <div className="max-w-3xl mx-auto space-y-5">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="group relative transform transition-all duration-300 hover:translate-x-1"
            >
              <div className="absolute inset-0 rounded-xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300 bg-gradient-to-r from-planora-accent-purple/30 to-planora-accent-blue/30"></div>

              <div className="relative bg-gradient-to-br from-black/60 to-planora-purple-dark/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-lg p-6 group-hover:border-white/20 transition-all duration-300">
                <h3 className="text-xl font-bold mb-3 group-hover:text-planora-accent-blue transition-colors duration-300">
                  {item.question}
                </h3>
                <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}

          {/* View More FAQs Button */}
          <div className="text-center mt-8">
            <a
              href="/faq"
              className="px-3 py-1 text-sm text-planora-accent-purple hover:text-planora-accent-blue transition-colors border border-planora-accent-purple/30 rounded-full hover:border-planora-accent-purple/60 inline-flex items-center"
            >
              View More FAQs
              <ChevronRight className="w-3 h-3 ml-1" />
            </a>
          </div>

          <div className="mt-12 text-center pt-6 relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-px bg-gradient-to-r from-planora-accent-purple/0 via-planora-accent-purple to-planora-accent-purple/0"></div>
            <p className="mb-6 text-white/80 text-lg">
              Have more questions that aren't answered here?
            </p>
            <Button
              onClick={() => navigate("/support")}
              variant="glow"
              className="border-white/20 bg-black/30 hover:bg-black/50 text-white group"
            >
              <span>Visit Our Support Center</span>
              <ChevronRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export { FAQSection }; 