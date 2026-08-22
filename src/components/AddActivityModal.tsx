import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Trash2,
  Clock,
  Calendar,
  MapPin,
  DollarSign,
  FileText,
  CheckSquare,
  Sparkles,
  Mountain,
  Compass,
  Utensils,
  Bus,
  Palmtree,
  Camera,
  Activity as ActivityIcon,
} from 'lucide-react';
import { Trip, Destination, ActivityCategory } from '../types';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  trips: Trip[];
  activeTripId?: string;
  destinations: Destination[];
  onSubmit: (
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
  ) => Promise<boolean>;
  onShowToast: (title: string, description?: string, type?: 'success' | 'info' | 'error') => void;
}

const CATEGORIES: Array<{ label: ActivityCategory; icon: React.ComponentType<{ className?: string }> }> = [
  { label: 'Sightseeing', icon: Camera },
  { label: 'Hiking', icon: Mountain },
  { label: 'Dining', icon: Utensils },
  { label: 'Transport', icon: Bus },
  { label: 'Culture', icon: Compass },
  { label: 'Relaxation', icon: Palmtree },
  { label: 'Adventure', icon: ActivityIcon },
];

const TIME_SLOTS = [
  'Morning (06:00 - 11:00)',
  'Afternoon (12:00 - 16:00)',
  'Sunset (16:00 - 19:00)',
  'Evening (19:00 - 22:00)',
  'Night / Dawn Push (00:00 - 05:00)',
];

const QUICK_SUGGESTIONS: Record<ActivityCategory, string[]> = {
  Sightseeing: ['Chureito Pagoda Sunrise Vista', 'Fujisan World Heritage Center', 'Arakura Sengen Shrine'],
  Hiking: ['5th to 7th Station Ascent', 'Summit Crater Rim Trek (Ohachimeguri)', 'Sand-sliding Descent (Sunabashiri)'],
  Dining: ['Local Houtou Miso Noodles', 'Lake View Kaiseki Dinner', '5th Station Fuji Bread & Coffee'],
  Transport: ['Highway Express Bus from Shinjuku', 'Fuji Excursion Scenic Railway', 'Trailhead Shuttle Bus'],
  Culture: ['Fuji Sengen Shrine Blessing', 'Traditional Onsen Bathing', 'Tea Ceremony by the Lake'],
  Relaxation: ['Fujiyama Onsen Hot Springs', 'Lakeside Sunset Stroll', 'Footbath with Fuji Panorama'],
  Adventure: ['Paragliding over Asagiri Plateau', 'Mount Fuji Crater Exploration', 'Ice Cave Spelunking in Aokigahara'],
};

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
  isOpen,
  onClose,
  trips,
  activeTripId,
  destinations,
  onSubmit,
  onShowToast,
}) => {
  const [selectedTripId, setSelectedTripId] = useState<string>(activeTripId || (trips[0] ? String(trips[0]._id) : ''));
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('Sightseeing');
  const [date, setDate] = useState('2026-08-25');
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [checklist, setChecklist] = useState<Array<{ id: string; text: string; completed: boolean }>>([
    { id: 'chk-1', text: 'Comfortable footwear & layers', completed: false },
    { id: 'chk-2', text: 'Hydration bottle & cash', completed: false },
  ]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeTrip = trips.find((t) => String(t._id) === selectedTripId) || trips[0];

  useEffect(() => {
    if (isOpen) {
      const currentTrip = trips.find((t) => String(t._id) === activeTripId) || trips[0];
      if (currentTrip) {
        setSelectedTripId(String(currentTrip._id));
        setDate(currentTrip.startDate || '2026-08-25');
        setLocation(currentTrip.location || '');
      }
      setErrors({});
    }
  }, [isOpen, activeTripId, trips]);

  if (!isOpen) return null;

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setChecklist((prev) => [
      ...prev,
      { id: 'chk-' + Date.now(), text: newChecklistText.trim(), completed: false },
    ]);
    setNewChecklistText('');
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  };

  const handleApplySuggestion = (suggestion: string) => {
    setTitle(suggestion);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 2) {
      errs.title = 'Activity title must be at least 2 characters';
    }
    if (!selectedTripId) {
      errs.trip = 'Please select a trip for this activity';
    }
    if (!date) {
      errs.date = 'Date is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const success = await onSubmit(
        {
          title: title.trim(),
          category,
          date,
          timeSlot: timeSlot.split(' ')[0] || timeSlot,
          startTime: startTime.trim() || undefined,
          endTime: endTime.trim() || undefined,
          location: location.trim() || activeTrip?.location || 'Mount Fuji Region',
          cost: cost.trim() || undefined,
          notes: notes.trim() || undefined,
          checklist,
          destinationId: activeTrip?.destinationId || 'mount-fuji',
        },
        selectedTripId
      );

      if (success) {
        setTitle('');
        setNotes('');
        setStartTime('');
        setEndTime('');
        setCost('');
        onClose();
      }
    } catch (err: any) {
      onShowToast('Failed to Add Activity', err.message || 'Validation error', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base text-slate-900 leading-tight">
                  Add New Activity
                </h3>
                <p className="text-xs text-slate-500 font-normal">
                  Schedule an expedition stop, hike, or reservation
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 flex-1">
            {/* Target Trip Selector */}
            {trips.length > 1 && (
              <div>
                <label className="text-xs font-medium text-slate-900 block mb-1.5 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-slate-600" />
                  Target Trip / Itinerary
                </label>
                <select
                  value={selectedTripId}
                  onChange={(e) => setSelectedTripId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:outline-hidden focus:border-slate-900"
                >
                  {trips.map((t) => (
                    <option key={String(t._id)} value={String(t._id)}>
                      {t.title} ({t.destinationName})
                    </option>
                  ))}
                </select>
                {errors.trip && <p className="text-[11px] text-rose-600 mt-1">{errors.trip}</p>}
              </div>
            )}

            {/* Category Selector */}
            <div>
              <label className="text-xs font-medium text-slate-900 block mb-1.5">
                Activity Category
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.label;
                  return (
                    <button
                      key={cat.label}
                      type="button"
                      onClick={() => setCategory(cat.label)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Activity Title & Quick Suggestions */}
            <div>
              <label className="text-xs font-medium text-slate-900 block mb-1.5">
                Activity Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sunset at Chureito Pagoda, Summit Push, Onsen..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:outline-hidden focus:border-slate-900"
              />
              {errors.title && <p className="text-[11px] text-rose-600 mt-1">{errors.title}</p>}

              {/* Suggestions */}
              <div className="mt-2">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block mb-1">
                  Quick Ideas for {category}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(QUICK_SUGGESTIONS[category] || []).map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => handleApplySuggestion(sug)}
                      className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors text-left"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Date & Time Slot Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-900 block mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-600" />
                  Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:outline-hidden focus:border-slate-900"
                />
                {errors.date && <p className="text-[11px] text-rose-600 mt-1">{errors.date}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-slate-900 block mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-600" />
                  Time Window
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:outline-hidden focus:border-slate-900"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Time / Cost / Location Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-900 block mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-600" />
                  Location / Trailhead
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Fuji 5th Station, Lake Kawaguchiko"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:outline-hidden focus:border-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-900 block mb-1.5 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-slate-600" />
                  Estimated Cost
                </label>
                <input
                  type="text"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="e.g. ¥2,000, ¥3,800, Free"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:outline-hidden focus:border-slate-900"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-medium text-slate-900 block mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                Notes & Reminders
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Logistics, ticket confirmation numbers, meeting points, trail advice..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-slate-900 placeholder:text-slate-400 font-normal"
              />
            </div>

            {/* Checklist Builder */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-900 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-slate-600" />
                  Gear & Task Checklist ({checklist.length})
                </label>
              </div>

              <div className="space-y-1.5 mb-2">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <span className="text-xs text-slate-800 font-normal truncate flex-1">
                      • {item.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklistItem(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add item (e.g. Flashlight, Rain poncho)..."
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddChecklistItem();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-slate-900 font-normal"
                />
                <button
                  type="button"
                  onClick={handleAddChecklistItem}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            </div>

            {/* Tip note */}
            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-slate-700 shrink-0" />
              <p className="text-[11px] text-slate-600 leading-tight font-normal">
                This activity will be recorded to your trip timeline and synchronized with the backend store.
              </p>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                {isSubmitting ? 'Saving Activity...' : 'Add Activity'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
