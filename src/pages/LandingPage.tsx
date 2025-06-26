import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/ui/organisms/Navigation';
import { getTravelCardsComponent } from '@/features/travel-planning/travelPlanningApi';
import { Footer } from '@/ui/organisms/Footer';
import { XCircle } from 'lucide-react';
import { 
  MessageCircle, 
  Calendar, 
  UserPlus, 
  Globe, 
  RefreshCcw, 
  Users,
  Zap,
  Clock,
  Shield,
  Code,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  Sparkles,
  Star,
  Send,
  Plane,
  Mail
} from 'lucide-react';
import { Button } from "@/ui/atoms/Button";
import { ReviewCard, ReviewCardProps } from '@/ui/organisms/ReviewCard'; 
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules'; 
import { VanillaEarthScene } from '@/ui/organisms/VanillaEarthScene';
// import 'swiper/css/pagination';
// import 'swiper/css/navigation'; // Ensure navigation CSS is also removed/commented
import 'swiper/css';
import { Input } from '@/ui/atoms/Input';

// Define a type for the review data including id, extending ReviewCardProps
interface ReviewData extends ReviewCardProps {
  id: string;
}

const mockReviews: ReviewData[] = [
  {
    id: '1',
    authorName: 'Sarah L.',
    authorAvatarUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
    rating: 5,
    reviewText: "Planora made my Euro trip planning a breeze! I discovered so many hidden gems I wouldn't have found otherwise. The itinerary was perfectly paced.",
    date: 'June 2024',
    source: 'Planora App'
  },
  {
    id: '2',
    authorName: 'Mike P.',
    authorAvatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 4,
    reviewText: 'Really intuitive and helpful for organizing complex trips. Saved me hours of research. The collaboration feature is a plus for group travel!',
    date: 'May 2024',
    source: 'Google Play'
  },
  {
    id: '3',
    authorName: 'Jessica Chen',
    rating: 5,
    reviewText: "I used to dread planning vacations, but Planora actually made it fun! The AI suggestions were spot on. Highly recommend this app.",
    date: 'May 2024',
    source: 'App Store'
  },
  {
    id: '4',
    authorName: 'David K.',
    authorAvatarUrl: 'https://randomuser.me/api/portraits/men/45.jpg',
    rating: 4,
    reviewText: "A solid travel planner with a sleek interface. The offline maps were a lifesaver during my trip. Would love to see more direct booking integrations.",
    date: 'April 2024',
    source: 'Planora App'
  },
  {
    id: '5',
    authorName: 'Emily R.',
    authorAvatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 5,
    reviewText: "Absolutely essential for anyone who loves to travel but hates the hassle of planning. My go-to app for all my adventures now!",
    date: 'April 2024',
    source: 'Google Play'
  },
  {
    id: '6',
    authorName: 'Tom B.',
    rating: 4,
    reviewText: "Great for discovering new destinations and activities. The budget tracker is also a nice touch. Overall, a very useful tool for travelers.",
    date: 'March 2024',
    source: 'App Store'
  }
];

const LandingPage = () => {
  const navigate = useNavigate();
  
  // Get the TravelCards component using the factory function
  const TravelCards = getTravelCardsComponent();
  
  const handleChatWithPlanora = () => {
    navigate('/register');
  };

  // Pricing tiers
  const pricingTiers = [
    {
      name: 'Basic',
      price: 'Free',
      description: 'Perfect for casual travelers',
      features: [
        'AI-powered trip suggestions',
        'Basic itinerary planning',
        'Limited conversation history',
        'Email support'
      ],
      limitations: [
        'Limited to 3 trips per month',
        'No group planning features',
        'Basic recommendations only'
      ],
      highlighted: false
    },
    {
      name: 'Explorer',
      price: '$9.99',
      period: 'per month',
      description: 'For frequent travelers',
      features: [
        'Unlimited trip planning',
        'Advanced destination insights',
        'Extended conversation history',
        'Group trip coordination',
        'Priority support'
      ],
      limitations: [],
      highlighted: true
    },
    {
      name: 'Voyager',
      price: '$19.99',
      period: 'per month',
      description: 'For travel enthusiasts',
      features: [
        'All Explorer features',
        'Premium destination insights',
        'Unlimited conversation history',
        'Advanced group coordination',
        'Concierge support',
        'Custom travel persona'
      ],
      limitations: [],
      highlighted: false
    }
  ];

  // FAQ items
  const faqItems = [
    {
      question: 'How does Planora.ai work?',
      answer: 'Planora.ai uses advanced AI to understand your travel preferences through natural conversation. It then searches and filters through thousands of options to create personalized recommendations tailored to your needs, preferences, and budget.'
    },
    {
      question: 'Is my personal information secure?',
      answer: 'Yes, we take data security seriously. All your personal information is encrypted and stored securely. We never share your data with third parties without your explicit consent.'
    },
    {
      question: 'Can I use Planora.ai for group trips?',
      answer: 'Absolutely! Planora.ai excels at coordinating group trips. It can harmonize different preferences, budgets, and availability to create travel plans that work for everyone in your group.'
    },
    {
      question: 'How accurate are the travel recommendations?',
      answer: 'Planora.ai sources real-time data from trusted travel partners to ensure accurate and up-to-date recommendations. Our AI continuously improves based on user feedback and travel trends.'
    },
    {
      question: 'Can I book trips directly through Planora.ai?',
      answer: 'Currently, Planora.ai provides recommendations and planning assistance. For bookings, we connect you directly to our trusted travel partners where you can complete your reservation.'
    }
  ];

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
        <section id="hero" className="min-h-screen flex items-center py-12 md:py-24 px-4 md:px-6 relative overflow-hidden">
          {/* Tech-inspired background elements */}
          <div className="absolute inset-0 z-0">
            {/* Digital grid pattern - REMOVED */}
            
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
                  animationDuration: `${15 + Math.random() * 10}s`
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
                  <span className="text-white">With <span className="text-planora-accent-blue font-extrabold">Planora.ai</span></span>
                </h1>
                <p className="text-lg md:text-xl text-planora-purple-light mb-8 max-w-lg mx-auto lg:mx-0">
                  Your intelligent travel companion that crafts personalized journeys in minutes. Say goodbye to planning stress and hello to your next adventure.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button 
                    variant="gradient" 
                    size="lg" 
                    className="flex items-center gap-2"
                    onClick={handleChatWithPlanora}
                  >
                    <Zap className="w-5 h-5" />
                    Start Planning for Free
                  </Button>
                  <Button 
                    variant="glass" 
                    size="lg" 
                    className="flex items-center gap-2"
                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Learn More
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              
              {/* Right column - 3D Earth Visualization */}
              <div className="order-1 lg:order-2 h-[400px] md:h-[600px] lg:h-full w-full">
                <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-white">Loading 3D Experience...</div>}>
                  <VanillaEarthScene />
                </Suspense>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section - Enhanced Modern Design */}
        <section id="features" className="py-24 px-4 md:px-6 bg-gradient-to-b from-planora-purple-dark/50 via-planora-purple-dark to-planora-purple-dark/80 relative overflow-hidden">
          {/* Tech pattern background */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCA2MCBNIDYwIDMwIEwgMzAgNjAgTSAzMCAwIEwgMCAzMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
          
          <div className="container mx-auto relative z-10">
            {/* Enhanced section header with decorative elements */}
            <div className="relative text-center mb-20 max-w-3xl mx-auto">
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-planora-accent-purple/0 via-planora-accent-purple to-planora-accent-purple/0"></div>
              
              <h2 className="text-3xl md:text-5xl font-bold mb-6 flex flex-col items-center">
                <span className="text-xl md:text-2xl text-planora-accent-purple/80 mb-2 font-normal tracking-wider uppercase">Why Choose</span>
                <span className="gradient-text">Planora.ai</span>
              </h2>
              
              <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                Our intelligent travel assistant makes planning your trips effortless, personalized, and enjoyable with cutting-edge AI technology.
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
                  
                  <h3 className="text-xl font-bold mb-3 group-hover:text-planora-accent-purple transition-colors duration-300">Natural Conversation</h3>
                  <p className="text-white/70 leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                    Chat naturally about your travel preferences and let our AI understand your needs without filling out complex forms.
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
                  
                  <h3 className="text-xl font-bold mb-3 group-hover:text-planora-accent-pink transition-colors duration-300">Group Planning</h3>
                  <p className="text-white/70 leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                    Coordinate trips with friends and family by integrating everyone's preferences into a harmonious travel plan.
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
                  
                  <h3 className="text-xl font-bold mb-3 group-hover:text-planora-accent-blue transition-colors duration-300">Smart Scheduling</h3>
                  <p className="text-white/70 leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                    Our AI optimizes your itinerary to maximize experiences while respecting your pace and preferences.
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
                  
                  <h3 className="text-xl font-bold mb-3 group-hover:text-planora-accent-purple transition-colors duration-300">Destination Insights</h3>
                  <p className="text-white/70 leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                    Get personalized recommendations based on your interests, budget, and travel style.
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
                  
                  <h3 className="text-xl font-bold mb-3 group-hover:text-planora-accent-pink transition-colors duration-300">Real-Time Adaptation</h3>
                  <p className="text-white/70 leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                    Plans change? Our AI adapts your itinerary on the fly based on new information or preferences.
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
                  
                  <h3 className="text-xl font-bold mb-3 group-hover:text-planora-accent-blue transition-colors duration-300">Personalized For You</h3>
                  <p className="text-white/70 leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                    The more you use Planora, the better it understands your preferences for more tailored recommendations.
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
        
        {/* How It Works Section - Enhanced Modern Design */}
        <section id="how-it-works" className="py-24 px-4 md:px-6 bg-black/30 backdrop-blur-lg relative overflow-hidden">
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
                Experience a new way of planning travel through AI-powered conversations and intelligent recommendations.
              </p>
            </div>
            
            {/* Enhanced step cards with modern styling */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 max-w-6xl mx-auto relative z-10">
              {/* Step 1 Card */}
              <div className="group bg-gradient-to-br from-black/60 to-planora-purple-dark/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center relative shadow-lg transition-all duration-300 hover:shadow-planora-accent-purple/20 hover:border-planora-accent-purple/30 hover:-translate-y-1">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink flex items-center justify-center text-white font-bold shadow-lg shadow-planora-accent-purple/20 group-hover:shadow-planora-accent-purple/40 transition-all duration-300">1</div>
                
                <div className="bg-planora-accent-purple/10 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-8 w-8 text-planora-accent-purple group-hover:text-white transition-colors duration-300" />
                </div>
                
                <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-planora-accent-purple transition-colors duration-300">Chat Naturally</h3>
                
                <p className="text-white/80 leading-relaxed group-hover:text-white transition-colors duration-300">
                  Tell Planora about your travel preferences, interests, and constraints through simple, natural conversation.
                </p>
              </div>
              
              {/* Step 2 Card */}
              <div className="group bg-gradient-to-br from-black/60 to-planora-purple-dark/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center relative shadow-lg transition-all duration-300 hover:shadow-planora-accent-blue/20 hover:border-planora-accent-blue/30 hover:-translate-y-1 md:translate-y-8">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-planora-accent-blue to-planora-accent-purple flex items-center justify-center text-white font-bold shadow-lg shadow-planora-accent-blue/20 group-hover:shadow-planora-accent-blue/40 transition-all duration-300">2</div>
                
                <div className="bg-planora-accent-blue/10 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-8 w-8 text-planora-accent-blue group-hover:text-white transition-colors duration-300" />
                </div>
                
                <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-planora-accent-blue transition-colors duration-300">Get Personalized Plans</h3>
                
                <p className="text-white/80 leading-relaxed group-hover:text-white transition-colors duration-300">
                  Our AI analyzes thousands of options to create custom travel plans based on your preferences, budget, and schedule.
                </p>
              </div>
              
              {/* Step 3 Card */}
              <div className="group bg-gradient-to-br from-black/60 to-planora-purple-dark/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center relative shadow-lg transition-all duration-300 hover:shadow-planora-accent-pink/20 hover:border-planora-accent-pink/30 hover:-translate-y-1">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-planora-accent-pink to-planora-accent-purple flex items-center justify-center text-white font-bold shadow-lg shadow-planora-accent-pink/20 group-hover:shadow-planora-accent-pink/40 transition-all duration-300">3</div>
                
                <div className="bg-planora-accent-pink/10 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-8 w-8 text-planora-accent-pink group-hover:text-white transition-colors duration-300" />
                </div>
                
                <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-planora-accent-pink transition-colors duration-300">Refine & Confirm</h3>
                
                <p className="text-white/80 leading-relaxed group-hover:text-white transition-colors duration-300">
                  Review your personalized itinerary, make adjustments through conversation, and confirm your perfect travel plans.
                </p>
              </div>
            </div>
            
            {/* Enhanced CTA area */}
            <div className="mt-20 text-center relative">
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-px h-10 bg-gradient-to-t from-planora-accent-purple/0 to-planora-accent-purple"></div>
              
              <Button variant="gradient" 
                size="lg" 
                className="text-lg flex items-center gap-2 mx-auto px-8 py-6 shadow-xl shadow-planora-accent-purple/20 hover:shadow-planora-accent-purple/30 transition-all duration-300 group" 
                onClick={handleChatWithPlanora}
              >
                <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                <span className="group-hover:translate-x-1 transition-transform duration-300">Start Planning Now</span>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Example Trips Section - Enhanced Modern Design */}
        <section id="examples" className="py-24 px-4 md:px-6 bg-black/30 backdrop-blur-lg relative overflow-hidden">
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
                <span className="text-xl md:text-2xl text-planora-accent-purple/80 mb-2 block font-normal tracking-wider uppercase">Experience</span>
                <span className="gradient-text">Popular Trip Ideas</span>
                <div className="absolute -bottom-4 left-0 w-full h-0.5 bg-gradient-to-r from-planora-accent-purple/0 via-planora-accent-purple to-planora-accent-purple/0"></div>
              </h2>
              
              <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                Explore destinations and itineraries tailored by our advanced AI system for optimal travel experiences.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16">
              {/* Left side - Destination Cards */}
              <div className="lg:col-span-3 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-planora-accent-purple/20 to-planora-accent-blue/10 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
                
                <div className="relative bg-gradient-to-br from-black/60 to-planora-purple-dark/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl overflow-hidden">
                  {/* Decorative tech elements */}
                  <div className="absolute top-0 right-0 opacity-10">
                    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M40 20C40 8.954 48.954 0 60 0C71.046 0 80 8.954 80 20V100C80 111.046 71.046 120 60 120C48.954 120 40 111.046 40 100V20Z" fill="url(#paint0_linear)"/>
                      <path d="M0 60C0 48.954 8.954 40 20 40H100C111.046 40 120 48.954 120 60C120 71.046 111.046 80 100 80H20C8.954 80 0 71.046 0 60Z" fill="url(#paint1_linear)"/>
                      <defs>
                        <linearGradient id="paint0_linear" x1="60" y1="0" x2="60" y2="120" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#8B5CF6"/>
                          <stop offset="1" stopColor="#D946EF" stopOpacity="0"/>
                        </linearGradient>
                        <linearGradient id="paint1_linear" x1="0" y1="60" x2="120" y2="60" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#8B5CF6"/>
                          <stop offset="1" stopColor="#D946EF" stopOpacity="0"/>
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
                        Hi! I'd like to plan a trip to Japan for cherry blossom season.
                      </div>
                    </div>
                    
                    {/* AI response */}
                    <div className="flex items-start mb-4 animate-in fade-in duration-300" style={{animationDelay: '400ms'}}>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink flex items-center justify-center shrink-0 shadow-md">
                        <MessageCircle className="w-4 h-4 text-white" />
                      </div>
                      <div className="ml-3 bg-gradient-to-r from-planora-accent-purple/20 to-planora-accent-pink/10 backdrop-blur-md rounded-lg py-2.5 px-4 text-white shadow-sm border border-white/5 max-w-[85%]">
                        <p className="mb-2">Great choice! Japan's cherry blossom season is typically from late March to early April.</p>
                        <p>Would you prefer to focus on Tokyo, Kyoto, or a multi-city experience?</p>
                      </div>
                    </div>
                    
                    {/* User message 2 */}
                    <div className="flex items-start mb-4 animate-in fade-in duration-300" style={{animationDelay: '800ms'}}>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 shadow-md">
                        <span className="text-white font-semibold">P</span>
                      </div>
                      <div className="ml-3 bg-white/5 backdrop-blur-md rounded-lg py-2.5 px-4 text-white/90 shadow-sm border border-white/5 max-w-[85%]">
                        I'd love to see multiple cities! Definitely Tokyo and Kyoto, plus maybe somewhere less touristy?
                      </div>
                    </div>
                    
                    {/* AI typing indicator */}
                    <div className="flex items-start animate-in fade-in duration-300" style={{animationDelay: '1200ms'}}>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink flex items-center justify-center shrink-0 shadow-md">
                        <MessageCircle className="w-4 h-4 text-white" />
                      </div>
                      <div className="ml-3 bg-gradient-to-r from-planora-accent-purple/10 to-planora-accent-pink/5 backdrop-blur-md rounded-lg py-2 px-4 text-white/90 shadow-sm border border-white/5">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-white/70 animate-pulse"></div>
                          <div className="w-2 h-2 rounded-full bg-white/70 animate-pulse" style={{animationDelay: '300ms'}}></div>
                          <div className="w-2 h-2 rounded-full bg-white/70 animate-pulse" style={{animationDelay: '600ms'}}></div>
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
                    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M40 20C40 8.954 48.954 0 60 0C71.046 0 80 8.954 80 20V100C80 111.046 71.046 120 60 120C48.954 120 40 111.046 40 100V20Z" fill="url(#paint0_linear)"/>
                      <path d="M0 60C0 48.954 8.954 40 20 40H100C111.046 40 120 48.954 120 60C120 71.046 111.046 80 100 80H20C8.954 80 0 71.046 0 60Z" fill="url(#paint1_linear)"/>
                      <defs>
                        <linearGradient id="paint0_linear" x1="60" y1="0" x2="60" y2="120" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#8B5CF6"/>
                          <stop offset="1" stopColor="#D946EF" stopOpacity="0"/>
                        </linearGradient>
                        <linearGradient id="paint1_linear" x1="0" y1="60" x2="120" y2="60" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#8B5CF6"/>
                          <stop offset="1" stopColor="#D946EF" stopOpacity="0"/>
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
                    <div className="absolute -top-3 -left-2 text-planora-accent-purple/30 text-6xl font-serif">"</div>
                    
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-cover bg-center shadow-md border border-white/20" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1494790108377-be9c29b29330)'}}></div>
                      <div className="ml-3">
                        <p className="font-medium text-white">Sarah Thompson</p>
                        <p className="text-sm text-white/60">Travel Enthusiast</p>
                      </div>
                    </div>
                    
                    <blockquote className="text-white/90 italic mb-6 relative z-10">
                      I was skeptical about AI planning my vacation, but Planora completely changed my mind. The app understood exactly what I wanted and created the perfect balance of activities and relaxation.
                    </blockquote>
                    
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
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
                      onClick={() => { const el = document.getElementById('user-stories'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
                    >
                      Read More Stories
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Popular Destinations Showcase - Clean Implementation */}
            <div id="popular-destinations" className="mb-20 relative scroll-mt-20">
              {/* Decorative tech elements */}
              <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-px h-16 bg-gradient-to-b from-planora-accent-purple/0 to-planora-accent-purple"></div>
              
              {/* Main section header */}
              <div className="text-center mb-12 relative">
                <h3 className="text-2xl md:text-3xl font-bold mb-4 relative inline-block">
                  <span className="gradient-text">Popular Destinations</span>
                  <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-planora-accent-purple/0 via-planora-accent-purple to-planora-accent-purple/0"></div>
                </h3>
                
                <p className="text-lg text-white/80 max-w-xl mx-auto">
                  Discover trending travel destinations curated for your wanderlust
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
                        <h4 className="text-xl font-medium text-white">Suggested Destinations</h4>
                      </div>
                      <button className="px-3 py-1 text-sm text-planora-accent-purple hover:text-planora-accent-blue transition-colors border border-planora-accent-purple/30 rounded-full hover:border-planora-accent-purple/60">
                        View All
                      </button>
                    </div>
                    
                    {/* Destination cards container with custom styling to hide component's internal header */}
                    <div>
                      <Suspense fallback={
                        <div className="space-y-4">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="bg-gradient-to-br from-black/70 to-planora-purple-dark/40 backdrop-blur-xl border border-white/10 rounded-xl animate-pulse shadow-lg h-24"></div>
                          ))}
                        </div>
                      }>
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
                        <h4 className="text-xl font-medium text-white">Destination Types</h4>
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
                        <span className="text-xs px-2 py-1 bg-planora-accent-purple/20 text-planora-accent-purple rounded-full">Hot</span>
                      </div>
                      <div className="space-y-3">
                        {['Paris, France', 'Kyoto, Japan', 'Santorini, Greece'].map((destination, index) => (
                          <div key={index} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
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
                        <span className="text-xs px-2 py-1 bg-planora-accent-blue/20 text-planora-accent-blue rounded-full">Value</span>
                      </div>
                      <div className="space-y-3">
                        {['Bangkok, Thailand', 'Lisbon, Portugal', 'Mexico City, Mexico'].map((destination, index) => (
                          <div key={index} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
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
                      Destinations personalized by AI based on global travel trends
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
        <section id="pricing" className="py-24 px-4 md:px-6 bg-black/30 backdrop-blur-lg relative overflow-hidden">
          {/* Tech-inspired background elements */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 right-0 w-full h-[600px] bg-gradient-to-b from-planora-accent-blue/5 to-transparent opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-planora-accent-purple/5 blur-3xl"></div>
            
            {/* Decorative circuit-like patterns */}
            <div className="absolute left-0 top-1/3 w-32 h-full opacity-10">
              <svg width="100%" height="100%" viewBox="0 0 200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 0V200H100V400H180V600H50V800" stroke="url(#pricing-line-gradient)" strokeWidth="2" strokeDasharray="6 6"/>
                <circle cx="10" cy="200" r="6" fill="#8B5CF6"/>
                <circle cx="100" cy="400" r="6" fill="#1EAEDB"/>
                <circle cx="180" cy="600" r="6" fill="#D946EF"/>
                <defs>
                  <linearGradient id="pricing-line-gradient" x1="0" y1="0" x2="0" y2="800" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#8B5CF6"/>
                    <stop offset="0.5" stopColor="#1EAEDB"/>
                    <stop offset="1" stopColor="#D946EF"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            <div className="absolute right-0 top-1/2 w-32 h-full opacity-10">
              <svg width="100%" height="100%" viewBox="0 0 200 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M190 0V150H100V300H20V450H150V600" stroke="url(#pricing-line-gradient-2)" strokeWidth="2" strokeDasharray="6 6"/>
                <circle cx="190" cy="150" r="6" fill="#D946EF"/>
                <circle cx="100" cy="300" r="6" fill="#8B5CF6"/>
                <circle cx="20" cy="450" r="6" fill="#1EAEDB"/>
                <defs>
                  <linearGradient id="pricing-line-gradient-2" x1="0" y1="0" x2="0" y2="600" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#D946EF"/>
                    <stop offset="0.5" stopColor="#8B5CF6"/>
                    <stop offset="1" stopColor="#1EAEDB"/>
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
                <span className="text-xl md:text-2xl text-planora-accent-purple/80 mb-2 block font-normal tracking-wider uppercase">Flexible</span>
                <span className="gradient-text">Pricing Plans</span>
                <div className="absolute -bottom-4 left-0 w-full h-0.5 bg-gradient-to-r from-planora-accent-purple/0 via-planora-accent-purple to-planora-accent-purple/0"></div>
              </h2>
              
              <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                Choose the plan that perfectly aligns with your travel needs and preferences. All plans include our AI-powered planning assistant.
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
                    style={{animationDelay: `${animationDelay}ms`}}
                  >
                    {/* Background glow effect */}
                    <div 
                      className={`absolute inset-0 rounded-2xl blur-xl opacity-30 group-hover:opacity-70 transition-opacity duration-300 ${tier.highlighted 
                        ? 'bg-gradient-to-r from-planora-accent-purple/40 to-planora-accent-pink/40' 
                        : 'bg-white/5'}`}
                    ></div>
                    
                    <div 
                      className={`relative h-full bg-gradient-to-br from-black/70 to-planora-purple-dark/40 backdrop-blur-xl border rounded-2xl overflow-hidden shadow-lg ${tier.highlighted 
                        ? 'border-planora-accent-purple shadow-planora-accent-purple/20' 
                        : 'border-white/10 group-hover:border-white/20'}`}
                    >
                      {tier.highlighted && (
                        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink p-1 text-white text-xs font-bold text-center tracking-wider">
                          MOST POPULAR
                        </div>
                      )}
                      
                      <div className="p-8">
                        {/* Decorative icon based on plan */}
                        <div className={`w-12 h-12 rounded-full mb-6 flex items-center justify-center ${tier.highlighted 
                          ? 'bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink' 
                          : 'bg-white/10'}`}
                        >
                          {index === 0 && <Globe className="w-6 h-6 text-white" />}
                          {index === 1 && <Plane className="w-6 h-6 text-white" />}
                          {index === 2 && <Star className="w-6 h-6 text-white" />}
                        </div>
                        
                        <h3 className="text-2xl font-bold mb-2 group-hover:text-planora-accent-purple transition-colors duration-300">{tier.name}</h3>
                        <p className="text-white/70 mb-6 leading-relaxed">{tier.description}</p>
                        
                        <div className="mb-8">
                          <span className="text-4xl font-bold">{tier.price}</span>
                          {tier.period && <span className="text-white/70 ml-1">/{tier.period}</span>}
                        </div>
                        
                        <div className="space-y-4 mb-8">
                          {tier.features.map((feature, featureIndex) => (
                            <div 
                              key={featureIndex} 
                              className="flex items-start py-1 group/feature"
                              style={{animationDelay: `${featureIndex * 100 + 300}ms`}}
                            >
                              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-planora-accent-purple/20 to-planora-accent-blue/20 flex items-center justify-center shrink-0 mt-0.5 group-hover/feature:from-planora-accent-purple/50 group-hover/feature:to-planora-accent-blue/50 transition-colors duration-300">
                                <CheckCircle className="w-3 h-3 text-planora-accent-purple group-hover/feature:text-white transition-colors duration-300" />
                              </div>
                              <span className="ml-3 text-white/80 group-hover/feature:text-white transition-colors duration-300">{feature}</span>
                            </div>
                          ))}
                          
                          {tier.limitations?.map((limitation, limitationIndex) => (
                            <div 
                              key={limitationIndex} 
                              className="flex items-start py-1 text-white/50 group/limitation"
                              style={{animationDelay: `${limitationIndex * 100 + 300}ms`}}
                            >
                              <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                                <XCircle className="w-3 h-3 text-white/30" />
                              </div>
                              <span className="ml-3">{limitation}</span>
                            </div>
                          ))}
                        </div>
                        
                        <Button
                          variant={tier.highlighted ? "gradient" : "glass"} 
                          className={`w-full group transition-all duration-300 ${tier.highlighted 
                            ? 'shadow-lg shadow-planora-accent-purple/20 hover:shadow-planora-accent-purple/30' 
                            : 'border-white/10 hover:border-white/30'}`}
                          onClick={handleChatWithPlanora}
                        >
                          <span className="group-hover:mr-1 transition-all duration-300">Get Started</span>
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
                
                <h3 className="text-2xl font-bold mb-3">Need a Custom Solution?</h3>
                <p className="text-white/80 mb-6 max-w-lg mx-auto">
                  For teams, businesses, or specialized travel requirements, our custom plans offer tailored features and dedicated support.
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
        
        {/* Technology Section - Enhanced Modern Design */}
        <section id="tech" className="py-24 px-4 md:px-6 bg-black/30 backdrop-blur-lg relative overflow-hidden">
          {/* Tech-inspired background elements */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-planora-accent-blue/5 to-transparent opacity-20"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-planora-accent-purple/5 blur-3xl"></div>
            
            {/* Tech grid pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCA2MCBNIDYwIDMwIEwgMzAgNjAgTSAzMCAwIEwgMCAzMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-10"></div>
            
            {/* Decorative circuit patterns */}
            <div className="absolute right-10 top-20 w-32 h-32 opacity-10">
              <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 10H50V50H90" stroke="url(#tech-gradient)" strokeWidth="2" strokeDasharray="4 4"/>
                <circle cx="10" cy="10" r="4" fill="#8B5CF6"/>
                <circle cx="50" cy="50" r="4" fill="#1EAEDB"/>
                <circle cx="90" cy="50" r="4" fill="#D946EF"/>
                <defs>
                  <linearGradient id="tech-gradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#8B5CF6"/>
                    <stop offset="0.5" stopColor="#1EAEDB"/>
                    <stop offset="1" stopColor="#D946EF"/>
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
                Our platform leverages cutting-edge technology to create personalized travel experiences.  
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
                  
                  <h3 className="text-xl font-bold mb-3 group-hover:text-planora-accent-purple transition-colors duration-300">Natural Language Processing</h3>
                  <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                    Our AI understands your travel preferences through natural conversation.
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
                  
                  <h3 className="text-xl font-bold mb-3 group-hover:text-planora-accent-blue transition-colors duration-300">Destination Database</h3>
                  <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                    Comprehensive information on thousands of destinations worldwide.
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
                  
                  <h3 className="text-xl font-bold mb-3 group-hover:text-planora-accent-pink transition-colors duration-300">Personalized Recommendations</h3>
                  <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                    Our system learns from your interactions to provide better recommendations.
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
                  
                  <h3 className="text-xl font-bold mb-3 group-hover:text-planora-accent-green transition-colors duration-300">Secure Platform</h3>
                  <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                    Enterprise-grade security protecting your personal information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* FAQ Section - Enhanced Modern Design */}
        <section id="faq" className="py-24 px-4 md:px-6 relative overflow-hidden">
          {/* Tech-inspired background elements */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-lg"></div>
            <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-planora-accent-blue/5 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-planora-accent-purple/5 blur-3xl"></div>
            
            {/* Tech grid pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCA2MCBNIDYwIDMwIEwgMzAgNjAgTSAzMCAwIEwgMCAzMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-10"></div>
            
            {/* Decorative circuit patterns */}
            <div className="absolute left-10 bottom-20 w-48 h-48 opacity-10">
              <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 90H50V50H90" stroke="url(#faq-gradient)" strokeWidth="2" strokeDasharray="4 4"/>
                <circle cx="10" cy="90" r="4" fill="#8B5CF6"/>
                <circle cx="50" cy="50" r="4" fill="#1EAEDB"/>
                <circle cx="90" cy="50" r="4" fill="#D946EF"/>
                <defs>
                  <linearGradient id="faq-gradient" x1="0" y1="100" x2="100" y2="0" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#8B5CF6"/>
                    <stop offset="0.5" stopColor="#1EAEDB"/>
                    <stop offset="1" stopColor="#D946EF"/>
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
                <div key={index} className="group relative transform transition-all duration-300 hover:translate-x-1">
                  <div className="absolute inset-0 rounded-xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300 bg-gradient-to-r from-planora-accent-purple/30 to-planora-accent-blue/30"></div>
                  
                  <div className="relative bg-gradient-to-br from-black/60 to-planora-purple-dark/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-lg p-6 group-hover:border-white/20 transition-all duration-300">
                    <h3 className="text-xl font-bold mb-3 group-hover:text-planora-accent-blue transition-colors duration-300">{item.question}</h3>
                    <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">{item.answer}</p>
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
                <p className="mb-6 text-white/80 text-lg">Have more questions that aren't answered here?</p>
                <Button 
                  onClick={() => navigate('/support')} 
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

        {/* User Stories Section Placeholder */}
        <section id="user-stories" className="py-16 md:py-24 bg-black/30 backdrop-blur-lg relative overflow-hidden text-white">
          {/* Tech-inspired background elements (simplified from pricing) */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 right-0 w-full h-[400px] bg-gradient-to-b from-planora-accent-blue/5 to-transparent opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-planora-accent-purple/5 blur-3xl"></div>
          </div>

          {/* Content container needs to be relative and have a z-index to sit above the background elements */}
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">Hear From Our Travelers</h2>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-12">
              Discover how Planora has transformed their travel planning experience.
            </p>
            {/* Swiper Carousel */}
            <div className="max-w-5xl mx-auto">
              <Swiper
                modules={[Autoplay]} 
                spaceBetween={30}
                slidesPerView={1}
                loop={true}
                autoplay={{
                  delay: 1, // Set delay to a very small number for continuous effect
                  disableOnInteraction: true, // Pauses on interaction
                }}
                // pagination={{ clickable: true }} // Optional: adds dots for pagination
                // navigation={true} // Optional: adds prev/next arrows
                breakpoints={{
                  // when window width is >= 768px
                  768: {
                    slidesPerView: 2,
                    spaceBetween: 30
                  },
                  // when window width is >= 1024px
                  1024: {
                    slidesPerView: 3,
                    spaceBetween: 40
                  }
                }}
                speed={8000} // Set a long transition speed (in ms)
                // className="pb-12" // Pagination is off, so remove padding
              >
                {mockReviews.map((review) => {
                  const { id, ...reviewProps } = review; // Destructure id
                  return (
                    <SwiperSlide key={id}>
                      <ReviewCard {...reviewProps} /> {/* Pass remaining props */}
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
            <div className="mt-12">
              <Button variant="outline" size="lg" onClick={() => navigate('/reviews')} className="border-white/30 hover:border-white/60 hover:bg-white/10">
                View All Reviews
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section - Enhanced Modern Design */}
        <section id="cta" className="relative py-24 px-4 md:px-6 overflow-hidden">
          {/* Tech-inspired background elements */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-xl"></div>
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] rounded-full bg-planora-accent-purple/10 blur-3xl"></div>
            <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-planora-accent-blue/10 blur-3xl"></div>
            
            {/* Tech grid pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCA2MCBNIDYwIDMwIEwgMzAgNjAgTSAzMCAwIEwgMCAzMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-10"></div>
            
            {/* Animated particles */}
            <div className="absolute inset-0 overflow-hidden opacity-30">
              <div className="absolute w-2 h-2 bg-planora-accent-blue rounded-full top-1/4 left-1/3 animate-pulse" style={{animationDuration: '3s'}}></div>
              <div className="absolute w-3 h-3 bg-planora-accent-purple rounded-full bottom-1/3 right-1/4 animate-pulse" style={{animationDuration: '4s'}}></div>
              <div className="absolute w-2 h-2 bg-planora-accent-pink rounded-full top-1/2 right-1/3 animate-pulse" style={{animationDuration: '5s'}}></div>
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
                  Experience the future of travel planning with Planora.ai. Start planning your next adventure with the power of AI and save hours of research time.
                </p>
                
                {/* Newsletter Section - Enhanced Design */}
                <div className="max-w-2xl mx-auto mb-12 bg-gradient-to-br from-black/60 to-planora-purple-dark/20 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-lg transform transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]">
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-planora-accent-purple/0 via-planora-accent-purple to-planora-accent-purple/0"></div>
                  
                  <h3 className="text-2xl font-bold mb-4">Stay Updated on <span className="gradient-text">Travel Trends</span></h3>
                  <p className="text-lg text-white/80 max-w-xl mx-auto mb-6">
                    Subscribe to our newsletter for travel inspiration, AI insights, and exclusive offers.
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
                    onClick={handleChatWithPlanora}
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
