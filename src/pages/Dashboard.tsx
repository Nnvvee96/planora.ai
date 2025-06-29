import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/ui/atoms/Button";
import {
  MessageCircle,
  Search,
  MapPin,
  Calendar,
  Plane,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  Sparkles,
  TrendingUp,
  Globe,
  Star,
} from "lucide-react";
import { Logo } from "@/ui/atoms/Logo";
import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/atoms/Card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { Footer } from "@/ui/organisms/Footer";
import { TripCard } from "@/ui/molecules/TripCard";

// Import from feature API boundaries only, following architectural principles
import { useAuth } from "@/features/auth/authApi";
import {
  getUserProfileMenuComponent,
  UserProfile,
} from "@/features/user-profile/userProfileApi";
import { useUserProfileAuthIntegration } from "@/features/user-profile/userProfileApi";
import { userProfileService } from "@/features/user-profile/userProfileApi";

const Dashboard = () => {
  const navigate = useNavigate();
  // Use auth hook directly instead of managing authService state
  const { user, loading: authLoading } = useAuth();

  const [_searchQuery, _setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Use the integration hook for cross-feature communication
  const _userProfileIntegration = useUserProfileAuthIntegration();

  // Memoize the UserProfileMenu component to prevent unnecessary re-renders
  const UserProfileMenu = useMemo(() => getUserProfileMenuComponent(), []);

  // Memoize user name calculation to prevent unnecessary recalculations
  const userName = useMemo(() => {
    const userFirstName = user?.firstName || userProfile?.firstName || "";
    const userLastName = user?.lastName || userProfile?.lastName || "";
    const userFullName = `${userFirstName} ${userLastName}`.trim();

    // Use email username or 'User' as fallback instead of Guest
    return (
      userFullName || user?.username || user?.email?.split("@")[0] || "User"
    );
  }, [user, userProfile]);

  // Simplified profile loading - load only once when user is available
  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!user?.id || authLoading) return;

      try {
        setLoading(true);
        if (user) {
          if (import.meta.env.DEV) {
            if (import.meta.env.DEV) console.log("Dashboard: Loading profile for user:", user.id);
          }
          const profile = await userProfileService.getUserProfile(user.id);
          
          if (profile) {
            if (import.meta.env.DEV) {
              console.log("Dashboard: Profile loaded successfully");
            }
            setUserProfile(profile);
          }
        }
      } catch {
        // Set empty profile to prevent infinite loading
        if (isMounted) {
          setUserProfile({
            id: user.id,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email || "",
            avatarUrl: null,
            birthdate: null,
            hasCompletedOnboarding: true, // Assume true if on dashboard
            emailVerified: true,
            isBetaTester: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (user && !userProfile) {
      loadProfile();
    }

    return () => {
      isMounted = false;
    };
  }, [user, authLoading, userProfile]); // Include userProfile in dependencies

  // Session verification - simplified and only when necessary
  useEffect(() => {
    if (user || authLoading) return; // Don't run if we have user or auth is loading

    if (import.meta.env.DEV) {
      console.log("Dashboard: No user found, redirecting to login");
    }
    navigate("/login");
  }, [user, authLoading, navigate]);

  // Handler for directing to chat interface - memoized to prevent recreation
  const handleChatWithPlanora = useCallback(() => {
    navigate("/chat");
  }, [navigate]);

  // Memoize static data to prevent recreation on every render
  const upcomingTrips = useMemo(
    () => [
      {
        id: 1,
        destination: "Barcelona, Spain",
        dates: "Aug 15 - Aug 23, 2025",
        image:
          "https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=1000&auto=format&fit=crop",
        progress: 85,
        status: "Confirmed",
      },
      {
        id: 2,
        destination: "Tokyo, Japan",
        dates: "Sept 5 - Sept 15, 2025",
        image:
          "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1000&auto=format&fit=crop",
        progress: 60,
        status: "Planning",
      },
    ],
    [],
  );

  const suggestions = useMemo(
    () => [
      {
        id: 1,
        destination: "Santorini, Greece",
        image:
          "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=1000&auto=format&fit=crop",
        description: "Based on your interest in scenic coastal locations",
      },
      {
        id: 2,
        destination: "Kyoto, Japan",
        image:
          "https://images.unsplash.com/photo-1624253321171-1be53e12f5f2?q=80&w=1000&auto=format&fit=crop",
        description: "Matches your cultural exploration preferences",
      },
      {
        id: 3,
        destination: "Bali, Indonesia",
        image:
          "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1000&auto=format&fit=crop",
        description: "Perfect for your relaxation and nature preferences",
      },
    ],
    [],
  );

  const conversations = useMemo(
    () => [
      {
        id: 1,
        title: "Weekend in Paris",
        preview: "We discussed boutique hotels near Le Marais...",
        updatedAt: "2 days ago",
      },
      {
        id: 2,
        title: "Summer family trip options",
        preview: "Comparing beach destinations in Portugal and Spain...",
        updatedAt: "1 week ago",
      },
    ],
    [],
  );

  const userInsights = useMemo(
    () => ({
      destinations: 12,
      topCountry: "Japan",
      savedMoney: "$450",
      savedTime: "28 hours",
    }),
    [],
  );

  // Show loading state while auth or profile is loading
  if (authLoading || (loading && !userProfile)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl"></div>
            <div className="relative bg-black/40 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-transparent border-t-purple-400 border-r-pink-400 mx-auto mb-4"></div>
              <p className="text-white/90 text-lg">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation Header */}
      <header className="relative z-20 bg-black/30 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo href="/dashboard" />
            </div>

            {/* Center Navigation Icons */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleChatWithPlanora}
                className="flex items-center gap-2 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-xl px-4 py-2"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Chat</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-xl px-4 py-2"
              >
                <Calendar className="h-5 w-5" />
                <span className="text-sm font-medium">Calendar</span>
              </Button>

              <div className="w-px h-6 bg-white/20"></div>

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-xl px-4 py-2"
              >
                <Search className="h-5 w-5" />
                <span className="text-sm font-medium">Search</span>
              </Button>
            </div>

            {/* Mobile Navigation Icons */}
            <div className="md:hidden flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleChatWithPlanora}
                className="text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-xl"
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-xl"
              >
                <Calendar className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center space-x-3">
              <Suspense fallback={<div>Loading...</div>}>
                <UserProfileMenu
                  userName={userName}
                  userEmail={user?.email}
                  firstName={user?.firstName || userProfile?.firstName}
                  lastName={user?.lastName || userProfile?.lastName}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 container mx-auto py-8 px-4 md:px-6 isolation-isolate">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome back, {userName}!
          </h1>
          <p className="text-white/70 text-lg md:text-xl">
            Ready to plan your next adventure?
          </p>
        </div>

        {/* Modern Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Button
              className="relative w-full h-auto py-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0 rounded-2xl transition-all duration-300 transform group-hover:scale-105"
              onClick={handleChatWithPlanora}
            >
              <div className="flex flex-col items-center">
                <MessageCircle className="h-8 w-8 mb-3" />
                <span className="text-xl font-semibold">Chat with Planora</span>
                <span className="text-sm text-white/80 mt-1">Start planning instantly</span>
              </div>
            </Button>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl"></div>
            <Button
              variant="outline"
              className="relative w-full h-auto py-8 bg-black/20 backdrop-blur-xl border border-white/20 hover:bg-white/10 rounded-2xl transition-all duration-300 transform group-hover:scale-105"
            >
              <div className="flex flex-col items-center">
                <Globe className="h-8 w-8 mb-3 text-blue-400" />
                <span className="text-xl font-semibold text-white">Explore Destinations</span>
                <span className="text-sm text-white/60 mt-1">Discover new places</span>
              </div>
            </Button>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl"></div>
            <Button
              variant="outline"
              className="relative w-full h-auto py-8 bg-black/20 backdrop-blur-xl border border-white/20 hover:bg-white/10 rounded-2xl transition-all duration-300 transform group-hover:scale-105"
              onClick={() => {
                if (import.meta.env.DEV) {
                  console.log(
                    "Navigating to preferences from SmartTravel-Profile button",
                  );
                }
                window.location.href = "/preferences";
              }}
            >
              <div className="flex flex-col items-center">
                <Settings className="h-8 w-8 mb-3 text-emerald-400" />
                <span className="text-xl font-semibold text-white">SmartTravel-Profile</span>
                <span className="text-sm text-white/60 mt-1">Customize preferences</span>
              </div>
            </Button>
          </div>
        </section>

        {/* Modern Dashboard Tabs */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-800/20 to-slate-700/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <Tabs defaultValue="trips" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8 bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-2 h-14">
                <TabsTrigger 
                  value="trips" 
                  className="text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all duration-300 rounded-xl h-10 flex items-center justify-center"
                >
                  Upcoming Trips
                </TabsTrigger>
                <TabsTrigger 
                  value="suggestions" 
                  className="text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white transition-all duration-300 rounded-xl h-10 flex items-center justify-center"
                >
                  Smart Suggestions
                </TabsTrigger>
                <TabsTrigger 
                  value="conversations" 
                  className="text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white transition-all duration-300 rounded-xl h-10 flex items-center justify-center"
                >
                  Recent Conversations
                </TabsTrigger>
                <TabsTrigger 
                  value="insights" 
                  className="text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white transition-all duration-300 rounded-xl h-10 flex items-center justify-center"
                >
                  Your Insights
                </TabsTrigger>
              </TabsList>

              <TabsContent value="trips" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingTrips.map((trip) => (
                    <TripCard key={trip.id} trip={trip} />
                  ))}

                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-500/20 to-slate-400/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Card className="relative bg-black/20 backdrop-blur-xl border-2 border-dashed border-white/30 rounded-2xl flex flex-col items-center justify-center h-[320px] transition-all duration-300 transform group-hover:scale-105">
                      <Plus className="h-12 w-12 text-white/40 mb-4" />
                      <p className="text-white/60 text-center px-6 mb-4 font-medium">
                        Start planning your next adventure
                      </p>
                      <Button
                        variant="outline"
                        className="border-white/30 bg-white/10 hover:bg-white/20 text-white transition-all duration-300"
                        onClick={handleChatWithPlanora}
                      >
                        Chat with Planora
                      </Button>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="suggestions" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <Card className="relative bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden transition-all duration-300 transform group-hover:scale-105">
                        <div className="relative h-48">
                          <img
                            src={suggestion.image}
                            alt={suggestion.destination}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                          <div className="absolute bottom-4 left-4">
                            <h3 className="text-white font-bold text-xl">
                              {suggestion.destination}
                            </h3>
                            <div className="flex items-center mt-1">
                              <Star className="h-4 w-4 text-yellow-400 mr-1" />
                              <span className="text-yellow-400 text-sm font-medium">AI Recommended</span>
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <p className="text-sm text-white/80 leading-relaxed">
                            {suggestion.description}
                          </p>
                        </CardContent>
                        <CardFooter className="px-6 pb-6 pt-0 flex justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                          >
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-400/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-all duration-300"
                          >
                            Plan Trip
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="conversations" className="space-y-6 mt-0">
                <div className="space-y-4">
                  {conversations.map((conversation) => (
                    <div key={conversation.id} className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <Card className="relative bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl transition-all duration-300 transform group-hover:scale-[1.02]">
                        <CardHeader className="pb-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
                                <MessageCircle className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <CardTitle className="text-lg font-semibold text-white">
                                  {conversation.title}
                                </CardTitle>
                                <span className="text-xs text-white/50">
                                  {conversation.updatedAt}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-white/80 leading-relaxed">
                            {conversation.preview}
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                            onClick={handleChatWithPlanora}
                          >
                            Continue Conversation
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  ))}

                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-500/20 to-slate-400/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Card className="relative bg-black/20 backdrop-blur-xl border-2 border-dashed border-white/30 rounded-2xl transition-all duration-300 transform group-hover:scale-[1.02]">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <MessageCircle className="h-12 w-12 text-white/40 mb-4" />
                        <p className="text-white/60 text-center mb-6 font-medium">
                          Start a new conversation with Planora AI
                        </p>
                        <Button
                          variant="outline"
                          className="border-white/30 bg-white/10 hover:bg-white/20 text-white transition-all duration-300"
                          onClick={handleChatWithPlanora}
                        >
                          New Conversation
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="insights" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Card className="relative bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl transition-all duration-300 transform group-hover:scale-105">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-white" />
                          </div>
                          <CardTitle className="text-xl font-bold text-white">Your Travel Stats</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                          <div>
                            <p className="text-white/70 text-sm font-medium">
                              Destinations Explored
                            </p>
                            <p className="text-3xl font-bold text-white mt-1">
                              {userInsights.destinations}
                            </p>
                          </div>
                          <MapPin className="h-12 w-12 text-orange-400 opacity-80" />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                          <div>
                            <p className="text-white/70 text-sm font-medium">
                              Most Searched Country
                            </p>
                            <p className="text-3xl font-bold text-white mt-1">
                              {userInsights.topCountry}
                            </p>
                          </div>
                          <Plane className="h-12 w-12 text-orange-400 opacity-80" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Card className="relative bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl transition-all duration-300 transform group-hover:scale-105">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                            <Sparkles className="h-6 w-6 text-white" />
                          </div>
                          <CardTitle className="text-xl font-bold text-white">Planora Benefits</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                          <div>
                            <p className="text-white/70 text-sm font-medium">
                              Savings with Planora
                            </p>
                            <p className="text-3xl font-bold text-white mt-1">
                              {userInsights.savedMoney}
                            </p>
                          </div>
                          <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-green-500/20 border border-green-500/30">
                            <span className="text-green-400 text-2xl font-bold">
                              $
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                          <div>
                            <p className="text-white/70 text-sm font-medium">
                              Planning Time Saved
                            </p>
                            <p className="text-3xl font-bold text-white mt-1">
                              {userInsights.savedTime}
                            </p>
                          </div>
                          <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/30">
                            <Clock className="h-8 w-8 text-amber-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="relative group md:col-span-2">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Card className="relative bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl transition-all duration-300">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                            <Settings className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-xl font-bold text-white">Complete Your Profile</CardTitle>
                            <CardDescription className="text-white/60">
                              Enhance your recommendations by completing your traveler profile
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-white/70 font-medium">
                            Profile Completion
                          </span>
                          <span className="text-sm font-bold text-white">75%</span>
                        </div>
                        <Progress value={75} className="h-3 bg-white/10 rounded-full mb-6" />

                        <ul className="space-y-3">
                          <li className="flex items-center text-sm">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                            <span className="text-white/80 font-medium">
                              Basic information complete
                            </span>
                          </li>
                          <li className="flex items-center text-sm">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                            <span className="text-white/80 font-medium">
                              SmartTravel-Profile configured
                            </span>
                          </li>
                          <li className="flex items-center text-sm text-white/50">
                            <XCircle className="h-5 w-5 text-white/50 mr-3" />
                            <span>Connect calendar for trip scheduling</span>
                          </li>
                          <li className="flex items-center text-sm text-white/50">
                            <XCircle className="h-5 w-5 text-white/50 mr-3" />
                            <span>Add payment method for seamless booking</span>
                          </li>
                        </ul>

                        <Button
                          className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 transition-all duration-300"
                          type="button"
                          onClick={() => {
                            if (import.meta.env.DEV) {
                              console.log("Direct navigation to /preferences");
                            }
                            navigate("/preferences");
                          }}
                        >
                          SmartTravel-Profile
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Modern Footer */}
      <div className="mt-auto relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export { Dashboard };
