import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import AnimatedEarth from '@/components/AnimatedEarth';
import TravelCards from '@/components/TravelCards';
import FeatureCard from '@/components/FeatureCard';
import GradientButton from '@/components/GradientButton';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
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
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const Index = () => {
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
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-planora-accent-purple/5 blur-3xl"></div>
        <div className="absolute -bottom-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-planora-accent-blue/5 blur-3xl"></div>
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-planora-accent-pink/5 blur-3xl"></div>
      </div>
      
      {/* Navigation */}
      <Navigation />
      
      <div className="flex-grow z-10 relative">
        {/* Hero Section */}
        <section id="home" className="pt-32 pb-20 px-4 md:px-6 min-h-screen flex items-center">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="relative z-10">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Unlock <span className="gradient-text">Seamless Travel</span>: Your AI-Powered Travel Agent is Here.
                </h1>
                <p className="text-xl mb-8 text-white/80">
                  Redefining vacation planning with conversational AI, delivering tailored flight and accommodation packages in minutes, not hours.
                </p>
                <div className="flex flex-wrap gap-4">
                  <GradientButton size="lg" className="text-lg" onClick={handleChatWithPlanora}>
                    Start Your Journey
                  </GradientButton>
                  <button className="px-8 py-4 border border-white/20 bg-white/5 hover:bg-white/10 transition-colors rounded-lg text-white text-lg">
                    Learn More
                  </button>
                </div>
              </div>
              <div className="relative h-[400px] md:h-[500px] flex items-center justify-center">
                <AnimatedEarth />
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works Section - with visual separation */}
        <section id="how-it-works" className="relative py-20 px-4 md:px-6 bg-planora-purple-dark/80">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Experience Travel Planning <span className="gradient-text">Reimagined</span></h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Planora.ai transforms how you plan your trips with intelligent conversation and personalized recommendations.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={MessageCircle}
                title="Conversational Guidance"
                description="Experience natural dialogue with our AI that understands your preferences and travel goals like a human advisor would."
              />
              <FeatureCard 
                icon={Calendar}
                title="Progressive Data Collection"
                description="No more endless forms. Planora gathers what it needs gradually and intelligently through natural conversation."
              />
              <FeatureCard 
                icon={RefreshCcw}
                title="Session Continuity"
                description="Pick up exactly where you left off. Your planning progress is always saved, allowing seamless resumption."
              />
              <FeatureCard 
                icon={Globe}
                title="Smart Inspiration"
                description="Whether you have a destination in mind or need ideas, Planora adapts to your level of planning certainty."
              />
              <FeatureCard 
                icon={Users}
                title="Group Intelligence"
                description="Planning with friends? Planora harmonizes everyone's preferences for the perfect group getaway."
              />
              <FeatureCard 
                icon={UserPlus}
                title="Profile Memory"
                description="Your preferences are saved in your travelPersona for increasingly personalized recommendations over time."
              />
            </div>
          </div>
        </section>

        {/* Powerful Features Section - with visual distinction */}
        <section id="features" className="relative py-20 px-4 md:px-6 bg-black/10">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Powerful <span className="gradient-text">Features</span></h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Everything you need to revolutionize your travel planning experience with confidence.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
                <div className="w-12 h-12 mb-4 flex items-center justify-center rounded-full bg-amber-500/20">
                  <Zap className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
                <p className="text-white/70">Optimized performance ensuring quick response times and real-time updates.</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
                <div className="w-12 h-12 mb-4 flex items-center justify-center rounded-full bg-green-500/20">
                  <Clock className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">24/7 Availability</h3>
                <p className="text-white/70">Reliable service with guaranteed uptime and continuous monitoring.</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
                <div className="w-12 h-12 mb-4 flex items-center justify-center rounded-full bg-purple-500/20">
                  <Shield className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Enterprise Security</h3>
                <p className="text-white/70">Bank-grade security with end-to-end encryption and compliance standards.</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
                <div className="w-12 h-12 mb-4 flex items-center justify-center rounded-full bg-blue-500/20">
                  <Code className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Intuitive API</h3>
                <p className="text-white/70">Simple and powerful API that integrates seamlessly with your existing workflow.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Comparison Section - clean with no background text */}
        <section id="comparison" className="relative py-20 px-4 md:px-6 bg-black/10">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Beyond <span className="gradient-text">Traditional</span> Travel Platforms</h2>
              <p className="text-lg text-white/70 max-w-3xl mx-auto">
                See how Planora.ai transforms the frustrating aspects of travel planning into a seamless, enjoyable experience.
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-8 bg-black/20">
                  <h3 className="text-2xl font-bold mb-6 text-center">Traditional Travel Sites</h3>
                  <ul className="space-y-6">
                    <li className="flex items-start gap-4">
                      <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                      <p>Spend hours filling out rigid forms and filters</p>
                    </li>
                    <li className="flex items-start gap-4">
                      <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                      <p>Generic results requiring manual sorting</p>
                    </li>
                    <li className="flex items-start gap-4">
                      <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                      <p>Start from scratch with each new search</p>
                    </li>
                    <li className="flex items-start gap-4">
                      <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                      <p>Complex group planning with conflicting preferences</p>
                    </li>
                  </ul>
                </div>
                <div className="p-8 bg-planora-accent-purple/10">
                  <h3 className="text-2xl font-bold mb-6 text-center">Planora.ai Experience</h3>
                  <ul className="space-y-6">
                    <li className="flex items-start gap-4">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <p>Have a natural conversation about your travel wishes</p>
                    </li>
                    <li className="flex items-start gap-4">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <p>Curated packages tailored to your unique preferences</p>
                    </li>
                    <li className="flex items-start gap-4">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <p>Your travelPersona learns and remembers your style</p>
                    </li>
                    <li className="flex items-start gap-4">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <p>Smart harmonization of everyone's needs and budgets</p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section - moved after comparison as requested */}
        <section id="pricing" className="relative py-20 px-4 md:px-6 bg-planora-purple-dark/80">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Simple, <span className="gradient-text">Transparent</span> Pricing</h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Choose the plan that fits your travel style and budget. No hidden fees, cancel anytime.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingTiers.map((tier, index) => (
                <div 
                  key={index} 
                  className={`rounded-xl overflow-hidden transition-all transform ${
                    tier.highlighted ? 'scale-105 shadow-xl border-2 border-planora-accent-purple' : 'border border-white/10'
                  } bg-white/5 backdrop-blur-sm`}
                >
                  <div className={`p-6 ${tier.highlighted ? 'bg-gradient-to-r from-planora-accent-purple/30 to-planora-accent-pink/30' : ''}`}>
                    <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                    <div className="flex items-baseline mb-4">
                      <span className="text-4xl font-bold">{tier.price}</span>
                      {tier.period && <span className="text-sm text-white/70 ml-2">{tier.period}</span>}
                    </div>
                    <p className="text-white/70 mb-6">{tier.description}</p>
                    
                    <Button 
                      className={`w-full ${
                        tier.highlighted ? 'bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink hover:opacity-90' : 'bg-white/10 hover:bg-white/20'
                      }`}
                      onClick={handleChatWithPlanora}
                    >
                      {tier.price === 'Free' ? 'Get Started' : 'Choose Plan'}
                    </Button>
                  </div>
                  
                  <div className="p-6 border-t border-white/10">
                    <p className="text-sm font-medium mb-4">Includes:</p>
                    <ul className="space-y-3">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {tier.limitations.length > 0 && (
                      <>
                        <p className="text-sm font-medium mt-6 mb-4 text-white/70">Limitations:</p>
                        <ul className="space-y-3">
                          {tier.limitations.map((limitation, i) => (
                            <li key={i} className="flex items-start text-white/70">
                              <XCircle className="h-5 w-5 text-white/50 mt-0.5 mr-3 flex-shrink-0" />
                              <span>{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <p className="text-white/70">Need a custom enterprise solution?</p>
              <Button variant="outline" className="mt-4 border-white/20 bg-white/5 hover:bg-white/10">
                Contact Sales
              </Button>
            </div>
          </div>
        </section>
        
        {/* Value Proposition Section */}
        <section id="why-planora" className="relative py-20 px-4 md:px-6 bg-black/20">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Plan <span className="gradient-text">Smarter</span>, Travel <span className="gradient-text">Better</span></h2>
                <p className="text-lg mb-10 text-white/70">
                  Traditional travel sites overwhelm with endless forms and generic results. Planora.ai delivers personalized recommendations with minimal effort.
                </p>
                
                <div className="space-y-8">
                  <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                    <h3 className="text-2xl font-bold gradient-text mb-2">70%</h3>
                    <p className="text-white/80">Turn hours of research into minutes of conversation. Planora handles the tedious work so you can focus on the excitement of your upcoming journey.</p>
                  </div>
                  
                  <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                    <h3 className="text-2xl font-bold mb-2">Tailored Packages</h3>
                    <p className="text-white/80">Every suggestion matches your unique taste and budget. No more generic recommendations or endless scrolling through irrelevant options.</p>
                  </div>
                  
                  <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                    <h3 className="text-2xl font-bold mb-2">Effortless Planning</h3>
                    <p className="text-white/80">From solo adventures to complex group trips, Planora.ai balances everyone's preferences for the perfect vacation everyone will enjoy.</p>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="relative z-10 rounded-lg overflow-hidden shadow-xl border border-white/10">
                  <div className="bg-secondary/80 p-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="font-medium text-sm">Planora.ai</div>
                  </div>
                  <div className="bg-planora-purple-dark/95 p-4 h-[400px] overflow-y-auto">
                    <TravelCards />
                  </div>
                </div>
                
                {/* Decorative elements - simplified */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-planora-accent-purple/30 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-planora-accent-pink/20 rounded-full blur-3xl"></div>
              </div>
            </div>
          </div>
        </section>
        
        {/* AI-Powered Section with updated professional image */}
        <section id="ai-powered" className="relative py-20 px-4 md:px-6 bg-black/20">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">AI-Powered, <span className="gradient-text">Human-Centered</span></h2>
                <p className="text-lg mb-8 text-white/70">
                  Traditional travel sites overwhelm you with endless options, leaving you to do all the heavy lifting. 
                  Planora.ai combines advanced AI with a human-like understanding of travel desires to deliver exactly what you need without the exhaustion.
                </p>
                <p className="text-lg mb-10 text-white/70">
                  Our approach focuses on understanding you first, then doing the hard work of searching, filtering, 
                  and curating options that truly match what you're looking for — whether that's a romantic getaway, 
                  family adventure, or solo exploration.
                </p>
                
                <div className="bg-white/5 p-8 rounded-xl border border-white/10">
                  <div className="flex mb-4">
                    <div className="flex">
                      <span className="text-amber-400">★</span>
                      <span className="text-amber-400">★</span>
                      <span className="text-amber-400">★</span>
                      <span className="text-amber-400">★</span>
                      <span className="text-amber-400">★</span>
                    </div>
                  </div>
                  <p className="text-lg italic mb-4">
                    "Planora.ai saved me countless hours of planning for our family trip to Europe. 
                    The recommendations were spot-on and everyone loved their personalized suggestions."
                  </p>
                  <p className="font-medium text-planora-accent-purple">— Sarah M., Family Traveler</p>
                </div>
              </div>
              
              <div className="relative rounded-lg overflow-hidden h-[400px]">
                <img 
                  src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1950&q=80" 
                  alt="Woman wearing a summer hat on a sunny beach vacation" 
                  className="w-full h-full object-cover rounded-lg" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section - moved after AI-Powered as requested */}
        <section id="faq" className="relative py-20 px-4 md:px-6 bg-planora-purple-dark/80">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Frequently Asked <span className="gradient-text">Questions</span></h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Everything you need to know about Planora.ai and how it can transform your travel planning experience.
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              {faqItems.map((item, index) => (
                <div 
                  key={index} 
                  className="mb-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden"
                >
                  <div className="p-6">
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
        <section id="cta" className="relative py-20 px-4 md:px-6">
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

export default Index;
