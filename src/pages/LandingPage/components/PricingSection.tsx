import React from "react";
import { Button } from "@/ui/atoms/Button";
import { pricingTiers } from "../data/pricingTiers";
import {
  Globe,
  Plane,
  Star,
  CheckCircle,
  ChevronRight,
  XCircle,
  Mail,
} from "lucide-react";

interface PricingSectionProps {
  onChatWithPlanora: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onChatWithPlanora }) => {
  return (
    <section
      id="pricing"
      className="py-24 px-4 md:px-6 bg-gradient-to-b from-planora-purple-dark/30 via-planora-purple-dark/50 to-planora-purple-dark/30 relative overflow-hidden"
    >
      {/* Decorative tech-inspired background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-planora-accent-purple/5 to-transparent opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-planora-accent-blue/5 blur-3xl"></div>
        <div className="absolute top-1/3 -left-16 w-32 h-32 rounded-full bg-planora-accent-pink/10 blur-xl"></div>

        {/* Decorative circuit patterns */}
        <div className="absolute left-0 top-1/3 w-32 h-full opacity-10">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 200 800"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 0V200H100V400H180V600H50V800"
              stroke="url(#pricing-line-gradient)"
              strokeWidth="2"
              strokeDasharray="6 6"
            />
            <circle cx="10" cy="200" r="6" fill="#8B5CF6" />
            <circle cx="100" cy="400" r="6" fill="#1EAEDB" />
            <circle cx="180" cy="600" r="6" fill="#D946EF" />
            <defs>
              <linearGradient
                id="pricing-line-gradient"
                x1="0"
                y1="0"
                x2="0"
                y2="800"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#8B5CF6" />
                <stop offset="0.5" stopColor="#1EAEDB" />
                <stop offset="1" stopColor="#D946EF" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="absolute right-0 top-1/2 w-32 h-full opacity-10">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 200 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M190 0V150H100V300H20V450H150V600"
              stroke="url(#pricing-line-gradient-2)"
              strokeWidth="2"
              strokeDasharray="6 6"
            />
            <circle cx="190" cy="150" r="6" fill="#D946EF" />
            <circle cx="100" cy="300" r="6" fill="#8B5CF6" />
            <circle cx="20" cy="450" r="6" fill="#1EAEDB" />
            <defs>
              <linearGradient
                id="pricing-line-gradient-2"
                x1="0"
                y1="0"
                x2="0"
                y2="600"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#D946EF" />
                <stop offset="0.5" stopColor="#8B5CF6" />
                <stop offset="1" stopColor="#1EAEDB" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Tech pattern background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCA2MCBNIDYwIDMwIEwgMzAgNjAgTSAzMCAwIEwgMCAzMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-10"></div>

      <div className="container mx-auto relative z-10">
        {/* Enhanced section header */}
        <div className="relative text-center mb-20 max-w-3xl mx-auto">
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-px h-12 bg-gradient-to-b from-planora-accent-purple/0 to-planora-accent-purple"></div>

          <h2 className="text-3xl md:text-5xl font-bold mb-6 relative inline-block">
            <span className="text-xl md:text-2xl text-planora-accent-purple/80 mb-2 block font-normal tracking-wider uppercase">
              Flexible
            </span>
            <span className="gradient-text">Pricing Plans</span>
            <div className="absolute -bottom-4 left-0 w-full h-0.5 bg-gradient-to-r from-planora-accent-purple/0 via-planora-accent-purple to-planora-accent-purple/0"></div>
          </h2>

          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Choose the plan that perfectly aligns with your travel needs and
            preferences. All plans include our AI-powered planning
            assistant.
          </p>
        </div>

        {/* Enhanced pricing tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative z-10">
          {pricingTiers.map((tier, index) => {
            // Calculate animation delay based on index
            const animationDelay = index * 200;

            return (
              <div
                key={index}
                className={`group relative transform transition-all duration-500 hover:-translate-y-2`}
                style={{ animationDelay: `${animationDelay}ms` }}
              >
                {/* Background glow effect */}
                <div
                  className={`absolute inset-0 rounded-2xl blur-xl opacity-30 group-hover:opacity-70 transition-opacity duration-300 ${
                    tier.highlighted
                      ? "bg-gradient-to-r from-planora-accent-purple/40 to-planora-accent-pink/40"
                      : "bg-white/5"
                  }`}
                ></div>

                <div
                  className={`relative h-full bg-gradient-to-br from-black/70 to-planora-purple-dark/40 backdrop-blur-xl border rounded-2xl overflow-hidden shadow-lg ${
                    tier.highlighted
                      ? "border-planora-accent-purple shadow-planora-accent-purple/20"
                      : "border-white/10 group-hover:border-white/20"
                  }`}
                >
                  {tier.highlighted && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink p-1 text-white text-xs font-bold text-center tracking-wider">
                      MOST POPULAR
                    </div>
                  )}

                  <div className="p-8">
                    {/* Decorative icon based on plan */}
                    <div
                      className={`w-12 h-12 rounded-full mb-6 flex items-center justify-center ${
                        tier.highlighted
                          ? "bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink"
                          : "bg-white/10"
                      }`}
                    >
                      {index === 0 && (
                        <Globe className="w-6 h-6 text-white" />
                      )}
                      {index === 1 && (
                        <Plane className="w-6 h-6 text-white" />
                      )}
                      {index === 2 && (
                        <Star className="w-6 h-6 text-white" />
                      )}
                    </div>

                    <h3 className="text-2xl font-bold mb-2 group-hover:text-planora-accent-purple transition-colors duration-300">
                      {tier.name}
                    </h3>
                    <p className="text-white/70 mb-6 leading-relaxed">
                      {tier.description}
                    </p>

                    <div className="mb-8">
                      <span className="text-4xl font-bold">
                        {tier.price}
                      </span>
                      {tier.period && (
                        <span className="text-white/70 ml-1">
                          /{tier.period}
                        </span>
                      )}
                    </div>

                    <div className="space-y-4 mb-8">
                      {tier.features.map((feature, featureIndex) => (
                        <div
                          key={featureIndex}
                          className="flex items-start py-1 group/feature"
                          style={{
                            animationDelay: `${featureIndex * 100 + 300}ms`,
                          }}
                        >
                          <div className="w-5 h-5 rounded-full bg-gradient-to-r from-planora-accent-purple/20 to-planora-accent-blue/20 flex items-center justify-center shrink-0 mt-0.5 group-hover/feature:from-planora-accent-purple/50 group-hover/feature:to-planora-accent-blue/50 transition-colors duration-300">
                            <CheckCircle className="w-3 h-3 text-planora-accent-purple group-hover/feature:text-white transition-colors duration-300" />
                          </div>
                          <span className="ml-3 text-white/80 group-hover/feature:text-white transition-colors duration-300">
                            {feature}
                          </span>
                        </div>
                      ))}

                      {tier.limitations?.map(
                        (limitation, limitationIndex) => (
                          <div
                            key={limitationIndex}
                            className="flex items-start py-1 text-white/50 group/limitation"
                            style={{
                              animationDelay: `${limitationIndex * 100 + 300}ms`,
                            }}
                          >
                            <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                              <XCircle className="w-3 h-3 text-white/30" />
                            </div>
                            <span className="ml-3">{limitation}</span>
                          </div>
                        ),
                      )}
                    </div>

                    <Button
                      variant={tier.highlighted ? "gradient" : "glass"}
                      className={`w-full group transition-all duration-300 ${
                        tier.highlighted
                          ? "shadow-lg shadow-planora-accent-purple/20 hover:shadow-planora-accent-purple/30"
                          : "border-white/10 hover:border-white/30"
                      }`}
                      onClick={onChatWithPlanora}
                    >
                      <span className="group-hover:mr-1 transition-all duration-300">
                        Get Started
                      </span>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all duration-300" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced enterprise CTA */}
        <div className="mt-20 text-center relative">
          <div className="max-w-2xl mx-auto bg-gradient-to-br from-black/60 to-planora-purple-dark/60 backdrop-blur-xl border border-white/10 rounded-xl p-8 shadow-lg relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-planora-accent-purple/10 blur-xl"></div>
            <div className="absolute -bottom-12 -left-12 w-24 h-24 rounded-full bg-planora-accent-blue/10 blur-xl"></div>

            <h3 className="text-2xl font-bold mb-3">
              Need a Custom Solution?
            </h3>
            <p className="text-white/80 mb-6 max-w-lg mx-auto">
              For teams, businesses, or specialized travel requirements, our
              custom plans offer tailored features and dedicated support.
            </p>

            <a href="mailto:support@planora.app">
              <Button
                variant="outline"
                className="border-white/20 hover:bg-white/5 hover:border-white/40 transition-all duration-300 group"
              >
                <Mail className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                <span>Contact Our Team</span>
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}; 