
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const SavedTrips: React.FC = () => {
  const navigate = useNavigate();
  
  // Sample saved trips data
  const savedTrips = [
    {
      id: 1,
      title: "Weekend in Paris",
      dates: "June 12-15, 2025",
      description: "A romantic getaway in the city of lights.",
      image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2070&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Beach Vacation in Bali",
      dates: "August 5-15, 2025",
      description: "Relaxing on the beautiful beaches of Bali.",
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2938&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "Hiking in Switzerland",
      dates: "July 20-27, 2025",
      description: "Exploring the Swiss Alps and mountain villages.",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
    }
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Saved Trips</h1>
        <Button 
          onClick={() => navigate('/chat')}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-5 w-5" />
          Create New Trip
        </Button>
      </div>

      {savedTrips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedTrips.map(trip => (
            <Card key={trip.id} className="overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img 
                  src={trip.image} 
                  alt={trip.title} 
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <CardHeader>
                <CardTitle>{trip.title}</CardTitle>
                <CardDescription>{trip.dates}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{trip.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">View Details</Button>
                <Button variant="ghost" size="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bookmark"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <h3 className="text-2xl font-medium mb-2">No saved trips yet</h3>
          <p className="text-muted-foreground mb-6">Start planning your next adventure!</p>
          <Button 
            onClick={() => navigate('/chat')}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-5 w-5" />
            Create New Trip
          </Button>
        </div>
      )}
    </div>
  );
};

export { SavedTrips };
