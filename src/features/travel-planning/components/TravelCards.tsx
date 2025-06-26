import React from 'react';
import { Star, MapPin, Plane } from 'lucide-react';
import { Badge } from '@/components/ui/badge'; // Using shadcn/ui Badge

// Define a simplified Destination interface for UI presentation purposes
export interface TravelCardDestination {
  id: number;
  destination: string;
  departureFrom: string;
  airline: string;
  price: string;
  rating: number;
  dates: string;
  deal: string;
  accommodationType: string;
  image: string;
}

export interface TravelCardsProps {
  customDestinations?: TravelCardDestination[];
  onViewAllClick?: () => void;
  onExploreMoreClick?: () => void;
  limit?: number;
}

const TravelCards: React.FC<TravelCardsProps> = ({ 
  customDestinations,
  onViewAllClick,
  onExploreMoreClick,
  limit
}) => {
  const defaultDestinations = [
    {
      id: 1,
      destination: 'Barcelona, Spain',
      departureFrom: 'New York, USA',
      airline: 'Delta Airlines',
      price: '€1,120',
      rating: 4.8,
      dates: 'Aug 15 - Aug 23',
      deal: 'Best Value',
      accommodationType: 'Boutique Hotel',
      image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=1000&auto=format&fit=crop',
    },
    {
      id: 2,
      destination: 'Tokyo, Japan',
      departureFrom: 'San Francisco, USA',
      airline: 'Japan Airlines',
      price: '€1,450',
      rating: 4.9,
      dates: 'Sept 5 - Sept 15',
      deal: 'Trending',
      accommodationType: 'Modern Apartment',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1000&auto=format&fit=crop',
    },
    {
      id: 3,
      destination: 'Bali, Indonesia',
      departureFrom: 'Los Angeles, USA',
      airline: 'Singapore Airlines',
      price: '€1,320',
      rating: 4.7,
      dates: 'Oct 10 - Oct 20',
      deal: 'Popular',
      accommodationType: 'Private Villa',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1000&auto=format&fit=crop',
    }
  ];

  let destinations = customDestinations || defaultDestinations;
  
  // Apply limit if provided
  if (limit && limit > 0 && limit < destinations.length) {
    destinations = destinations.slice(0, limit);
  }
  
  const handleViewAllClick = () => {
    if (onViewAllClick) {
      onViewAllClick();
    }
  };
  
  const handleExploreMoreClick = () => {
    if (onExploreMoreClick) {
      onExploreMoreClick();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Suggested Destinations</h3>
        <button 
          className="text-xs text-planora-accent-purple"
          onClick={handleViewAllClick}
        >
          View All
        </button>
      </div>
      
      {destinations.map((destination) => (
        <div 
          key={destination.id} 
          className="bg-white/5 p-4 rounded-xl border border-white/10 hover:border-planora-accent-purple/40 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
              <img src={destination.image} alt={destination.destination} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm flex items-center">
                  <MapPin className="w-3 h-3 mr-1 text-planora-accent-pink" />
                  {destination.destination}
                </h4>
                <Badge 
                  variant="secondary" 
                  className="text-xs bg-planora-accent-purple/20 text-planora-accent-purple"
                >
                  {destination.deal}
                </Badge>
              </div>
              <div className="flex items-center text-xs text-white/60 mt-1">
                <Plane className="w-3 h-3 mr-1" />
                <span>{destination.departureFrom}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center">
                  <Star className="w-3 h-3 text-amber-400" />
                  <span className="text-xs ml-1">{destination.rating}</span>
                </div>
                <span className="text-sm font-semibold text-planora-accent-purple">{destination.price}</span>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-white/60">
                <span>{destination.dates}</span>
                <span>{destination.airline}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <div className="w-full p-4 rounded-xl border border-dashed border-white/20 flex items-center justify-center">
        <button 
          className="text-sm text-planora-accent-purple"
          onClick={handleExploreMoreClick}
        >
          + Explore More Options
        </button>
      </div>
    </div>
  );
};

export { TravelCards };
