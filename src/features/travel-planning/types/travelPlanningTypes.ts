/**
 * Type definitions for the travel-planning feature
 */

export interface TravelPlan {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  destinations: Destination[];
  budget?: Budget;
  activities: Activity[];
  accommodation?: Accommodation[];
  transportation?: Transportation[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  arrivalDate: Date;
  departureDate: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  latitude: number;
  longitude: number;
  description?: string;
  imageUrl?: string;
}

export interface Activity {
  id: string;
  title: string;
  description?: string;
  date: Date;
  time?: string;
  duration?: number; // in minutes
  location?: string;
  cost?: number;
  currency?: string;
  category?: string;
  imageUrl?: string;
  destinationId: string;
}

export interface Budget {
  total: number;
  spent: number;
  currency: string;
  categories: {
    accommodation: number;
    transportation: number;
    food: number;
    activities: number;
    shopping: number;
    other: number;
  };
  accommodation: number;
  transportation: number;
  food: number;
  activities: number;
  shopping: number;
  other: number;
}

export interface Accommodation {
  id: string;
  name: string;
  type: 'hotel' | 'hostel' | 'apartment' | 'resort' | 'camping' | 'other';
  checkIn: Date;
  checkOut: Date;
  location: string;
  cost?: number;
  currency?: string;
  destinationId: string;
  bookingReference?: string;
  contact?: string;
}

export interface Transportation {
  id: string;
  type: 'flight' | 'train' | 'bus' | 'car' | 'ferry' | 'other';
  departureLocation: string;
  arrivalLocation: string;
  departureDate: Date;
  departureTime?: string;
  arrivalDate: Date;
  arrivalTime?: string;
  reference?: string;
  cost?: number;
  currency?: string;
  notes?: string;
}
