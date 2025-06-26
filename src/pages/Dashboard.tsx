import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
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

// Import from feature API boundaries only, following architectural principles
import { useAuth } from "@/features/auth/authApi";
import {
  getUserProfileMenuComponent,
  UserProfile,
} from "@/features/user-profile/userProfileApi";
import { useUserProfileIntegration } from "@/features/user-profile/userProfileApi";
import { BetaFeature } from "@/features/dev-tools/devToolsApi";
import { QuickActionsWidget } from "@/features/dashboard/dashboardApi";
import { userProfileService } from "@/features/user-profile/userProfileApi";

const Dashboard = () => {
  const navigate = useNavigate();
  // Use auth hook directly instead of managing authService state
  const { user, loading: authLoading } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Use the integration hook for cross-feature communication
  const _userProfileIntegration = useUserProfileIntegration();

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
        console.log("Dashboard: Loading profile for user:", user.id);

        // Use direct profile service call instead of integration hook to avoid auth loops
        const profileData = await userProfileService.getUserProfile(user.id);

        if (isMounted && profileData) {
          setUserProfile(profileData);
          console.log("Dashboard: Profile loaded successfully");
        }
      } catch (error) {
        console.error("Dashboard: Error loading profile:", error);
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

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.email, user?.firstName, user?.lastName, authLoading]); // Include all user dependencies

  // Session verification - simplified and only when necessary
  useEffect(() => {
    if (user || authLoading) return; // Don't run if we have user or auth is loading

    console.log("Dashboard: No user found, redirecting to login");
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
      <div className="min-h-screen flex items-center justify-center bg-planora-purple-dark">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-planora-purple-dark">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-planora-purple-dark via-planora-purple-dark to-black opacity-90 z-0"></div>

      {/* Dynamic background pattern - simplified, no text overlays */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute w-full h-full opacity-5">
          <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-planora-accent-purple/20 blur-3xl"></div>
          <div className="absolute -bottom-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-planora-accent-blue/20 blur-3xl"></div>
          <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-planora-accent-pink/20 blur-3xl"></div>
        </div>
      </div>

      {/* Top navigation */}
      <header className="relative z-10 bg-background/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Logo href="/dashboard" />
              <div className="ml-8 hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search destinations, trips, or conversations..."
                    className="pl-10 pr-4 py-2 w-[350px] bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-planora-accent-purple/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-white"
                onClick={handleChatWithPlanora}
              >
                <MessageCircle className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="icon" className="text-white">
                <Calendar className="h-5 w-5" />
              </Button>

              <Suspense fallback={<div>Loading...</div>}>
                <UserProfileMenu
                  userName={userName}
                  userEmail={user?.email || userProfile?.email}
                  firstName={user?.firstName || userProfile?.firstName || ""}
                  lastName={user?.lastName || userProfile?.lastName || ""}
                  // The birthdate is not available directly in UserProfile
                  // but the UserProfileMenu component might expect it
                  mini={false}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 container mx-auto px-4 md:px-6 py-8 flex-grow">
        {/* Welcome section - RESTORED from 1443884 */}
        <section className="mb-10">
          <h1 className="text-3xl font-bold">Welcome back, {userName}!</h1>
          <p className="text-white/60 mt-2">
            Ready to plan your next adventure?
          </p>
        </section>

        {/* Quick Actions - RESTORED from 1443884 */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <Button
            className="h-auto py-6 bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink hover:opacity-90"
            onClick={handleChatWithPlanora}
          >
            <div className="flex flex-col items-center">
              <Plus className="h-6 w-6 mb-2" />
              <span className="text-lg">Chat with Planora.ai</span>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-6 border-white/10 bg-white/5 hover:bg-white/10"
          >
            <div className="flex flex-col items-center">
              <MapPin className="h-6 w-6 mb-2" />
              <span className="text-lg">Explore Destinations</span>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-6 border-white/10 bg-white/5 hover:bg-white/10"
            onClick={() => {
              console.log(
                "Navigating to preferences from Modify Preferences button",
              );
              window.location.href = "/preferences";
            }}
          >
            <div className="flex flex-col items-center">
              <Settings className="h-6 w-6 mb-2" />
              <span className="text-lg">Modify Preferences</span>
            </div>
          </Button>
        </section>

        {/* Beta Feature Widget - Keep this new functionality */}
        <BetaFeature>
          <QuickActionsWidget />
        </BetaFeature>

        {/* Main Dashboard Tabs - RESTORED layout from 1443884 */}
        <Tabs defaultValue="trips" className="mb-10">
          <TabsList className="mb-6">
            <TabsTrigger value="trips" className="text-base">
              Upcoming Trips
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="text-base">
              Smart Suggestions
            </TabsTrigger>
            <TabsTrigger value="conversations" className="text-base">
              Recent Conversations
            </TabsTrigger>
            <TabsTrigger value="insights" className="text-base">
              Your Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trips">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingTrips.map((trip) => (
                <Card
                  key={trip.id}
                  className="bg-card/50 backdrop-blur-lg border-white/10"
                >
                  <div className="relative h-40 w-full rounded-t-lg overflow-hidden">
                    <img
                      src={trip.image}
                      alt={trip.destination}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4">
                      <h3 className="text-white font-bold text-xl">
                        {trip.destination}
                      </h3>
                      <div className="flex items-center text-white/70 text-sm">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{trip.dates}</span>
                      </div>
                    </div>
                  </div>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/60">
                        Planning Progress
                      </span>
                      <span className="text-sm font-medium">
                        {trip.progress}%
                      </span>
                    </div>
                    <Progress
                      value={trip.progress}
                      className="h-2 bg-white/10"
                    />
                    <div className="flex items-center justify-between mt-4">
                      <span
                        className={`text-sm px-2 py-1 rounded-full ${trip.status === "Confirmed" ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}`}
                      >
                        {trip.status}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-planora-accent-purple"
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="bg-card/50 backdrop-blur-lg border-white/10 border-dashed flex flex-col items-center justify-center h-[250px]">
                <Plus className="h-10 w-10 text-white/30 mb-4" />
                <p className="text-white/50 text-center px-6">
                  Start planning your next adventure
                </p>
                <Button
                  variant="outline"
                  className="mt-4 border-white/10 bg-white/5 hover:bg-white/10"
                  onClick={handleChatWithPlanora}
                >
                  Chat with Planora.ai
                </Button>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="suggestions">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestions.map((suggestion) => (
                <Card
                  key={suggestion.id}
                  className="bg-card/50 backdrop-blur-lg border-white/10 overflow-hidden"
                >
                  <div className="relative h-40">
                    <img
                      src={suggestion.image}
                      alt={suggestion.destination}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-4 left-4">
                      <h3 className="text-white font-bold text-lg">
                        {suggestion.destination}
                      </h3>
                    </div>
                  </div>
                  <CardContent className="py-4">
                    <p className="text-sm text-white/70">
                      {suggestion.description}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-planora-accent-purple"
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-planora-accent-purple/30 bg-planora-accent-purple/10 hover:bg-planora-accent-purple/20 text-planora-accent-purple"
                    >
                      Plan Trip
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="conversations">
            <div className="space-y-4">
              {conversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className="bg-card/50 backdrop-blur-lg border-white/10"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg font-medium">
                        {conversation.title}
                      </CardTitle>
                      <span className="text-xs text-white/50">
                        {conversation.updatedAt}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-white/70">
                      {conversation.preview}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-planora-accent-purple"
                      onClick={handleChatWithPlanora}
                    >
                      Continue Conversation
                    </Button>
                  </CardFooter>
                </Card>
              ))}

              <Card className="bg-card/50 backdrop-blur-lg border-white/10 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <MessageCircle className="h-10 w-10 text-white/30 mb-4" />
                  <p className="text-white/50 text-center mb-4">
                    Start a new conversation with Planora AI
                  </p>
                  <Button
                    variant="outline"
                    className="border-white/10 bg-white/5 hover:bg-white/10"
                    onClick={handleChatWithPlanora}
                  >
                    New Conversation
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card/50 backdrop-blur-lg border-white/10">
                <CardHeader>
                  <CardTitle>Your Travel Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">
                        Destinations Explored
                      </p>
                      <p className="text-2xl font-bold">
                        {userInsights.destinations}
                      </p>
                    </div>
                    <MapPin className="h-10 w-10 text-planora-accent-purple opacity-70" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">
                        Most Searched Country
                      </p>
                      <p className="text-2xl font-bold">
                        {userInsights.topCountry}
                      </p>
                    </div>
                    <Plane className="h-10 w-10 text-planora-accent-purple opacity-70" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-lg border-white/10">
                <CardHeader>
                  <CardTitle>Planora Benefits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">
                        Savings with Planora
                      </p>
                      <p className="text-2xl font-bold">
                        {userInsights.savedMoney}
                      </p>
                    </div>
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-green-500/20">
                      <span className="text-green-400 text-xl font-bold">
                        $
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">
                        Planning Time Saved
                      </p>
                      <p className="text-2xl font-bold">
                        {userInsights.savedTime}
                      </p>
                    </div>
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-amber-500/20">
                      <Clock className="h-6 w-6 text-amber-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-lg border-white/10 border-dashed md:col-span-2">
                <CardHeader>
                  <CardTitle>Complete Your Profile</CardTitle>
                  <CardDescription>
                    Enhance your recommendations by completing your traveler
                    profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/60">
                      Profile Completion
                    </span>
                    <span className="text-sm font-medium">75%</span>
                  </div>
                  <Progress value={75} className="h-2 bg-white/10" />

                  <ul className="mt-6 space-y-2">
                    <li className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-white/70">
                        Basic information complete
                      </span>
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-white/70">
                        Travel preferences added
                      </span>
                    </li>
                    <li className="flex items-center text-sm text-white/40">
                      <XCircle className="h-4 w-4 text-white/40 mr-2" />
                      <span>Connect calendar for trip scheduling</span>
                    </li>
                    <li className="flex items-center text-sm text-white/40">
                      <XCircle className="h-4 w-4 text-white/40 mr-2" />
                      <span>Add payment method for seamless booking</span>
                    </li>
                  </ul>

                  <Button
                    className="mt-6 bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink hover:opacity-90"
                    type="button"
                    onClick={() => {
                      console.log("Direct navigation to /preferences");
                      window.location.href = "/preferences";
                    }}
                  >
                    Travel Preferences
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer - RESTORED proper placement from 1443884 */}
      <div className="mt-auto relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export { Dashboard };
