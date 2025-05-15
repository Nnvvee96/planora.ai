
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Logo from '@/components/Logo';
import UserProfileMenu from '@/components/UserProfileMenu';
import { 
  MessageCircle, 
  Bell,
  Calendar,
  MapPin,
  Star,
  Search,
  Plus,
  ChevronRight
} from 'lucide-react';

const Homepage = () => {
  const navigate = useNavigate();
  const userName = "Sarah";

  return (
    <div className="min-h-screen bg-planora-purple-dark">
      {/* Background elements */}
      <div className="fixed inset-0 bg-gradient-to-b from-planora-purple-dark via-planora-purple-dark to-black opacity-90 z-0"></div>
      
      {/* Dynamic background pattern - simplified, no text overlays */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-planora-accent-purple/10 blur-3xl"></div>
        <div className="absolute -bottom-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-planora-accent-blue/10 blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-background/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <Logo />
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="text-white">
                <Bell className="h-5 w-5" />
              </Button>
              
              <UserProfileMenu userName={userName} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 md:px-6 py-8">
        {/* Welcome Section */}
        <section className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {userName}!</h1>
              <p className="text-white/60 mt-1">Let's plan your next unforgettable journey</p>
            </div>
            <Button 
              onClick={() => navigate('/dashboard')}
              className="mt-4 md:mt-0 bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink hover:opacity-90 flex items-center"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Start Planning
            </Button>
          </div>
        </section>

        {/* Travel Suggestions */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Smart Travel Suggestions</h2>
            <Button variant="link" className="text-planora-accent-purple p-0">View All</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                destination: "Kyoto, Japan",
                image: "https://images.unsplash.com/photo-1624253321171-1be53e12f5f2",
                reason: "Matches your interest in cultural exploration"
              },
              {
                destination: "Barcelona, Spain",
                image: "https://images.unsplash.com/photo-1583422409516-2895a77efded",
                reason: "Perfect for your architectural interests"
              },
              {
                destination: "Bali, Indonesia",
                image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4",
                reason: "Based on your preference for beach destinations"
              }
            ].map((suggestion, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-lg border-white/10 overflow-hidden group hover:border-planora-accent-purple/30 transition-all">
                <div className="relative h-40">
                  <img 
                    src={suggestion.image} 
                    alt={suggestion.destination} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute bottom-3 left-3">
                    <h3 className="font-semibold text-white">{suggestion.destination}</h3>
                    <p className="text-xs text-white/70">{suggestion.reason}</p>
                  </div>
                </div>
                <CardFooter className="flex justify-between">
                  <Button variant="ghost" size="sm" className="text-sm p-0 text-planora-accent-purple">
                    Learn More
                  </Button>
                  <Button variant="outline" size="sm" className="text-sm border-planora-accent-purple/30 bg-planora-accent-purple/10 hover:bg-planora-accent-purple/20 text-planora-accent-purple">
                    Explore
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* Recent Conversations & Upcoming Trips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Recent Conversations */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Ongoing Conversations</h2>
              <Button variant="ghost" size="sm" className="flex items-center text-planora-accent-purple p-0">
                <Plus className="mr-1 h-4 w-4" />
                New Chat
              </Button>
            </div>
            
            <div className="space-y-4">
              {[
                { title: "Weekend in Paris", preview: "We discussed boutique hotels near Le Marais...", time: "Updated 2 days ago" },
                { title: "Summer family trip options", preview: "Comparing beach destinations in Portugal and Spain...", time: "Updated 1 week ago" }
              ].map((chat, index) => (
                <Card key={index} className="bg-card/50 backdrop-blur-lg border-white/10 hover:border-white/20 transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{chat.title}</CardTitle>
                      <span className="text-xs text-white/50">{chat.time}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-white/70 line-clamp-2">{chat.preview}</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" className="text-sm ml-auto text-planora-accent-purple p-0">
                      Continue <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>

          {/* Upcoming Trips */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Upcoming Trips</h2>
              <Button variant="link" className="text-planora-accent-purple p-0">View All</Button>
            </div>
            
            <Card className="bg-card/50 backdrop-blur-lg border-white/10 mb-4">
              <div className="relative h-32">
                <img 
                  src="https://images.unsplash.com/photo-1583422409516-2895a77efded" 
                  alt="Barcelona" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-3 left-3">
                  <h3 className="text-lg font-semibold text-white">Barcelona, Spain</h3>
                  <div className="flex items-center text-white/70 text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>Aug 15 - Aug 23, 2025</span>
                  </div>
                </div>
              </div>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/60">Planning Progress</span>
                  <span className="text-sm font-medium">85%</span>
                </div>
                <Progress value={85} className="h-2 bg-white/10" />
              </CardContent>
              <CardFooter className="flex justify-between pt-0">
                <span className="text-sm px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                  Confirmed
                </span>
                <Button variant="ghost" size="sm" className="text-planora-accent-purple">
                  View Details
                </Button>
              </CardFooter>
            </Card>
            
            <Button 
              variant="outline" 
              className="w-full border-dashed border-white/10 bg-white/5 hover:bg-white/10 py-8 h-auto"
            >
              <div className="flex flex-col items-center">
                <Plus className="h-6 w-6 mb-2 text-white/50" />
                <span className="text-white/70">Plan a New Trip</span>
              </div>
            </Button>
          </section>
        </div>
        
        {/* User Insights */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Your Travel Insights</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Destinations Explored", value: "12", icon: MapPin },
              { label: "Most Searched Country", value: "Japan", icon: Search },
              { label: "Saved Money", value: "$450", icon: Star },
              { label: "Planning Time Saved", value: "28 hrs", icon: Calendar },
            ].map((stat, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-lg border-white/10">
                <CardContent className="pt-6 pb-4 px-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-white/60">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className="rounded-full p-2 bg-planora-accent-purple/20">
                      <stat.icon className="h-5 w-5 text-planora-accent-purple" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Homepage;
