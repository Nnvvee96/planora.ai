import React, { Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/ui/organisms/Navigation";
import { getTravelCardsComponent } from "@/features/travel-planning/travelPlanningApi";
import { Footer } from "@/ui/organisms/Footer";
import {
  MessageCircle,
  ChevronRight,
  Sparkles,
  Star,
  Send,
  Plane,
  Shield,
} from "lucide-react";
import { Button } from "@/ui/atoms/Button";

// Import data from extracted files (these are now used in the extracted components)
// import { mockReviews } from "./data/mockReviews";
// import { pricingTiers } from "./data/pricingTiers";
// import { faqItems } from "./data/faqItems";

// Import extracted components
import { HeroSection } from "./components/HeroSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { PricingSection } from "./components/PricingSection";
import { TechnologySection } from "./components/TechnologySection";
import { FAQSection } from "./components/FAQSection";
import { UserStoriesSection } from "./components/UserStoriesSection";
import { CTASection } from "./components/CTASection";

// Import Swiper styles (now used in UserStoriesSection component)
// import "swiper/css";
// import "swiper/css/autoplay";

const LandingPage = () => {
  const navigate = useNavigate();

  // Get the TravelCards component using the factory function
  const TravelCards = getTravelCardsComponent();

  const handleChatWithPlanora = () => {
    navigate("/register");
  };

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

        {/* Grid pattern overlay - REMOVED */}
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header with Navigation */}
        <Navigation />

        {/* Hero Section - Modern Tech-Forward Design */}
        <HeroSection onChatWithPlanora={handleChatWithPlanora} />

        {/* Features Section - Enhanced Modern Design */}
        <FeaturesSection />

        {/* How It Works Section - Enhanced Modern Design */}
        <HowItWorksSection onChatWithPlanora={handleChatWithPlanora} />

        {/* Example Trips Section - Enhanced Modern Design */}
        <section
          id="examples"
          className="py-24 px-4 md:px-6 bg-black/30 backdrop-blur-lg relative overflow-hidden"
        >
          {/* Decorative background elements */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-planora-accent-purple/5 to-transparent opacity-20"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-planora-accent-blue/5 blur-3xl"></div>
            <div className="absolute top-1/3 -left-16 w-32 h-32 rounded-full bg-planora-accent-pink/10 blur-xl"></div>
          </div>

          {/* Tech pattern background */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCA2MCBNIDYwIDMwIEwgMzAgNjAgTSAzMCAwIEwgMCAzMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-10"></div>

          <div className="container mx-auto relative z-10">
            {/* Enhanced section header */}
            <div className="relative text-center mb-20 max-w-3xl mx-auto">
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-px h-12 bg-gradient-to-b from-planora-accent-purple/0 to-planora-accent-purple"></div>

              <h2 className="text-3xl md:text-5xl font-bold mb-6 relative inline-block">
                <span className="text-xl md:text-2xl text-planora-accent-purple/80 mb-2 block font-normal tracking-wider uppercase">
                  Experience
                </span>
                <span className="gradient-text">Popular Trip Ideas</span>
                <div className="absolute -bottom-4 left-0 w-full h-0.5 bg-gradient-to-r from-planora-accent-purple/0 via-planora-accent-purple to-planora-accent-purple/0"></div>
              </h2>

              <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                Explore destinations and itineraries tailored by our advanced AI
                system for optimal travel experiences.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16">
              {/* Left side - Destination Cards */}
              <div className="lg:col-span-3 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-planora-accent-purple/20 to-planora-accent-blue/10 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>

                <div className="relative bg-gradient-to-br from-black/60 to-planora-purple-dark/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl overflow-hidden">
                  {/* Decorative tech elements */}
                  <div className="absolute top-0 right-0 opacity-10">
                    <svg
                      width="120"
                      height="120"
                      viewBox="0 0 120 120"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M40 20C40 8.954 48.954 0 60 0C71.046 0 80 8.954 80 20V100C80 111.046 71.046 120 60 120C48.954 120 40 111.046 40 100V20Z"
                        fill="url(#paint0_linear)"
                      />
                      <path
                        d="M0 60C0 48.954 8.954 40 20 40H100C111.046 40 120 48.954 120 60C120 71.046 111.046 80 100 80H20C8.954 80 0 71.046 0 60Z"
                        fill="url(#paint1_linear)"
                      />
                      <defs>
                        <linearGradient
                          id="paint0_linear"
                          x1="60"
                          y1="0"
                          x2="60"
                          y2="120"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#8B5CF6" />
                          <stop
                            offset="1"
                            stopColor="#D946EF"
                            stopOpacity="0"
                          />
                        </linearGradient>
                        <linearGradient
                          id="paint1_linear"
                          x1="0"
                          y1="60"
                          x2="120"
                          y2="60"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#8B5CF6" />
                          <stop
                            offset="1"
                            stopColor="#D946EF"
                            stopOpacity="0"
                          />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-planora-accent-purple" />
                      Interactive AI Planning
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-planora-accent-pink animate-pulse"></div>
                      <span className="text-white/70 text-sm">Planora.ai</span>
                    </div>
                  </div>

                  {/* Modern chat interface */}
                  <div className="bg-gradient-to-br from-black/40 to-planora-purple-dark/40 rounded-xl p-5 border border-white/10 shadow-inner">
                    {/* User message 1 */}
                    <div className="flex items-start mb-4 animate-in fade-in duration-300">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 shadow-md">
                        <span className="text-white font-semibold">P</span>
                      </div>
                      <div className="ml-3 bg-white/5 backdrop-blur-md rounded-lg py-2.5 px-4 text-white/90 shadow-sm border border-white/5 max-w-[85%]">
                        Hi! I'd like to plan a trip to Japan for cherry blossom
                        season.
                      </div>
                    </div>

                    {/* AI response */}
                    <div
                      className="flex items-start mb-4 animate-in fade-in duration-300"
                      style={{ animationDelay: "400ms" }}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink flex items-center justify-center shrink-0 shadow-md">
                        <MessageCircle className="w-4 h-4 text-white" />
                      </div>
                      <div className="ml-3 bg-gradient-to-r from-planora-accent-purple/20 to-planora-accent-pink/10 backdrop-blur-md rounded-lg py-2.5 px-4 text-white shadow-sm border border-white/5 max-w-[85%]">
                        <p className="mb-2">
                          Great choice! Japan's cherry blossom season is
                          typically from late March to early April.
                        </p>
                        <p>
                          Would you prefer to focus on Tokyo, Kyoto, or a
                          multi-city experience?
                        </p>
                      </div>
                    </div>

                    {/* User message 2 */}
                    <div
                      className="flex items-start mb-4 animate-in fade-in duration-300"
                      style={{ animationDelay: "800ms" }}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 shadow-md">
                        <span className="text-white font-semibold">P</span>
                      </div>
                      <div className="ml-3 bg-white/5 backdrop-blur-md rounded-lg py-2.5 px-4 text-white/90 shadow-sm border border-white/5 max-w-[85%]">
                        I'd love to see multiple cities! Definitely Tokyo and
                        Kyoto, plus maybe somewhere less touristy?
                      </div>
                    </div>

                    {/* AI typing indicator */}
                    <div
                      className="flex items-start animate-in fade-in duration-300"
                      style={{ animationDelay: "1200ms" }}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink flex items-center justify-center shrink-0 shadow-md">
                        <MessageCircle className="w-4 h-4 text-white" />
                      </div>
                      <div className="ml-3 bg-gradient-to-r from-planora-accent-purple/10 to-planora-accent-pink/5 backdrop-blur-md rounded-lg py-2 px-4 text-white/90 shadow-sm border border-white/5">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-white/70 animate-pulse"></div>
                          <div
                            className="w-2 h-2 rounded-full bg-white/70 animate-pulse"
                            style={{ animationDelay: "300ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 rounded-full bg-white/70 animate-pulse"
                            style={{ animationDelay: "600ms" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modern chat input */}
                  <div className="mt-6 relative">
                    <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-1 flex items-center">
                      <input
                        type="text"
                        placeholder="Ask about a destination..."
                        className="bg-transparent border-none w-full py-2 px-3 text-white focus:outline-none text-sm"
                        readOnly
                        onClick={handleChatWithPlanora}
                      />
                      <Button
                        variant="gradient"
                        size="sm"
                        className="shrink-0"
                        onClick={handleChatWithPlanora}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* What Our Travelers Say - Modern testimonial card */}
              <div className="lg:col-span-2 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-planora-accent-pink/10 to-planora-accent-purple/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>

                <div className="relative bg-gradient-to-br from-black/60 to-planora-purple-dark/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl h-full flex flex-col">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 opacity-10">
                    <svg
                      width="120"
                      height="120"
                      viewBox="0 0 120 120"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M40 20C40 8.954 48.954 0 60 0C71.046 0 80 8.954 80 20V100C80 111.046 71.046 120 60 120C48.954 120 40 111.046 40 100V20Z"
                        fill="url(#paint0_linear)"
                      />
                      <path
                        d="M0 60C0 48.954 8.954 40 20 40H100C111.046 40 120 48.954 120 60C120 71.046 111.046 80 100 80H20C8.954 80 0 71.046 0 60Z"
                        fill="url(#paint1_linear)"
                      />
                      <defs>
                        <linearGradient
                          id="paint0_linear"
                          x1="60"
                          y1="0"
                          x2="60"
                          y2="120"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#8B5CF6" />
                          <stop
                            offset="1"
                            stopColor="#D946EF"
                            stopOpacity="0"
                          />
                        </linearGradient>
                        <linearGradient
                          id="paint1_linear"
                          x1="0"
                          y1="60"
                          x2="120"
                          y2="60"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#8B5CF6" />
                          <stop
                            offset="1"
                            stopColor="#D946EF"
                            stopOpacity="0"
                          />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Star className="w-5 h-5 text-planora-accent-pink" />
                    Traveler Stories
                  </h3>

                  <div className="flex-grow bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm rounded-xl p-6 border border-white/10 shadow-inner relative z-10">
                    {/* Quote marks */}
                    <div className="absolute -top-3 -left-2 text-planora-accent-purple/30 text-6xl font-serif">
                      "
                    </div>

                    <div className="flex items-center mb-4">
                      <div
                        className="w-12 h-12 rounded-full bg-cover bg-center shadow-md border border-white/20"
                        style={{
                          backgroundImage:
                            "url(https://images.unsplash.com/photo-1494790108377-be9c29b29330)",
                        }}
                      ></div>
                      <div className="ml-3">
                        <p className="font-medium text-white">Sarah Thompson</p>
                        <p className="text-sm text-white/60">
                          Travel Enthusiast
                        </p>
                      </div>
                    </div>

                    <blockquote className="text-white/90 italic mb-6 relative z-10">
                      I was skeptical about AI planning my vacation, but Planora
                      completely changed my mind. The app understood exactly
                      what I wanted and created the perfect balance of
                      activities and relaxation.
                    </blockquote>

                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className="w-5 h-5 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>

                    {/* Decorative dots */}
                    <div className="absolute bottom-3 right-3 flex space-x-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-planora-accent-purple opacity-40"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-planora-accent-pink opacity-40"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-planora-accent-blue opacity-40"></div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button
                      variant="glow"
                      className="w-full group border-white/20 bg-black/30 hover:bg-black/50 text-white flex items-center justify-center gap-1"
                      onClick={() => {
                        const el = document.getElementById("user-stories");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      Read More Stories
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Popular Destinations Showcase - Clean Implementation */}
            <div
              id="popular-destinations"
              className="mb-20 relative scroll-mt-20"
            >
              {/* Decorative tech elements */}
              <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-px h-16 bg-gradient-to-b from-planora-accent-purple/0 to-planora-accent-purple"></div>

              {/* Main section header */}
              <div className="text-center mb-12 relative">
                <h3 className="text-2xl md:text-3xl font-bold mb-4 relative inline-block">
                  <span className="gradient-text">Popular Destinations</span>
                  <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-planora-accent-purple/0 via-planora-accent-purple to-planora-accent-purple/0"></div>
                </h3>

                <p className="text-lg text-white/80 max-w-xl mx-auto">
                  Discover trending travel destinations curated for your
                  wanderlust
                </p>
              </div>

              {/* Optimized destinations layout - 2-column grid */}
              <div className="relative z-10 mx-auto max-w-7xl px-4">
                <div className="grid grid-cols-12 gap-6 mb-8">
                  {/* Left side - Destination Cards */}
                  <div className="col-span-12 lg:col-span-7 space-y-4">
                    {/* Styled header for Suggested Destinations */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-5 bg-planora-accent-purple rounded-full"></div>
                        <h4 className="text-xl font-medium text-white">
                          Suggested Destinations
                        </h4>
                      </div>
                      <button className="px-3 py-1 text-sm text-planora-accent-purple hover:text-planora-accent-blue transition-colors border border-planora-accent-purple/30 rounded-full hover:border-planora-accent-purple/60">
                        View All
                      </button>
                    </div>

                    {/* Destination cards container with custom styling to hide component's internal header */}
                    <div>
                      <Suspense
                        fallback={
                          <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className="bg-gradient-to-br from-black/70 to-planora-purple-dark/40 backdrop-blur-xl border border-white/10 rounded-xl animate-pulse shadow-lg h-24"
                              ></div>
                            ))}
                          </div>
                        }
                      >
                        {/* Hide the component's built-in header with CSS */}
                        <div className="[&>div>div:first-child]:hidden">
                          <TravelCards limit={3} />
                        </div>
                      </Suspense>
                    </div>
                  </div>

                  {/* Right side - Categories and filters */}
                  <div className="col-span-12 lg:col-span-5 space-y-6">
                    {/* Categories header with View All */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-5 bg-planora-accent-blue rounded-full"></div>
                        <h4 className="text-xl font-medium text-white">
                          Destination Types
                        </h4>
                      </div>
                      <button className="px-3 py-1 text-sm text-planora-accent-blue hover:text-planora-accent-purple transition-colors border border-planora-accent-blue/30 rounded-full hover:border-planora-accent-blue/60">
                        View All
                      </button>
                    </div>

                    {/* Trending Destinations */}
                    <div className="bg-gradient-to-br from-black/50 to-planora-purple-dark/30 backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-medium text-white flex items-center gap-2">
                          <Star className="w-4 h-4 text-planora-accent-purple" />
                          Trending Destinations
                        </h4>
                        <span className="text-xs px-2 py-1 bg-planora-accent-purple/20 text-planora-accent-purple rounded-full">
                          Hot
                        </span>
                      </div>
                      <div className="space-y-3">
                        {[
                          "Paris, France",
                          "Kyoto, Japan",
                          "Santorini, Greece",
                        ].map((destination, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0"
                          >
                            <span className="text-white/90">{destination}</span>
                            <div className="flex items-center gap-1 text-planora-accent-purple text-sm">
                              <span>Explore</span>
                              <ChevronRight className="w-3 h-3" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Budget-Friendly Options */}
                    <div className="bg-gradient-to-br from-black/50 to-planora-purple-dark/30 backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-medium text-white flex items-center gap-2">
                          <Shield className="w-4 h-4 text-planora-accent-blue" />
                          Budget-Friendly Options
                        </h4>
                        <span className="text-xs px-2 py-1 bg-planora-accent-blue/20 text-planora-accent-blue rounded-full">
                          Value
                        </span>
                      </div>
                      <div className="space-y-3">
                        {[
                          "Bangkok, Thailand",
                          "Lisbon, Portugal",
                          "Mexico City, Mexico",
                        ].map((destination, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0"
                          >
                            <span className="text-white/90">{destination}</span>
                            <div className="flex items-center gap-1 text-planora-accent-blue text-sm">
                              <span>Explore</span>
                              <ChevronRight className="w-3 h-3" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced single CTA */}
                <div className="text-center mb-8 mt-8">
                  <div className="mb-1">
                    <span className="inline-flex items-center text-sm text-white/70 gap-1.5 mb-6">
                      <Sparkles className="w-3.5 h-3.5 text-planora-accent-purple/80" />
                      Destinations personalized by AI based on global travel
                      trends
                    </span>
                  </div>

                  {/* Decorative line */}
                  <div className="relative w-px h-10 mx-auto my-6 bg-gradient-to-b from-planora-accent-purple/0 to-planora-accent-purple"></div>

                  <Button
                    variant="gradient"
                    className="px-10 py-5 text-xl border-white/20 hover:border-white/40 shadow-lg hover:shadow-planora-accent-purple/20 transition-all duration-300 group"
                    size="lg"
                    onClick={handleChatWithPlanora}
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Start Planning Your Journey</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <PricingSection onChatWithPlanora={handleChatWithPlanora} />

        {/* Technology Section */}
        <TechnologySection />

        {/* FAQ Section */}
        <FAQSection />

        {/* User Stories Section */}
        <UserStoriesSection />

        {/* CTA Section */}
        <CTASection onChatWithPlanora={handleChatWithPlanora} />

        {/* Remove the standalone Newsletter Section as it's now inside the CTA */}
      </div>

      {/* Footer - with proper visibility */}
      <div className="relative z-10 bg-planora-purple-dark">
        <Footer />
      </div>
    </div>
  );
};

export { LandingPage };
