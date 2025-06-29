import React from "react";
import { Button } from "@/ui/atoms/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/atoms/Card";
import { PlusCircle, ArrowLeft, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SavedTrips = () => {
  const navigate = useNavigate();

  // Sample saved trips data
  const savedTrips = [
    {
      id: 1,
      title: "Weekend in Paris",
      dates: "June 12-15, 2025",
      description: "A romantic getaway in the city of lights.",
      image:
        "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2070&auto=format&fit=crop",
    },
    {
      id: 2,
      title: "Beach Vacation in Bali",
      dates: "August 5-15, 2025",
      description: "Relaxing on the beautiful beaches of Bali.",
      image:
        "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2938&auto=format&fit=crop",
    },
    {
      id: 3,
      title: "Hiking in Switzerland",
      dates: "July 20-27, 2025",
      description: "Exploring the Swiss Alps and mountain villages.",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      {/* Modern Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto py-8 px-4 md:px-6">
        {/* Modern Header with Back Button */}
        <div className="flex items-center gap-4 mb-12">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="shrink-0 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-xl"
          >
            <ArrowLeft className="h-8 w-8" />
          </Button>
          <div className="flex justify-between items-center w-full">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
                Saved Trips
              </h1>
              <p className="text-white/60 mt-2">Your collection of planned adventures</p>
            </div>
            <Button
              onClick={() => navigate("/chat")}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
            >
              <PlusCircle className="h-5 w-5" />
              Create New Trip
            </Button>
          </div>
        </div>

        {savedTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {savedTrips.map((trip) => (
              <div key={trip.id} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Card className="relative bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden transition-all duration-300 transform group-hover:scale-105">
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={trip.image}
                      alt={trip.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-4 left-4">
                      <h3 className="text-white font-bold text-xl mb-1">
                        {trip.title}
                      </h3>
                      <div className="flex items-center text-white/80 text-sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{trip.dates}</span>
                      </div>
                    </div>
                  </div>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white text-lg">{trip.title}</CardTitle>
                    <CardDescription className="text-white/70">{trip.dates}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-white/80 text-sm leading-relaxed">{trip.description}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-0">
                    <Button 
                      variant="outline" 
                      className="border-white/30 bg-white/10 hover:bg-white/20 text-white transition-all duration-300"
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-xl"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-bookmark"
                      >
                        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                      </svg>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-500/20 to-slate-400/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Card className="relative bg-black/30 backdrop-blur-xl border-2 border-dashed border-white/30 rounded-2xl">
              <CardContent className="text-center py-20">
                <div className="p-4 bg-gradient-to-br from-slate-500/20 to-slate-400/20 rounded-2xl border border-slate-400/30 inline-block mb-6">
                  <PlusCircle className="h-16 w-16 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">No saved trips yet</h3>
                <p className="text-white/70 mb-8 text-lg max-w-md mx-auto">
                  Start planning your next adventure and save your favorite destinations!
                </p>
                <Button
                  onClick={() => navigate("/chat")}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 mx-auto"
                >
                  <PlusCircle className="h-5 w-5" />
                  Create New Trip
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export { SavedTrips };
