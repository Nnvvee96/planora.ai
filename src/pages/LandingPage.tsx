import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/ui/organisms/Navigation';
import { TravelCards } from '@/features/travel-planning/api';
import { FeatureCard } from '@/ui/molecules/FeatureCard';
import { GradientButton } from '@/ui/atoms/GradientButton';
import { Logo } from '@/ui/atoms/Logo';
import { Footer } from '@/ui/organisms/Footer';
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
  XCircle,
  Mail
} from 'lucide-react';
import { Button } from '@/ui/atoms/Button';
import { Card } from '@/ui/atoms/Card';
import { Input } from '@/ui/atoms/Input';

const LandingPage = () => {
  const navigate = useNavigate();
  
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
      {/* Background gradient - clean with no text */}
      <div className="absolute inset-0 bg-gradient-to-b from-planora-purple-dark via-planora-purple-dark to-black opacity-90 z-0"></div>
      
      {/* Clean background with no text patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-planora-accent-purple/10 blur-3xl"></div>
        <div className="absolute -bottom-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-planora-accent-blue/10 blur-3xl"></div>
      </div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header with Navigation */}
        <Navigation />
        
        {/* Hero Section */}
        <section id="hero" className="relative flex flex-1 items-center justify-center pt-20 pb-32 px-4 md:px-6">
          <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="gradient-text">Reimagine</span> Your Travel Planning Experience
              </h1>
              <p className="mt-6 text-xl md:text-2xl text-white/80 max-w-xl mx-auto lg:mx-0">
                Planora.ai combines artificial intelligence with your preferences to create personalized travel experiences without the hassle.
              </p>
              <div className="mt-10 flex flex-wrap gap-4 justify-center lg:justify-start">
                <GradientButton size="lg" className="text-lg flex items-center gap-2" onClick={handleChatWithPlanora}>
                  <MessageCircle className="w-5 h-5" />
                  Chat with Planora
                </GradientButton>
                <button className="px-8 py-4 border border-white/20 bg-white/5 hover:bg-white/10 transition-colors rounded-lg text-white text-lg flex items-center gap-2">
                  Learn More
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="relative h-[500px] lg:h-[600px] flex items-center justify-center overflow-hidden">
              <div className="relative w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1503220317375-aaad61436b1b?q=80&w=1920&auto=format&fit=crop" 
                  alt="Person enjoying travel experience" 
                  className="w-full h-full object-cover rounded-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
                  <div className="bg-white/90 backdrop-blur-sm p-5 rounded-xl shadow-lg max-w-md">
                    <p className="text-planora-purple-dark font-medium text-lg italic">"Planora made planning our family trip to Europe so intuitive! We all contributed our preferences and the AI created the perfect itinerary."</p>
                    <div className="flex items-center mt-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-planora-purple-dark">Jessica P.</span>
                        <span className="text-sm text-planora-purple-dark/70">Travel enthusiast</span>
                      </div>
                      <div className="ml-auto flex">
                        {Array(5).fill(0).map((_, i) => (
                          <span key={i} className="text-yellow-500">★</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section id="features" className="py-20 px-4 md:px-6 bg-gradient-to-b from-planora-purple-dark/30 to-planora-purple-dark">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose <span className="gradient-text">Planora.ai</span></h2>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                Our intelligent travel assistant makes planning your trips effortless, personalized, and enjoyable.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={MessageCircle}
                title="Natural Conversation"
                description="Chat naturally about your travel preferences and let our AI understand your needs without filling out complex forms."
              />
              <FeatureCard
                icon={UserPlus}
                title="Group Planning"
                description="Coordinate trips with friends and family by integrating everyone's preferences into a harmonious travel plan."
              />
              <FeatureCard
                icon={Calendar}
                title="Smart Scheduling"
                description="Our AI optimizes your itinerary to maximize experiences while respecting your pace and preferences."
              />
              <FeatureCard
                icon={Globe}
                title="Destination Insights"
                description="Get personalized recommendations based on your interests, budget, and travel style."
              />
              <FeatureCard
                icon={RefreshCcw}
                title="Real-Time Adaptation"
                description="Plans change? Our AI adapts your itinerary on the fly based on new information or preferences."
              />
              <FeatureCard
                icon={Users}
                title="Personalized For You"
                description="The more you use Planora, the better it understands your preferences for more tailored recommendations."
              />
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 px-4 md:px-6 bg-white/5">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How <span className="gradient-text">Planora.ai</span> Works</h2>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                Experience a new way of planning travel through natural conversation and AI-powered recommendations.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 text-center relative">
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink flex items-center justify-center text-white font-bold">1</div>
                <Zap className="h-12 w-12 text-planora-accent-purple mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Chat Naturally</h3>
                <p className="text-white/70">
                  Tell Planora about your travel preferences, interests, and constraints through simple conversation.
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 text-center relative">
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink flex items-center justify-center text-white font-bold">2</div>
                <Clock className="h-12 w-12 text-planora-accent-blue mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Get Personalized Plans</h3>
                <p className="text-white/70">
                  Our AI creates custom travel plans based on your preferences, budget, and schedule constraints.
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 text-center relative">
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink flex items-center justify-center text-white font-bold">3</div>
                <Shield className="h-12 w-12 text-planora-accent-pink mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Refine & Confirm</h3>
                <p className="text-white/70">
                  Review your personalized itinerary, make adjustments through conversation, and confirm your plans.
                </p>
              </div>
            </div>
            
            <div className="mt-16 text-center">
              <GradientButton size="lg" className="text-lg flex items-center gap-2 mx-auto" onClick={handleChatWithPlanora}>
                <MessageCircle className="w-5 h-5" />
                Start Planning Now
              </GradientButton>
            </div>
          </div>
        </section>
        
        {/* Example Trips Section */}
        <section id="examples" className="py-20 px-4 md:px-6 bg-gradient-to-b from-white/10 to-planora-purple-dark/90">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Popular <span className="gradient-text">Trip Ideas</span></h2>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                Explore some of our most loved travel destinations and itineraries.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 mb-6">
                  <h3 className="text-xl font-semibold mb-4">Interactive Travel Planning</h3>
                  <div className="bg-white/10 rounded-lg p-5 border border-white/10">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 rounded-full bg-planora-accent-purple flex items-center justify-center">
                        <span className="text-white font-semibold">P</span>
                      </div>
                      <div className="ml-3 bg-white/10 rounded-lg py-2 px-4 text-white/90">
                        Hi! I'd like to plan a trip to Japan for cherry blossom season.
                      </div>
                    </div>
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-white" />
                      </div>
                      <div className="ml-3 bg-gradient-to-r from-planora-accent-purple/20 to-planora-accent-pink/20 rounded-lg py-2 px-4 text-white">
                        Great choice! Japan's cherry blossom season is typically from late March to early April. Would you prefer to focus on Tokyo, Kyoto, or a multi-city experience?
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-planora-accent-purple flex items-center justify-center">
                        <span className="text-white font-semibold">P</span>
                      </div>
                      <div className="ml-3 bg-white/10 rounded-lg py-2 px-4 text-white/90">
                        I'd love to see multiple cities! Definitely Tokyo and Kyoto, plus maybe somewhere less touristy?
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TravelCards limit={2} />
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 h-full flex flex-col">
                <h3 className="text-xl font-semibold mb-4">What Our Travelers Say</h3>
                
                <div className="bg-gradient-to-br from-planora-accent-purple/20 to-planora-accent-blue/20 rounded-lg p-6 flex-grow">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-cover bg-center" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1494790108377-be9c29b29330)'}}></div>
                    <div className="ml-3">
                      <p className="font-medium">Sarah Thompson</p>
                      <p className="text-sm text-white/60">Travel Enthusiast</p>
                    </div>
                  </div>
                  
                  <blockquote className="text-white/80 italic mb-6">
                    "I was skeptical about AI planning my vacation, but Planora completely changed my mind. The app understood exactly what I wanted, suggested places I hadn't considered, and created the perfect balance of activities and relaxation. My trip to Portugal was absolutely seamless!"
                  </blockquote>
                  
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <Button onClick={handleChatWithPlanora} variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10 w-full">
                    Read More Stories
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <GradientButton onClick={handleChatWithPlanora} className="px-6">
                Start Planning Your Journey
              </GradientButton>
            </div>
          </div>
        </section>
        
        {/* Pricing Section */}
        <section id="pricing" className="py-20 px-4 md:px-6 bg-white/5">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple <span className="gradient-text">Pricing</span></h2>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                Choose the plan that best fits your travel needs and preferences.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {pricingTiers.map((tier, index) => (
                <div 
                  key={index}
                  className={`bg-white/5 backdrop-blur-md border rounded-xl overflow-hidden ${
                    tier.highlighted 
                      ? 'border-planora-accent-purple shadow-lg shadow-planora-accent-purple/20 relative' 
                      : 'border-white/10'
                  }`}
                >
                  {tier.highlighted && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink text-white text-xs font-bold py-1 text-center">
                      MOST POPULAR
                    </div>
                  )}
                  
                  <div className="p-8">
                    <h3 className="text-2xl font-bold">{tier.name}</h3>
                    <div className="mt-4 flex items-end">
                      <span className="text-4xl font-bold">{tier.price}</span>
                      {tier.period && <span className="text-white/60 ml-1">{tier.period}</span>}
                    </div>
                    <p className="mt-2 text-white/70">{tier.description}</p>
                    
                    <div className="mt-8">
                      <p className="font-medium text-sm mb-4">What's included:</p>
                      <ul className="space-y-3">
                        {tier.features.map((feature, i) => (
                          <li key={i} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {tier.limitations.length > 0 && (
                      <div className="mt-8">
                        <p className="font-medium text-sm mb-4 text-white/60">Limitations:</p>
                        <ul className="space-y-3">
                          {tier.limitations.map((limitation, i) => (
                            <li key={i} className="flex items-start text-white/60">
                              <XCircle className="h-5 w-5 text-red-400/70 mr-3 flex-shrink-0 mt-0.5" />
                              <span>{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-8 pt-0">
                    <Button 
                      className={`w-full ${
                        tier.highlighted 
                          ? 'bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink hover:opacity-90' 
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                      onClick={handleChatWithPlanora}
                    >
                      Get Started
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Technology Section */}
        <section id="tech" className="py-20 px-4 md:px-6 bg-gradient-to-b from-planora-purple-dark to-planora-purple-dark/90">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Powered by <span className="gradient-text">Advanced Technology</span></h2>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                Planora.ai leverages cutting-edge AI to deliver a seamless travel planning experience.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="bg-card/50 backdrop-blur-lg border-white/10">
                <div className="p-6 text-center">
                  <div className="flex justify-center"><Code size={48} className="text-planora-accent-purple mb-4" /></div>
                  <h3 className="text-xl font-semibold mb-2">Natural Language Processing</h3>
                  <p className="text-white/70">
                    Our AI understands your travel preferences through natural conversation.
                  </p>
                </div>
              </Card>
              
              <Card className="bg-card/50 backdrop-blur-lg border-white/10">
                <div className="p-6 text-center">
                  <div className="flex justify-center"><Globe size={48} className="text-planora-accent-blue mb-4" /></div>
                  <h3 className="text-xl font-semibold mb-2">Destination Database</h3>
                  <p className="text-white/70">
                    Comprehensive information on thousands of destinations worldwide.
                  </p>
                </div>
              </Card>
              
              <Card className="bg-card/50 backdrop-blur-lg border-white/10">
                <div className="p-6 text-center">
                  <div className="flex justify-center"><Users size={48} className="text-planora-accent-pink mb-4" /></div>
                  <h3 className="text-xl font-semibold mb-2">Preference Learning</h3>
                  <p className="text-white/70">
                    Our system learns from your interactions to provide better recommendations.
                  </p>
                </div>
              </Card>
              
              <Card className="bg-card/50 backdrop-blur-lg border-white/10">
                <div className="p-6 text-center">
                  <div className="flex justify-center"><Shield size={48} className="text-planora-accent-green mb-4" /></div>
                  <h3 className="text-xl font-semibold mb-2">Secure Platform</h3>
                  <p className="text-white/70">
                    Enterprise-grade security protecting your personal information.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section id="faq" className="py-20 px-4 md:px-6 bg-gradient-to-b from-planora-purple-dark/70 via-planora-purple-dark/90 to-planora-purple-dark/80">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked <span className="gradient-text">Questions</span></h2>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                Find answers to common questions about Planora.ai and how it works.
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              {faqItems.map((item, index) => (
                <div key={index} className="mb-6 last:mb-0">
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-3">{item.question}</h3>
                    <p className="text-white/70">{item.answer}</p>
                  </div>
                </div>
              ))}
              
              <div className="mt-12 text-center">
                <p className="mb-4 text-white/70">Have more questions that aren't answered here?</p>
                <Button onClick={() => navigate('/support')} variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10">
                  Visit Our Support Center
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section with Newsletter Inside - as requested */}
        <section id="cta" className="relative py-20 px-4 md:px-6 bg-gradient-to-b from-planora-purple-dark/80 to-planora-purple-dark">
          <div className="container mx-auto">
            <div className="relative overflow-hidden bg-gradient-to-br from-planora-accent-purple/20 via-planora-accent-pink/20 to-planora-accent-blue/20 rounded-2xl p-10 md:p-16">
              <div className="relative z-10 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Redefine Your Travel Planning?</h2>
                <p className="text-xl mb-8 text-white/80 max-w-2xl mx-auto">
                  Experience the future of travel planning with Planora.ai. Sign up now to start planning your next adventure with the power of AI and save hours of research time.
                </p>
                
                {/* Newsletter Section - Added inside CTA as requested */}
                <div className="max-w-2xl mx-auto mb-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
                  <h3 className="text-2xl font-bold mb-4">Stay Updated on <span className="gradient-text">Travel Trends</span></h3>
                  <p className="text-lg text-white/70 max-w-xl mx-auto mb-6">
                    Subscribe to our newsletter for travel inspiration, AI insights, and exclusive offers.
                  </p>
                  <div className="flex flex-col md:flex-row gap-4">
                    <Input 
                      placeholder="Enter your email address" 
                      className="bg-white/10 border-white/20 flex-grow"
                    />
                    <Button className="bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink hover:opacity-90 md:w-auto">
                      <Mail className="mr-2 h-4 w-4" />
                      Subscribe
                    </Button>
                  </div>
                  <p className="text-sm text-white/50 mt-4">
                    We respect your privacy. Unsubscribe at any time.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-4 justify-center">
                  <GradientButton size="lg" className="text-lg flex items-center gap-2" onClick={handleChatWithPlanora}>
                    <MessageCircle className="w-5 h-5" />
                    Chat with Planora
                  </GradientButton>
                  <button className="px-8 py-4 border border-white/20 bg-white/5 hover:bg-white/10 transition-colors rounded-lg text-white text-lg flex items-center gap-2">
                    Learn More
                    <ArrowRight className="w-5 h-5" />
                  </button>
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
