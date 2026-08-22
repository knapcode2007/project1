import mongoose from 'mongoose';
import {
  IUser,
  ITrip,
  IActivity,
  IDestination,
  IReview,
  UserModel,
  TripModel,
  ActivityModel,
  DestinationModel,
  ActivityCategory,
} from './schema';
import { INITIAL_DESTINATIONS } from '../../src/data/destinations';

let isMongoConnected = false;

// In-Memory Document Store
class MemoryStore {
  user: IUser = {
    _id: 'usr_default_01',
    name: 'Explorer Kenji',
    email: 'kenji.wanderlust@zenithtravel.jp',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    role: 'user',
    preferences: {
      theme: 'light',
      currency: 'JPY',
      notificationsEnabled: true,
      travelStyle: 'Nature & Hiking',
    },
    savedDestinations: ['mount-fuji', 'lake-kawaguchiko', 'chureito-pagoda'],
    createdAt: new Date('2026-01-15T00:00:00.000Z'),
    updatedAt: new Date(),
  };

  destinations: IDestination[] = JSON.parse(JSON.stringify(INITIAL_DESTINATIONS));

  trips: ITrip[] = [
    {
      _id: 'trip_fuji_summit_2026',
      userId: 'usr_default_01',
      title: 'Mount Fuji Iconic Summit Expedition',
      destinationId: 'mount-fuji',
      destinationName: 'Mount Fuji',
      destinationCategory: 'Mountain & Volcano',
      coverImage: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=1200&q=80',
      location: 'Kitayama, Fujinomiya, Shizuoka',
      startDate: '2026-08-25',
      endDate: '2026-08-28',
      status: 'planning',
      budget: '¥45,000',
      currency: 'JPY',
      notes: 'Remember trekking poles, headlamp with extra batteries, and mountain hut reservation for 8th station.',
      activities: [],
      createdAt: new Date('2026-08-10T12:00:00.000Z'),
      updatedAt: new Date(),
    },
    {
      _id: 'trip_fuji_lakes_2026',
      userId: 'usr_default_01',
      title: 'Fuji Five Lakes Scenic Road Trip',
      destinationId: 'lake-kawaguchiko',
      destinationName: 'Lake Kawaguchiko',
      destinationCategory: 'Lakes & Onsen',
      coverImage: 'https://images.unsplash.com/photo-1570459027562-4a916cc6113f?auto=format&fit=crop&w=1200&q=80',
      location: 'Fujikawaguchiko, Minamitsuru District, Yamanashi',
      startDate: '2026-09-12',
      endDate: '2026-09-14',
      status: 'planning',
      budget: '¥30,000',
      currency: 'JPY',
      notes: 'Rent bicycle around the lake, visit Chureito Pagoda at early sunrise.',
      activities: [],
      createdAt: new Date('2026-08-15T09:30:00.000Z'),
      updatedAt: new Date(),
    },
  ];

  activities: IActivity[] = [
    {
      _id: 'act_fuji_01',
      tripId: 'trip_fuji_summit_2026',
      destinationId: 'mount-fuji',
      title: '5th Station Trailhead Check-in & Acclimatization',
      category: 'Hiking',
      date: '2026-08-25',
      timeSlot: 'Morning',
      startTime: '08:30',
      endTime: '11:00',
      location: 'Subaru Line 5th Station (2,305m)',
      cost: '¥2,000 Conservation Fee',
      notes: 'Spend at least 1-2 hours at 5th station to adjust to elevation before starting Yoshida Trail.',
      checklist: [
        { id: 'chk-f1', text: 'Pay ¥2,000 mountain conservation fee', completed: true, category: 'Permit' },
        { id: 'chk-f2', text: 'Buy wooden pilgrim hiking stick (Kongo-zue)', completed: true, category: 'Souvenir' },
        { id: 'chk-f3', text: 'Fill water bottles (2L min)', completed: false, category: 'Gear' },
      ],
      status: 'planned',
      createdAt: new Date('2026-08-10T12:05:00.000Z'),
      updatedAt: new Date(),
    },
    {
      _id: 'act_fuji_02',
      tripId: 'trip_fuji_summit_2026',
      destinationId: 'mount-fuji',
      title: 'Ascend to 8th Station Mountain Hut',
      category: 'Hiking',
      date: '2026-08-25',
      timeSlot: 'Afternoon',
      startTime: '11:30',
      endTime: '16:30',
      location: 'Yoshida Trail - 8th Station',
      cost: '¥9,800 Hut Stay',
      notes: 'Pace carefully over rocky switchbacks. Rest early at hut before 2 AM summit push.',
      checklist: [
        { id: 'chk-f4', text: 'Rainproof jacket & pants handy', completed: false, category: 'Gear' },
        { id: 'chk-f5', text: 'Headlamp with spare batteries in pocket', completed: false, category: 'Gear' },
        { id: 'chk-f6', text: 'Small 100-yen coins for station toilets', completed: false, category: 'Cash' },
      ],
      status: 'planned',
      createdAt: new Date('2026-08-10T12:10:00.000Z'),
      updatedAt: new Date(),
    },
    {
      _id: 'act_fuji_03',
      tripId: 'trip_fuji_summit_2026',
      destinationId: 'mount-fuji',
      title: 'Goraiko (Sunrise) at Mount Fuji Summit',
      category: 'Sightseeing',
      date: '2026-08-26',
      timeSlot: 'Night',
      startTime: '02:00',
      endTime: '05:30',
      location: 'Kengamine Peak (3,776m)',
      cost: 'Free',
      notes: 'Experience the mystical rising sun above the sea of clouds from Japan highest peak.',
      checklist: [
        { id: 'chk-f7', text: 'Warm fleece, beanie & thermal gloves', completed: false, category: 'Clothing' },
        { id: 'chk-f8', text: 'Camera / smartphone power bank (cold drains battery)', completed: false, category: 'Tech' },
      ],
      status: 'planned',
      createdAt: new Date('2026-08-10T12:15:00.000Z'),
      updatedAt: new Date(),
    },
    {
      _id: 'act_lake_01',
      tripId: 'trip_fuji_lakes_2026',
      destinationId: 'chureito-pagoda',
      title: 'Chureito Pagoda Early Sunrise Photography',
      category: 'Sightseeing',
      date: '2026-09-12',
      timeSlot: 'Morning',
      startTime: '05:30',
      endTime: '08:00',
      location: 'Arakura Fuji Sengen Shrine',
      cost: 'Free',
      notes: 'Climb 398 stone steps for the world-famous view of the 5-story pagoda framing Mount Fuji.',
      checklist: [
        { id: 'chk-l1', text: 'Camera tripod & wide angle lens', completed: false, category: 'Tech' },
        { id: 'chk-l2', text: 'Comfortable walking shoes', completed: true, category: 'Gear' },
      ],
      status: 'planned',
      createdAt: new Date('2026-08-15T09:40:00.000Z'),
      updatedAt: new Date(),
    },
  ];
}

const memoryStore = new MemoryStore();

/**
 * Initialize MongoDB Connection if URI is supplied, else fallback to memory
 */
export async function initDatabase(): Promise<boolean> {
  const mongoUri = process.env.MONGODB_URI;

  if (mongoUri && mongoUri.trim().length > 0) {
    try {
      console.log('Connecting to MongoDB database...');
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });
      isMongoConnected = true;
      console.log('✅ Connected to MongoDB successfully.');
      return true;
    } catch (err: any) {
      console.warn('⚠️ MongoDB connection failed. Falling back to in-memory store:', err.message);
      isMongoConnected = false;
      return false;
    }
  } else {
    console.log('ℹ️ No MONGODB_URI provided. Running with in-memory Document Engine.');
    isMongoConnected = false;
    return false;
  }
}

/**
 * Unified DataStore Layer
 */
export const DataStore = {
  // Check store engine status
  isMongoActive(): boolean {
    return isMongoConnected;
  },

  // ---------------- User Operations ----------------
  async getUser(): Promise<IUser> {
    if (isMongoConnected) {
      try {
        const user = await UserModel.findOne().lean();
        if (user) return user as unknown as IUser;
      } catch (err) {
        console.warn('Mongo getUser error:', err);
      }
    }
    return memoryStore.user;
  },

  async updateUser(updates: Partial<IUser>): Promise<IUser> {
    memoryStore.user = {
      ...memoryStore.user,
      ...updates,
      updatedAt: new Date(),
    };

    if (isMongoConnected) {
      try {
        await (UserModel as any).findOneAndUpdate(
          { _id: memoryStore.user._id },
          { $set: updates },
          { new: true, upsert: true }
        );
      } catch (err) {
        console.warn('Mongo updateUser error:', err);
      }
    }

    return memoryStore.user;
  },

  // ---------------- Destinations Operations ----------------
  async getDestinations(query?: string, category?: string): Promise<IDestination[]> {
    if (isMongoConnected) {
      try {
        const filter: any = {};
        if (category && category !== 'All') {
          filter.category = category;
        }
        if (query) {
          filter.$or = [
            { name: { $regex: query, $options: 'i' } },
            { location: { $regex: query, $options: 'i' } },
            { tags: { $in: [new RegExp(query, 'i')] } },
          ];
        }
        const list = await DestinationModel.find(filter).lean();
        if (list && list.length > 0) return list as unknown as IDestination[];
      } catch (err) {
        console.warn('Mongo getDestinations error:', err);
      }
    }

    // Memory filter
    let results = memoryStore.destinations;
    if (category && category !== 'All') {
      results = results.filter((d) => d.category === category);
    }
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.location.toLowerCase().includes(q) ||
          d.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return results;
  },

  async getDestinationById(id: string): Promise<IDestination | null> {
    if (isMongoConnected) {
      try {
        const dest = await (DestinationModel as any).findOne({ id }).lean();
        if (dest) return dest as unknown as IDestination;
      } catch (err) {
        console.warn('Mongo getDestinationById error:', err);
      }
    }
    return memoryStore.destinations.find((d) => d.id === id) || null;
  },

  async addReviewToDestination(
    destId: string,
    reviewData: Omit<IReview, 'id' | 'date' | 'helpfulCount' | 'userVotedHelpful'>
  ): Promise<{ destination: IDestination; review: IReview }> {
    const newReview: IReview = {
      ...reviewData,
      id: 'rev_' + Date.now() + Math.random().toString(36).substring(2, 5),
      date: 'Just now',
      helpfulCount: 0,
      userVotedHelpful: false,
    };

    const dest = memoryStore.destinations.find((d) => d.id === destId);
    if (!dest) {
      throw new Error(`Destination with id "${destId}" not found`);
    }

    dest.reviews = [newReview, ...dest.reviews];
    dest.reviewCount += 1;
    dest.rating = Number(
      (dest.reviews.reduce((sum, r) => sum + r.rating, 0) / dest.reviews.length).toFixed(1)
    );
    dest.updatedAt = new Date();

    if (isMongoConnected) {
      try {
        await DestinationModel.updateOne(
          { id: destId },
          {
            $push: { reviews: { $each: [newReview], $position: 0 } },
            $inc: { reviewCount: 1 },
            $set: { rating: dest.rating },
          }
        );
      } catch (err) {
        console.warn('Mongo addReview error:', err);
      }
    }

    return { destination: dest, review: newReview };
  },

  async toggleReviewHelpful(destId: string, reviewId: string): Promise<IReview | null> {
    const dest = memoryStore.destinations.find((d) => d.id === destId);
    if (!dest) return null;
    const review = dest.reviews.find((r) => r.id === reviewId);
    if (!review) return null;

    review.userVotedHelpful = !review.userVotedHelpful;
    review.helpfulCount += review.userVotedHelpful ? 1 : -1;
    return review;
  },

  // ---------------- Trips Operations ----------------
  async getTrips(): Promise<ITrip[]> {
    // Populate activities into each trip
    return memoryStore.trips.map((trip) => {
      const tripActivities = memoryStore.activities.filter((a) => a.tripId === String(trip._id));
      return {
        ...trip,
        activities: tripActivities,
      };
    });
  },

  async getTripById(tripId: string): Promise<ITrip | null> {
    const trip = memoryStore.trips.find((t) => String(t._id) === tripId);
    if (!trip) return null;
    const tripActivities = memoryStore.activities.filter((a) => a.tripId === tripId);
    return {
      ...trip,
      activities: tripActivities,
    };
  },

  async createTrip(data: {
    title: string;
    destinationId: string;
    destinationName?: string;
    destinationCategory?: string;
    coverImage?: string;
    location?: string;
    startDate: string;
    endDate?: string;
    budget?: string;
    currency?: string;
    notes?: string;
  }): Promise<ITrip> {
    const destination = memoryStore.destinations.find((d) => d.id === data.destinationId);

    const newTrip: ITrip = {
      _id: 'trip_' + Date.now() + Math.random().toString(36).substring(2, 6),
      userId: memoryStore.user._id,
      title: data.title,
      destinationId: data.destinationId,
      destinationName: data.destinationName || destination?.name || 'Destination',
      destinationCategory: data.destinationCategory || destination?.category || 'Explore',
      coverImage:
        data.coverImage ||
        destination?.coverImage ||
        'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=1200&q=80',
      location: data.location || destination?.location || 'Japan',
      startDate: data.startDate,
      endDate: data.endDate || data.startDate,
      status: 'planning',
      budget: data.budget || '',
      currency: data.currency || 'JPY',
      notes: data.notes || '',
      activities: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryStore.trips.unshift(newTrip);

    if (isMongoConnected) {
      try {
        await TripModel.create(newTrip);
      } catch (err) {
        console.warn('Mongo createTrip error:', err);
      }
    }

    return newTrip;
  },

  async updateTrip(tripId: string, updates: Partial<ITrip>): Promise<ITrip | null> {
    const index = memoryStore.trips.findIndex((t) => String(t._id) === tripId);
    if (index === -1) return null;

    const updated = {
      ...memoryStore.trips[index],
      ...updates,
      updatedAt: new Date(),
    };

    memoryStore.trips[index] = updated;

    if (isMongoConnected) {
      try {
        await TripModel.updateOne({ _id: tripId }, { $set: updates });
      } catch (err) {
        console.warn('Mongo updateTrip error:', err);
      }
    }

    const tripActivities = memoryStore.activities.filter((a) => a.tripId === tripId);
    return {
      ...updated,
      activities: tripActivities,
    };
  },

  async deleteTrip(tripId: string): Promise<boolean> {
    const initialLen = memoryStore.trips.length;
    memoryStore.trips = memoryStore.trips.filter((t) => String(t._id) !== tripId);
    memoryStore.activities = memoryStore.activities.filter((a) => a.tripId !== tripId);

    if (isMongoConnected) {
      try {
        await TripModel.deleteOne({ _id: tripId });
        await ActivityModel.deleteMany({ tripId });
      } catch (err) {
        console.warn('Mongo deleteTrip error:', err);
      }
    }

    return memoryStore.trips.length < initialLen;
  },

  // ---------------- Activities Operations ----------------
  async getActivitiesForTrip(tripId: string): Promise<IActivity[]> {
    return memoryStore.activities.filter((a) => a.tripId === tripId);
  },

  async addActivityToTrip(
    tripId: string,
    activityData: {
      title: string;
      category: ActivityCategory;
      date: string;
      timeSlot: string;
      startTime?: string;
      endTime?: string;
      location?: string;
      cost?: string;
      notes?: string;
      checklist?: Array<{ id?: string; text: string; completed?: boolean; category?: string }>;
      destinationId?: string;
    }
  ): Promise<{ activity: IActivity; trip: ITrip }> {
    const trip = memoryStore.trips.find((t) => String(t._id) === tripId);
    if (!trip) {
      throw new Error(`Trip with id "${tripId}" not found`);
    }

    const newActivity: IActivity = {
      _id: 'act_' + Date.now() + Math.random().toString(36).substring(2, 6),
      tripId,
      destinationId: activityData.destinationId || trip.destinationId,
      title: activityData.title,
      category: activityData.category,
      date: activityData.date,
      timeSlot: activityData.timeSlot,
      startTime: activityData.startTime || '',
      endTime: activityData.endTime || '',
      location: activityData.location || trip.location,
      cost: activityData.cost || '',
      notes: activityData.notes || '',
      checklist: (activityData.checklist || []).map((c) => ({
        id: c.id || 'chk-' + Date.now() + Math.random().toString(36).substring(2, 5),
        text: c.text,
        completed: !!c.completed,
        category: c.category || 'Gear',
      })),
      status: 'planned',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryStore.activities.push(newActivity);
    trip.updatedAt = new Date();

    if (isMongoConnected) {
      try {
        await ActivityModel.create(newActivity);
      } catch (err) {
        console.warn('Mongo createActivity error:', err);
      }
    }

    const updatedTrip = await this.getTripById(tripId);
    return { activity: newActivity, trip: updatedTrip! };
  },

  async updateActivity(
    tripId: string,
    activityId: string,
    updates: Partial<IActivity>
  ): Promise<{ activity: IActivity; trip: ITrip } | null> {
    const index = memoryStore.activities.findIndex((a) => String(a._id) === activityId);
    if (index === -1) return null;

    const updatedActivity = {
      ...memoryStore.activities[index],
      ...updates,
      updatedAt: new Date(),
    };

    memoryStore.activities[index] = updatedActivity;

    if (isMongoConnected) {
      try {
        await ActivityModel.updateOne({ _id: activityId }, { $set: updates });
      } catch (err) {
        console.warn('Mongo updateActivity error:', err);
      }
    }

    const updatedTrip = await this.getTripById(tripId);
    return { activity: updatedActivity, trip: updatedTrip! };
  },

  async deleteActivity(
    tripId: string,
    activityId: string
  ): Promise<{ trip: ITrip } | null> {
    memoryStore.activities = memoryStore.activities.filter((a) => String(a._id) !== activityId);

    if (isMongoConnected) {
      try {
        await ActivityModel.deleteOne({ _id: activityId });
      } catch (err) {
        console.warn('Mongo deleteActivity error:', err);
      }
    }

    const updatedTrip = await this.getTripById(tripId);
    if (!updatedTrip) return null;
    return { trip: updatedTrip };
  },

  // ---------------- Bookmarks Operations ----------------
  async getBookmarks(): Promise<string[]> {
    return memoryStore.user.savedDestinations;
  },

  async toggleBookmark(destinationId: string): Promise<{ bookmarked: boolean; bookmarks: string[] }> {
    const saved = memoryStore.user.savedDestinations;
    const exists = saved.includes(destinationId);

    if (exists) {
      memoryStore.user.savedDestinations = saved.filter((id) => id !== destinationId);
    } else {
      memoryStore.user.savedDestinations = [...saved, destinationId];
    }
    memoryStore.user.updatedAt = new Date();

    if (isMongoConnected) {
      try {
        await UserModel.updateOne(
          { _id: memoryStore.user._id },
          { $set: { savedDestinations: memoryStore.user.savedDestinations } }
        );
      } catch (err) {
        console.warn('Mongo bookmark error:', err);
      }
    }

    return {
      bookmarked: !exists,
      bookmarks: memoryStore.user.savedDestinations,
    };
  },

  // ---------------- Debug / Inspection State ----------------
  getDebugState() {
    return {
      engine: isMongoConnected ? 'MongoDB' : 'In-Memory Engine',
      userCount: 1,
      tripsCount: memoryStore.trips.length,
      activitiesCount: memoryStore.activities.length,
      destinationsCount: memoryStore.destinations.length,
      bookmarksCount: memoryStore.user.savedDestinations.length,
    };
  },
};
