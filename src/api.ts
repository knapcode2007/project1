import { Destination, Trip, Activity, User, Review } from './types';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || `HTTP error ${res.status}`,
        fieldErrors: data.fieldErrors,
      };
    }
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network request failed',
    };
  }
}

export const api = {
  // System Health
  async getHealth() {
    return fetchJson<{ status: string; engine: string }>('/api/health');
  },

  async getDebugState() {
    return fetchJson<any>('/api/debug/state');
  },

  // User Profile
  async getUser() {
    return fetchJson<User>('/api/user');
  },

  async updateUser(updates: Partial<User>) {
    return fetchJson<User>('/api/user', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  // Destinations
  async getDestinations(q?: string, category?: string) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category && category !== 'All') params.set('category', category);
    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return fetchJson<Destination[]>(`/api/destinations${queryStr}`);
  },

  async getDestination(id: string) {
    return fetchJson<Destination>(`/api/destinations/${id}`);
  },

  async addReview(destId: string, review: { author: string; rating: number; content: string; tags?: string[] }) {
    return fetchJson<Review>(`/api/destinations/${destId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(review),
    });
  },

  async toggleReviewHelpful(destId: string, reviewId: string) {
    return fetchJson<Review>(`/api/destinations/${destId}/reviews/${reviewId}/helpful`, {
      method: 'POST',
    });
  },

  // Bookmarks
  async getBookmarks() {
    return fetchJson<string[]>('/api/bookmarks');
  },

  async toggleBookmark(destinationId: string) {
    return fetchJson<{ bookmarked: boolean; bookmarks: string[] }>('/api/bookmarks/toggle', {
      method: 'POST',
      body: JSON.stringify({ destinationId }),
    });
  },

  // Trips
  async getTrips() {
    return fetchJson<Trip[]>('/api/trips');
  },

  async getTrip(id: string) {
    return fetchJson<Trip>(`/api/trips/${id}`);
  },

  async createTrip(tripData: {
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
  }) {
    return fetchJson<Trip>('/api/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    });
  },

  async updateTrip(tripId: string, updates: Partial<Trip>) {
    return fetchJson<Trip>(`/api/trips/${tripId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteTrip(tripId: string) {
    return fetchJson<{ success: boolean }>(`/api/trips/${tripId}`, {
      method: 'DELETE',
    });
  },

  // Activities
  async addActivity(tripId: string, activityData: {
    title: string;
    category: string;
    date: string;
    timeSlot: string;
    startTime?: string;
    endTime?: string;
    location?: string;
    cost?: string;
    notes?: string;
    checklist?: Array<{ text: string; completed?: boolean }>;
    destinationId?: string;
  }) {
    return fetchJson<{ activity: Activity; trip: Trip }>(`/api/trips/${tripId}/activities`, {
      method: 'POST',
      body: JSON.stringify(activityData),
    });
  },

  async updateActivity(tripId: string, activityId: string, updates: Partial<Activity>) {
    return fetchJson<{ activity: Activity; trip: Trip }>(`/api/trips/${tripId}/activities/${activityId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteActivity(tripId: string, activityId: string) {
    return fetchJson<{ trip: Trip }>(`/api/trips/${tripId}/activities/${activityId}`, {
      method: 'DELETE',
    });
  },
};
