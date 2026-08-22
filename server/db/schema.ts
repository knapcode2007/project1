import mongoose, { Schema } from 'mongoose';

// ----------------------------------------------------
// 1. User Interface & Schema
// ----------------------------------------------------
export interface IUserPreferences {
  theme: 'light' | 'dark' | 'system';
  currency: string;
  notificationsEnabled: boolean;
  travelStyle: 'Backpacker' | 'Balanced' | 'Luxury' | 'Nature & Hiking';
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin';
  preferences: IUserPreferences;
  savedDestinations: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = new Schema<IUser>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    preferences: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
      currency: { type: String, default: 'JPY' },
      notificationsEnabled: { type: Boolean, default: true },
      travelStyle: { type: String, enum: ['Backpacker', 'Balanced', 'Luxury', 'Nature & Hiking'], default: 'Balanced' },
    },
    savedDestinations: [{ type: String }],
  },
  { timestamps: true, _id: false }
);

// ----------------------------------------------------
// 2. Activity Interface & Schema
// ----------------------------------------------------
export interface IChecklistItem {
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

export type ActivityTimeSlot =
  | 'Morning'
  | 'Afternoon'
  | 'Sunset'
  | 'Evening'
  | 'Night'
  | string;

export interface IActivity {
  _id: string;
  tripId: string;
  destinationId?: string;
  title: string;
  category: ActivityCategory;
  date: string;
  timeSlot: ActivityTimeSlot;
  startTime?: string;
  endTime?: string;
  location?: string;
  cost?: string;
  notes?: string;
  checklist: IChecklistItem[];
  status: 'planned' | 'completed' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

export const ChecklistItemSchema = new Schema<IChecklistItem>(
  {
    id: { type: String, required: true },
    text: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
    category: { type: String, default: 'General' },
  },
  { _id: false }
);

export const ActivitySchema = new Schema<IActivity>(
  {
    _id: { type: String, required: true },
    tripId: { type: String, required: true, index: true },
    destinationId: { type: String, default: '' },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Sightseeing', 'Hiking', 'Dining', 'Transport', 'Culture', 'Relaxation', 'Adventure'],
      default: 'Sightseeing',
    },
    date: { type: String, required: true },
    timeSlot: { type: String, required: true },
    startTime: { type: String, default: '' },
    endTime: { type: String, default: '' },
    location: { type: String, default: '' },
    cost: { type: String, default: '' },
    notes: { type: String, default: '' },
    checklist: [ChecklistItemSchema],
    status: {
      type: String,
      enum: ['planned', 'completed', 'cancelled'],
      default: 'planned',
    },
  },
  { timestamps: true, _id: false }
);

// ----------------------------------------------------
// 3. Trip Interface & Schema
// ----------------------------------------------------
export interface ITrip {
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
  activities: IActivity[];
  createdAt?: Date;
  updatedAt?: Date;
}

export const TripSchema = new Schema<ITrip>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    destinationId: { type: String, required: true },
    destinationName: { type: String, required: true },
    destinationCategory: { type: String, default: 'Mountain' },
    coverImage: { type: String, required: true },
    location: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, default: '' },
    status: {
      type: String,
      enum: ['planning', 'confirmed', 'completed'],
      default: 'planning',
    },
    budget: { type: String, default: '' },
    currency: { type: String, default: 'JPY' },
    notes: { type: String, default: '' },
  },
  { timestamps: true, _id: false }
);

// ----------------------------------------------------
// 4. Destination & Review Interfaces & Schemas
// ----------------------------------------------------
export interface ITrail {
  id: string;
  name: string;
  distance: string;
  duration: string;
  elevationGain: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging' | 'Strenuous';
  description: string;
}

export interface ITransitOption {
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

export interface IDestinationWeather {
  temperature: string;
  condition: string;
  visibility: string;
  windSpeed: string;
  trailStatus: 'Open - Good Conditions' | 'Caution - High Winds' | 'Closed - Off Season';
  lastUpdated: string;
}

export interface IReview {
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

export interface IDestination {
  _id?: string;
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
  weather: IDestinationWeather;
  trails: ITrail[];
  transitOptions: ITransitOption[];
  reviews: IReview[];
  createdAt?: Date;
  updatedAt?: Date;
}

export const ReviewSchema = new Schema<IReview>(
  {
    id: { type: String, required: true },
    author: { type: String, required: true },
    avatarInitial: { type: String, default: 'A' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    date: { type: String, required: true },
    content: { type: String, required: true },
    helpfulCount: { type: Number, default: 0 },
    userVotedHelpful: { type: Boolean, default: false },
    tags: [{ type: String }],
  },
  { _id: false }
);

export const DestinationSchema = new Schema<IDestination>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    country: { type: String, required: true },
    category: { type: String, required: true },
    subCategory: { type: String },
    coverImage: { type: String, required: true },
    mapImage: { type: String, required: true },
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 0 },
    elevation: { type: String, default: '' },
    description: { type: String, required: true },
    openingHours: { type: String, default: '24 Hours' },
    openingHoursDetail: { type: String },
    entryFee: { type: String, default: 'Free' },
    entryFeeDetail: { type: String },
    season: { type: String, default: 'All Year' },
    location: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    tags: [{ type: String }],
    weather: {
      temperature: { type: String, default: '14°C' },
      condition: { type: String, default: 'Clear' },
      visibility: { type: String, default: '10 km' },
      windSpeed: { type: String, default: '12 km/h' },
      trailStatus: { type: String, default: 'Open - Good Conditions' },
      lastUpdated: { type: String, default: 'Live' },
    },
    trails: [
      {
        id: String,
        name: String,
        distance: String,
        duration: String,
        elevationGain: String,
        difficulty: String,
        description: String,
      },
    ],
    transitOptions: [
      {
        id: String,
        mode: String,
        from: String,
        to: String,
        duration: String,
        estimatedCost: String,
        frequency: String,
        steps: [String],
        recommendedFor: String,
      },
    ],
    reviews: [ReviewSchema],
  },
  { timestamps: true }
);

// Mongoose Models
export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const TripModel = mongoose.models.Trip || mongoose.model<ITrip>('Trip', TripSchema);
export const ActivityModel = mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);
export const DestinationModel = mongoose.models.Destination || mongoose.model<IDestination>('Destination', DestinationSchema);
