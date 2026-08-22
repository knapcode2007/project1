export interface Trail {
  id: string;
  name: string;
  distance: string;
  duration: string;
  elevationGain: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging' | 'Strenuous';
  description: string;
}

export interface TransitOption {
  id: string;
  mode: 'Direct Bus' | 'Train & Bus' | 'Express Train' | 'Car / Taxi';
  from: string;
  to: string;
  duration: string;
  estimatedCost: string;
  frequency: string;
  steps: string[];
  recommendedFor: string;
}

export interface DestinationWeather {
  temperature: string;
  condition: string;
  visibility: string;
  windSpeed: string;
  trailStatus: 'Open - Good Conditions' | 'Caution - High Winds' | 'Closed - Off Season';
  lastUpdated: string;
}

export interface Review {
  id: string;
  author: string;
  avatarInitial: string;
  rating: number;
  date: string;
  content: string;
  helpfulCount: number;
  userVotedHelpful?: boolean;
  tags?: string[];
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  category: string;
  subCategory?: string;
  coverImage: string;
  mapImage: string;
  rating: number;
  reviewCount: number;
  elevation: string;
  description: string;
  openingHours: string;
  openingHoursDetail?: string;
  entryFee: string;
  entryFeeDetail?: string;
  season: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  tags: string[];
  weather: DestinationWeather;
  trails: Trail[];
  transitOptions: TransitOption[];
  reviews: Review[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  category?: string;
}

export type ActivityCategory =
  | 'Sightseeing'
  | 'Hiking'
  | 'Dining'
  | 'Transport'
  | 'Culture'
  | 'Relaxation'
  | 'Adventure';

export interface Activity {
  _id: string;
  tripId: string;
  destinationId?: string;
  title: string;
  category: ActivityCategory;
  date: string;
  timeSlot: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  cost?: string;
  notes?: string;
  checklist: ChecklistItem[];
  status: 'planned' | 'completed' | 'cancelled';
  createdAt?: string | number;
  updatedAt?: string | number;
}

export interface Trip {
  _id: string;
  userId: string;
  title: string;
  destinationId: string;
  destinationName: string;
  destinationCategory: string;
  coverImage: string;
  location: string;
  startDate: string;
  endDate?: string;
  status: 'planning' | 'confirmed' | 'completed';
  budget?: string;
  currency: string;
  notes?: string;
  activities: Activity[];
  createdAt?: string | number;
  updatedAt?: string | number;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  currency: string;
  notificationsEnabled: boolean;
  travelStyle: 'Backpacker' | 'Balanced' | 'Luxury' | 'Nature & Hiking';
}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin';
  preferences: UserPreferences;
  savedDestinations: string[];
}

// Backward-compatible ItineraryItem interface
export interface ItineraryItem {
  id: string;
  destinationId: string;
  destinationName: string;
  destinationCategory: string;
  coverImage: string;
  location: string;
  date: string;
  timeSlot: string;
  notes: string;
  checklist: ChecklistItem[];
  createdAt: number;
}
