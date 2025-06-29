import React from "react";
import { Button } from "@/ui/atoms/Button";
import { Calendar } from "lucide-react";
import { Card, CardContent } from "@/ui/atoms/Card";
import { Progress } from "@/components/ui/progress";

// Trip type definition
interface Trip {
  id: number;
  destination: string;
  dates: string;
  image: string;
  progress: number;
  status: string;
}

interface TripCardProps {
  trip: Trip;
}

export const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <Card className="relative bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden transition-all duration-300 transform group-hover:scale-105">
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={trip.image}
            alt={trip.destination}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          <div className="absolute bottom-4 left-4">
            <h3 className="text-white font-bold text-xl mb-1">
              {trip.destination}
            </h3>
            <div className="flex items-center text-white/80 text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{trip.dates}</span>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-white/70 font-medium">
              Planning Progress
            </span>
            <span className="text-sm font-bold text-white">
              {trip.progress}%
            </span>
          </div>
          <Progress
            value={trip.progress}
            className="h-3 bg-white/10 rounded-full mb-4"
          />
          <div className="flex items-center justify-between">
            <span
              className={`text-sm px-3 py-1 rounded-full font-medium ${
                trip.status === "Confirmed" 
                  ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              }`}
            >
              {trip.status}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Export the Trip type for reuse
export type { Trip }; 