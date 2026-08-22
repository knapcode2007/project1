import React, { useState, useEffect, useCallback } from 'react';
import { Destination, Trip, Activity, ItineraryItem, Review, User, ActivityCategory } from './types';
import { INITIAL_DESTINATIONS } from './data/destinations';
import { DestinationDetail } from './components/DestinationDetail';
import { ExploreView } from './components/ExploreView';
import { ItineraryView } from './components/ItineraryView';
import { SavedView } from './components/SavedView';
import { DirectionsModal } from './components/DirectionsModal';
import { SaveToItineraryModal } from './components/SaveToItineraryModal';
import { AddReviewModal } from './components/AddReviewModal';
import { AddActivityModal } from './components/AddActivityModal';
import { BottomNavBar, AppTab } from './components/BottomNavBar';
import { Toast, ToastMessage } from './components/Toast';
import { api } from './api';

export default function App() {
  // 1. Destinations State
  const [destinations, setDestinations] = useState<Destination[]>(() => {
    const saved = localStorage.getItem('zenith_destinations');
    return saved ? JSON.parse(saved) : INITIAL_DESTINATIONS;
  });

  // Selected Destination ID (defaults to 'mount-fuji')
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>('mount-fuji');

  // Navigation Routing Tab
  const [currentTab, setCurrentTab] = useState<AppTab>(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'home' || hash === 'explore') return 'explore';
    if (hash === 'itinerary') return 'itinerary';
    if (hash === 'details' || hash === 'guide') return 'destination';
    if (hash === 'saved') return 'saved';
    return 'destination';
  });

  // User Profile
  const [user, setUser] = useState<User | null>(null);

  // Trips State (from Backend)
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTripId, setActiveTripId] = useState<string>('');

  // Bookmarks State
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('zenith_bookmarks');
    return saved ? JSON.parse(saved) : ['mount-fuji', 'lake-kawaguchiko'];
  });

  // Legacy/Scheduled Destination Stops State
  const [itinerary, setItinerary] = useState<ItineraryItem[]>(() => {
    const saved = localStorage.getItem('zenith_itinerary');
    return saved ? JSON.parse(saved) : [];
  });

  // Modals
  const [isDirectionsModalOpen, setIsDirectionsModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isAddReviewModalOpen, setIsAddReviewModalOpen] = useState(false);
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);
  const [directionsTargetDestination, setDirectionsTargetDestination] = useState<Destination | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (title: string, description?: string, type: 'success' | 'info' | 'error' = 'success') => {
      const id = Date.now().toString() + Math.random().toString();
      const newToast: ToastMessage = { id, title, description, type };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3800);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'home' || hash === 'explore') setCurrentTab('explore');
      else if (hash === 'itinerary') setCurrentTab('itinerary');
      else if (hash === 'details' || hash === 'guide') setCurrentTab('destination');
      else if (hash === 'saved') setCurrentTab('saved');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleTabChange = (tab: AppTab) => {
    setCurrentTab(tab);
    if (tab === 'explore') window.location.hash = 'home';
    else if (tab === 'destination') window.location.hash = 'details';
    else window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load Data from Backend API
  const loadBackendData = useCallback(async () => {
    try {
      // 1. Fetch User
      const userRes = await api.getUser();
      if (userRes.success && userRes.data) {
        setUser(userRes.data);
      }

      // 2. Fetch Destinations
      const destRes = await api.getDestinations();
      if (destRes.success && destRes.data && destRes.data.length > 0) {
        setDestinations(destRes.data);
      }

      // 3. Fetch Bookmarks
      const bookmarkRes = await api.getBookmarks();
      if (bookmarkRes.success && bookmarkRes.data) {
        setBookmarkedIds(bookmarkRes.data);
      }

      // 4. Fetch Trips with populated Activities
      const tripsRes = await api.getTrips();
      if (tripsRes.success && tripsRes.data && tripsRes.data.length > 0) {
        setTrips(tripsRes.data);
        setActiveTripId(String(tripsRes.data[0]._id));
      }
    } catch (err) {
      console.warn('Backend fetch error, continuing with client state:', err);
    }
  }, []);

  useEffect(() => {
    loadBackendData();
  }, [loadBackendData]);

  // Persist fallback localStorage
  useEffect(() => {
    localStorage.setItem('zenith_destinations', JSON.stringify(destinations));
  }, [destinations]);

  useEffect(() => {
    localStorage.setItem('zenith_bookmarks', JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  useEffect(() => {
    localStorage.setItem('zenith_itinerary', JSON.stringify(itinerary));
  }, [itinerary]);

  // Active Destination
  const activeDestination =
    destinations.find((d) => d.id === selectedDestinationId) ||
    destinations[0] ||
    INITIAL_DESTINATIONS[0];

  // Actions
  const handleToggleBookmark = async (destinationId: string) => {
    // Optimistic update
    setBookmarkedIds((prev) =>
      prev.includes(destinationId)
        ? prev.filter((id) => id !== destinationId)
        : [...prev, destinationId]
    );

    try {
      const res = await api.toggleBookmark(destinationId);
      if (res.success && res.data) {
        setBookmarkedIds(res.data.bookmarks);
        showToast(
          res.data.bookmarked ? 'Saved to Wishlist' : 'Removed from Wishlist',
          undefined,
          'info'
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Activity to Trip
  const handleAddActivity = async (
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
      checklist: Array<{ id: string; text: string; completed: boolean }>;
      destinationId?: string;
    },
    targetTripId: string
  ): Promise<boolean> => {
    try {
      const res = await api.addActivity(targetTripId, activityData);
      if (!res.success || !res.data) {
        showToast('Validation Error', res.error || 'Failed to add activity', 'error');
        return false;
      }

      // Update trips state
      const { activity, trip } = res.data;
      setTrips((prev) => {
        const index = prev.findIndex((t) => String(t._id) === targetTripId);
        if (index === -1) return prev;
        const updated = [...prev];
        updated[index] = trip;
        return updated;
      });

      showToast(
        'Activity Added',
        `"${activity.title}" scheduled for ${activity.date} (${activity.timeSlot}).`
      );
      return true;
    } catch (err: any) {
      showToast('Error', err.message || 'Could not save activity', 'error');
      return false;
    }
  };

  // Toggle Activity Status (completed vs planned)
  const handleToggleActivityStatus = async (
    tripId: string,
    activityId: string,
    currentStatus: string
  ) => {
    const nextStatus = currentStatus === 'completed' ? 'planned' : 'completed';

    // Optimistic UI update
    setTrips((prev) =>
      prev.map((t) => {
        if (String(t._id) !== tripId) return t;
        return {
          ...t,
          activities: t.activities.map((a) =>
            String(a._id) === activityId ? { ...a, status: nextStatus as any } : a
          ),
        };
      })
    );

    try {
      await api.updateActivity(tripId, activityId, { status: nextStatus as any });
      showToast(
        nextStatus === 'completed' ? 'Activity Completed!' : 'Marked as Planned',
        undefined,
        'info'
      );
    } catch (err) {
      console.error('Failed to toggle activity status:', err);
    }
  };

  // Toggle Activity Checklist Item
  const handleToggleActivityChecklistItem = async (
    tripId: string,
    activityId: string,
    checklistId: string
  ) => {
    const targetTrip = trips.find((t) => String(t._id) === tripId);
    const targetActivity = targetTrip?.activities.find((a) => String(a._id) === activityId);
    if (!targetActivity) return;

    const updatedChecklist = targetActivity.checklist.map((c) =>
      c.id === checklistId ? { ...c, completed: !c.completed } : c
    );

    // Optimistic update
    setTrips((prev) =>
      prev.map((t) => {
        if (String(t._id) !== tripId) return t;
        return {
          ...t,
          activities: t.activities.map((a) =>
            String(a._id) === activityId ? { ...a, checklist: updatedChecklist } : a
          ),
        };
      })
    );

    try {
      await api.updateActivity(tripId, activityId, { checklist: updatedChecklist });
    } catch (err) {
      console.error(err);
    }
  };

  // Add Item to Activity Checklist
  const handleAddActivityChecklistItem = async (
    tripId: string,
    activityId: string,
    text: string
  ) => {
    const targetTrip = trips.find((t) => String(t._id) === tripId);
    const targetActivity = targetTrip?.activities.find((a) => String(a._id) === activityId);
    if (!targetActivity) return;

    const newItem = { id: 'chk-' + Date.now(), text, completed: false };
    const updatedChecklist = [...(targetActivity.checklist || []), newItem];

    setTrips((prev) =>
      prev.map((t) => {
        if (String(t._id) !== tripId) return t;
        return {
          ...t,
          activities: t.activities.map((a) =>
            String(a._id) === activityId ? { ...a, checklist: updatedChecklist } : a
          ),
        };
      })
    );

    try {
      await api.updateActivity(tripId, activityId, { checklist: updatedChecklist });
      showToast('Item Added', text);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Activity
  const handleDeleteActivity = async (tripId: string, activityId: string) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (String(t._id) !== tripId) return t;
        return {
          ...t,
          activities: t.activities.filter((a) => String(a._id) !== activityId),
        };
      })
    );

    try {
      await api.deleteActivity(tripId, activityId);
      showToast('Activity Removed', 'Activity was deleted from your trip timeline.', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  // Save to Itinerary (Destination Stop Modal)
  const handleSaveToItinerary = async (
    itemData: Omit<ItineraryItem, 'id' | 'createdAt'>
  ) => {
    const existingIndex = itinerary.findIndex(
      (i) => i.destinationId === itemData.destinationId
    );

    if (existingIndex >= 0) {
      const updated = [...itinerary];
      updated[existingIndex] = {
        ...updated[existingIndex],
        ...itemData,
      };
      setItinerary(updated);
    } else {
      const newItem: ItineraryItem = {
        ...itemData,
        id: 'itin-' + Date.now(),
        createdAt: Date.now(),
      };
      setItinerary((prev) => [newItem, ...prev]);
    }

    // Also link as an Activity on the active trip if available
    if (activeTripId) {
      await handleAddActivity(
        {
          title: `Explore ${itemData.destinationName}`,
          category: 'Sightseeing',
          date: itemData.date,
          timeSlot: itemData.timeSlot,
          location: itemData.location,
          notes: itemData.notes,
          checklist: itemData.checklist,
          destinationId: itemData.destinationId,
        },
        activeTripId
      );
    }
  };

  const handleToggleChecklistItem = (itineraryId: string, checklistId: string) => {
    setItinerary((prev) =>
      prev.map((item) => {
        if (item.id !== itineraryId) return item;
        return {
          ...item,
          checklist: item.checklist.map((c) =>
            c.id === checklistId ? { ...c, completed: !c.completed } : c
          ),
        };
      })
    );
  };

  const handleRemoveItineraryItem = (itineraryId: string) => {
    const item = itinerary.find((i) => i.id === itineraryId);
    setItinerary((prev) => prev.filter((i) => i.id !== itineraryId));
    showToast(
      'Removed from Itinerary',
      item ? `${item.destinationName} was removed` : undefined,
      'info'
    );
  };

  const handleAddChecklistItem = (itineraryId: string, text: string) => {
    setItinerary((prev) =>
      prev.map((item) => {
        if (item.id !== itineraryId) return item;
        return {
          ...item,
          checklist: [
            ...item.checklist,
            { id: Date.now().toString(), text, completed: false },
          ],
        };
      })
    );
  };

  const handleAddReview = async (
    newRev: Omit<Review, 'id' | 'date' | 'helpfulCount' | 'userVotedHelpful'>
  ) => {
    try {
      const res = await api.addReview(activeDestination.id, newRev);
      if (res.success && res.data) {
        setDestinations((prev) =>
          prev.map((d) => {
            if (d.id !== activeDestination.id) return d;
            const newReviews = [res.data!, ...d.reviews];
            const newRating = Number(
              (newReviews.reduce((sum, r) => sum + r.rating, 0) / newReviews.length).toFixed(1)
            );
            return {
              ...d,
              rating: newRating,
              reviewCount: d.reviewCount + 1,
              reviews: newReviews,
            };
          })
        );
        showToast('Review Published', 'Thank you for sharing your explorer insights!');
      } else {
        showToast('Validation Error', res.error || 'Failed to publish review', 'error');
      }
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleToggleHelpfulReview = async (reviewId: string) => {
    // Optimistic toggle
    setDestinations((prev) =>
      prev.map((d) => {
        if (d.id !== activeDestination.id) return d;
        return {
          ...d,
          reviews: d.reviews.map((r) => {
            if (r.id !== reviewId) return r;
            const userVoted = !r.userVotedHelpful;
            return {
              ...r,
              userVotedHelpful: userVoted,
              helpfulCount: userVoted ? r.helpfulCount + 1 : r.helpfulCount - 1,
            };
          }),
        };
      })
    );

    try {
      await api.toggleReviewHelpful(activeDestination.id, reviewId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectDestination = (dest: Destination) => {
    setSelectedDestinationId(dest.id);
    handleTabChange('destination');
  };

  const savedDestinationsList = destinations.filter((d) =>
    bookmarkedIds.includes(d.id)
  );

  const isInItinerary =
    itinerary.some((i) => i.destinationId === activeDestination.id) ||
    trips.some((t) => t.activities.some((a) => a.destinationId === activeDestination.id));

  return (
    <div className="min-h-screen bg-slate-100/70 flex justify-center text-slate-900">
      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Centered Minimalist Mobile Frame */}
      <main className="w-full md:max-w-[640px] min-h-screen bg-white md:border-x md:border-slate-200/80 shadow-sm relative flex flex-col">
        {/* 1. Destination Details Screen */}
        {currentTab === 'destination' && (
          <DestinationDetail
            destination={activeDestination}
            isBookmarked={bookmarkedIds.includes(activeDestination.id)}
            isInItinerary={isInItinerary}
            onToggleBookmark={handleToggleBookmark}
            onOpenSaveModal={() => setIsSaveModalOpen(true)}
            onOpenDirectionsModal={() => {
              setDirectionsTargetDestination(activeDestination);
              setIsDirectionsModalOpen(true);
            }}
            onOpenAddReviewModal={() => setIsAddReviewModalOpen(true)}
            onBack={() => handleTabChange('explore')}
            onToggleHelpfulReview={handleToggleHelpfulReview}
            onShowToast={showToast}
            onNavigateToItinerary={() => handleTabChange('itinerary')}
          />
        )}

        {/* 2. Home / Explore Screen */}
        {currentTab === 'explore' && (
          <ExploreView
            destinations={destinations}
            bookmarkedIds={bookmarkedIds}
            onSelectDestination={handleSelectDestination}
            onToggleBookmark={handleToggleBookmark}
            onShowToast={showToast}
          />
        )}

        {/* 3. Itinerary / Planner Screen */}
        {currentTab === 'itinerary' && (
          <ItineraryView
            trips={trips}
            activeTripId={activeTripId}
            onSelectTripId={setActiveTripId}
            onOpenAddActivityModal={() => setIsAddActivityModalOpen(true)}
            onToggleActivityStatus={handleToggleActivityStatus}
            onToggleActivityChecklistItem={handleToggleActivityChecklistItem}
            onAddActivityChecklistItem={handleAddActivityChecklistItem}
            onDeleteActivity={handleDeleteActivity}
            itinerary={itinerary}
            destinations={destinations}
            onToggleChecklistItem={handleToggleChecklistItem}
            onRemoveItineraryItem={handleRemoveItineraryItem}
            onAddChecklistItem={handleAddChecklistItem}
            onSelectDestinationById={(id) => {
              setSelectedDestinationId(id);
              handleTabChange('destination');
            }}
            onOpenDirectionsForDestination={(dest) => {
              setDirectionsTargetDestination(dest);
              setIsDirectionsModalOpen(true);
            }}
            onShowToast={showToast}
            onNavigateToExplore={() => handleTabChange('explore')}
            onNavigateToDetails={(destId) => {
              setSelectedDestinationId(destId);
              handleTabChange('destination');
            }}
          />
        )}

        {/* 4. Saved / Wishlist Screen */}
        {currentTab === 'saved' && (
          <SavedView
            savedDestinations={savedDestinationsList}
            onSelectDestination={handleSelectDestination}
            onRemoveBookmark={handleToggleBookmark}
            onNavigateToExplore={() => handleTabChange('explore')}
          />
        )}

        {/* Global Bottom Navigation Bar */}
        <BottomNavBar
          currentTab={currentTab}
          onTabChange={handleTabChange}
          itineraryCount={trips.reduce((acc, t) => acc + (t.activities?.length || 0), 0) + itinerary.length}
          savedCount={bookmarkedIds.length}
        />
      </main>

      {/* Directions Modal */}
      <DirectionsModal
        destination={directionsTargetDestination || activeDestination}
        isOpen={isDirectionsModalOpen}
        onClose={() => setIsDirectionsModalOpen(false)}
        onShowToast={showToast}
      />

      {/* Save to Itinerary Modal */}
      <SaveToItineraryModal
        destination={activeDestination}
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveToItinerary}
        onShowToast={showToast}
      />

      {/* Add Review Modal */}
      <AddReviewModal
        destinationName={activeDestination.name}
        isOpen={isAddReviewModalOpen}
        onClose={() => setIsAddReviewModalOpen(false)}
        onSubmit={handleAddReview}
        onShowToast={showToast}
      />

      {/* Add Activity Modal (Interactions from Itinerary screen) */}
      <AddActivityModal
        isOpen={isAddActivityModalOpen}
        onClose={() => setIsAddActivityModalOpen(false)}
        trips={trips}
        activeTripId={activeTripId}
        destinations={destinations}
        onSubmit={handleAddActivity}
        onShowToast={showToast}
      />
    </div>
  );
}
