import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckSquare, 
  Trash2, 
  Share2, 
  Plus, 
  Sparkles, 
  Navigation,
  Compass,
  ArrowRight,
  CheckCircle2,
  Mountain,
  Utensils,
  Bus,
  Camera,
  Palmtree,
  DollarSign,
  Activity as ActivityIcon,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { ItineraryItem, Destination, Trip, Activity, ActivityCategory } from '../types';

interface ItineraryViewProps {
  trips: Trip[];
  activeTripId: string;
  onSelectTripId: (tripId: string) => void;
  onOpenAddActivityModal: () => void;
  onToggleActivityStatus: (tripId: string, activityId: string, currentStatus: string) => void;
  onToggleActivityChecklistItem: (tripId: string, activityId: string, checklistId: string) => void;
  onAddActivityChecklistItem: (tripId: string, activityId: string, text: string) => void;
  onDeleteActivity: (tripId: string, activityId: string) => void;
  // Legacy / Destination guide stops
  itinerary: ItineraryItem[];
  destinations: Destination[];
  onToggleChecklistItem: (itineraryId: string, checklistId: string) => void;
  onRemoveItineraryItem: (itineraryId: string) => void;
  onAddChecklistItem: (itineraryId: string, text: string) => void;
  onSelectDestinationById: (destId: string) => void;
  onOpenDirectionsForDestination: (dest: Destination) => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'info' | 'error') => void;
  onNavigateToExplore: () => void;
  onNavigateToDetails: (destId: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Sightseeing: Camera,
  Hiking: Mountain,
  Dining: Utensils,
  Transport: Bus,
  Culture: Compass,
  Relaxation: Palmtree,
  Adventure: ActivityIcon,
};

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  trips,
  activeTripId,
  onSelectTripId,
  onOpenAddActivityModal,
  onToggleActivityStatus,
  onToggleActivityChecklistItem,
  onAddActivityChecklistItem,
  onDeleteActivity,
  itinerary,
  destinations,
  onToggleChecklistItem,
  onRemoveItineraryItem,
  onAddChecklistItem,
  onSelectDestinationById,
  onOpenDirectionsForDestination,
  onShowToast,
  onNavigateToExplore,
  onNavigateToDetails,
}) => {
  const [activeItemChecklistInput, setActiveItemChecklistInput] = useState<Record<string, string>>({});
  const [activityChecklistInputs, setActivityChecklistInputs] = useState<Record<string, string>>({});
  const [activeTabSection, setActiveTabSection] = useState<'activities' | 'stops'>('activities');

  const activeTrip = trips.find((t) => String(t._id) === activeTripId) || trips[0];
  const activeActivities = activeTrip?.activities || [];

  const handleShareItinerary = () => {
    if (!activeTrip && itinerary.length === 0) return;

    let summary = `⛩️ Zenith Travel Expedition: ${activeTrip?.title || 'Japan Trip'}\n`;
    summary += `Dates: ${activeTrip?.startDate} to ${activeTrip?.endDate || activeTrip?.startDate}\n\n`;

    if (activeActivities.length > 0) {
      summary += `Activities (${activeActivities.length}):\n`;
      activeActivities.forEach((act, idx) => {
        summary += `${idx + 1}. [${act.timeSlot}] ${act.title} (${act.category})\n`;
        if (act.notes) summary += `   Notes: ${act.notes}\n`;
      });
    }

    navigator.clipboard.writeText(summary);
    onShowToast('Itinerary Copied', 'Full trip timeline copied to clipboard.');
  };

  const totalActivitiesCount = activeActivities.length;
  const completedActivitiesCount = activeActivities.filter((a) => a.status === 'completed').length;
  const totalChecklistItems = activeActivities.reduce((sum, a) => sum + (a.checklist?.length || 0), 0);
  const completedChecklistItems = activeActivities.reduce(
    (sum, a) => sum + (a.checklist?.filter((c) => c.completed).length || 0),
    0
  );

  return (
    <div className="w-full bg-slate-50/60 min-h-screen flex flex-col pb-28">
      {/* Header */}
      <div className="bg-white p-4 border-b border-slate-200 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1 text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold uppercase tracking-widest">Trip Planner & Timeline</span>
            </div>
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight mt-0.5">My Itinerary</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddActivityModal}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Activity
            </button>

            {(activeActivities.length > 0 || itinerary.length > 0) && (
              <button
                onClick={handleShareItinerary}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition-colors"
                title="Share Itinerary"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Trip Selector Header Card */}
        {activeTrip && (
          <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={activeTrip.coverImage}
                alt={activeTrip.destinationName}
                className="w-10 h-10 rounded-lg object-cover shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 bg-slate-200 px-1.5 py-0.2 rounded">
                    {activeTrip.status}
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal truncate">
                    {activeTrip.startDate} {activeTrip.endDate ? `• ${activeTrip.endDate}` : ''}
                  </span>
                </div>
                <h2 className="text-xs font-semibold text-slate-900 truncate mt-0.5">
                  {activeTrip.title}
                </h2>
              </div>
            </div>

            {trips.length > 1 && (
              <select
                value={String(activeTrip._id)}
                onChange={(e) => onSelectTripId(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 focus:outline-hidden"
              >
                {trips.map((t) => (
                  <option key={String(t._id)} value={String(t._id)}>
                    {t.destinationName}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Section Switcher Tabs */}
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100">
          <button
            onClick={() => setActiveTabSection('activities')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTabSection === 'activities'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Activities & Timeline ({totalActivitiesCount})
          </button>
          <button
            onClick={() => setActiveTabSection('stops')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTabSection === 'stops'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Saved Stops ({itinerary.length})
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 space-y-4">
        {/* SECTION 1: ACTIVITIES & TIMELINE */}
        {activeTabSection === 'activities' && (
          <div className="space-y-4">
            {/* Progress stats */}
            {totalActivitiesCount > 0 && (
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium text-slate-900">
                    {completedActivitiesCount} of {totalActivitiesCount} Activities Completed
                  </span>
                </div>
                {totalChecklistItems > 0 && (
                  <span className="text-slate-500 font-normal">
                    Gear: {completedChecklistItems}/{totalChecklistItems}
                  </span>
                )}
              </div>
            )}

            {activeActivities.length === 0 ? (
              <div className="text-center py-12 px-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-3">
                  <Compass className="w-6 h-6" />
                </div>
                <h2 className="text-base font-semibold text-slate-900">No Activities Scheduled</h2>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed font-normal">
                  Plan your hikes, dining stops, sunrise vistas, and transit options by adding activities to this trip.
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <button
                    onClick={onOpenAddActivityModal}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-medium inline-flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Activity
                  </button>
                  <button
                    onClick={onNavigateToExplore}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 transition-all"
                  >
                    Explore Destinations
                  </button>
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {activeActivities.map((act, idx) => {
                  const CatIcon = CATEGORY_ICONS[act.category] || ActivityIcon;
                  const isCompleted = act.status === 'completed';
                  const checklistTotal = act.checklist?.length || 0;
                  const checklistDone = act.checklist?.filter((c) => c.completed).length || 0;

                  return (
                    <motion.div
                      key={String(act._id)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`bg-white rounded-2xl overflow-hidden border transition-colors shadow-xs ${
                        isCompleted ? 'border-slate-200 bg-slate-50/50' : 'border-slate-200/90'
                      }`}
                    >
                      {/* Activity Top Bar */}
                      <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <button
                            onClick={() =>
                              onToggleActivityStatus(String(activeTrip._id), String(act._id), act.status)
                            }
                            className="flex items-center gap-1.5 cursor-pointer focus:outline-hidden"
                            title="Toggle activity completion"
                          >
                            <input
                              type="checkbox"
                              checked={isCompleted}
                              onChange={() => {}}
                              className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300 pointer-events-none"
                            />
                            <span className="text-xs font-semibold text-slate-900">
                              {act.timeSlot}
                            </span>
                          </button>

                          <span className="text-xs text-slate-300">•</span>
                          <span className="text-xs text-slate-500 font-normal">{act.date}</span>

                          {act.startTime && (
                            <>
                              <span className="text-xs text-slate-300">•</span>
                              <span className="text-xs text-slate-500 font-normal">
                                {act.startTime} {act.endTime ? `- ${act.endTime}` : ''}
                              </span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-medium text-slate-700 bg-slate-200 px-2 py-0.5 rounded flex items-center gap-1">
                            <CatIcon className="w-3 h-3" />
                            {act.category}
                          </span>
                          <button
                            onClick={() => onDeleteActivity(String(activeTrip._id), String(act._id))}
                            className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                            title="Delete activity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Activity Content */}
                      <div className="p-4 space-y-3">
                        <div>
                          <h3
                            className={`font-semibold text-sm leading-snug ${
                              isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                            }`}
                          >
                            {act.title}
                          </h3>

                          {(act.location || act.cost) && (
                            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                              {act.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                  {act.location}
                                </span>
                              )}
                              {act.cost && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                                  {act.cost}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Notes */}
                        {act.notes && (
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-600 leading-relaxed font-normal">
                            <strong className="text-slate-900 font-medium">Logistics & Tips: </strong>
                            {act.notes}
                          </div>
                        )}

                        {/* Checklist */}
                        {act.checklist && act.checklist.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium text-slate-900 flex items-center gap-1">
                                <CheckSquare className="w-3.5 h-3.5 text-slate-700" />
                                Checklist ({checklistDone}/{checklistTotal})
                              </span>
                            </div>

                            <div className="space-y-1">
                              {act.checklist.map((chk) => (
                                <label
                                  key={chk.id}
                                  className="flex items-start gap-2.5 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    checked={chk.completed}
                                    onChange={() =>
                                      onToggleActivityChecklistItem(
                                        String(activeTrip._id),
                                        String(act._id),
                                        chk.id
                                      )
                                    }
                                    className="w-3.5 h-3.5 mt-0.5 rounded text-slate-900 focus:ring-slate-900 border-slate-300"
                                  />
                                  <span
                                    className={`flex-1 leading-relaxed ${
                                      chk.completed
                                        ? 'line-through text-slate-400'
                                        : 'text-slate-800 font-normal'
                                    }`}
                                  >
                                    {chk.text}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Add Checklist Item input */}
                        <div className="flex gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Add task/gear..."
                            value={activityChecklistInputs[String(act._id)] || ''}
                            onChange={(e) =>
                              setActivityChecklistInputs({
                                ...activityChecklistInputs,
                                [String(act._id)]: e.target.value,
                              })
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const txt = activityChecklistInputs[String(act._id)];
                                if (txt?.trim()) {
                                  onAddActivityChecklistItem(
                                    String(activeTrip._id),
                                    String(act._id),
                                    txt.trim()
                                  );
                                  setActivityChecklistInputs({
                                    ...activityChecklistInputs,
                                    [String(act._id)]: '',
                                  });
                                }
                              }
                            }}
                            className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-slate-900 font-normal"
                          />
                          <button
                            onClick={() => {
                              const txt = activityChecklistInputs[String(act._id)];
                              if (txt?.trim()) {
                                onAddActivityChecklistItem(
                                  String(activeTrip._id),
                                  String(act._id),
                                  txt.trim()
                                );
                                setActivityChecklistInputs({
                                  ...activityChecklistInputs,
                                  [String(act._id)]: '',
                                });
                              }
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}

            {/* Quick Add Activity Button at bottom of timeline */}
            {activeActivities.length > 0 && (
              <button
                onClick={onOpenAddActivityModal}
                className="w-full py-3 bg-white hover:bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-xs font-medium text-slate-700 flex items-center justify-center gap-2 transition-colors shadow-2xs"
              >
                <Plus className="w-4 h-4 text-slate-900" />
                Add Another Activity to Timeline
              </button>
            )}
          </div>
        )}

        {/* SECTION 2: SAVED DESTINATION STOPS */}
        {activeTabSection === 'stops' && (
          <div className="space-y-4">
            {itinerary.length === 0 ? (
              <div className="text-center py-12 px-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6" />
                </div>
                <h2 className="text-base font-semibold text-slate-900">No Destination Stops Saved</h2>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed font-normal">
                  Browse destinations from Explore and click "Save to Itinerary" to add them here.
                </p>
                <button
                  onClick={onNavigateToExplore}
                  className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-medium inline-flex items-center gap-1.5 shadow-xs transition-all"
                >
                  Explore Destinations
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <AnimatePresence>
                {itinerary.map((item, idx) => {
                  const destination = destinations.find((d) => d.id === item.destinationId);
                  const completedCount = item.checklist.filter((c) => c.completed).length;
                  const totalCount = item.checklist.length;
                  const progressPercent =
                    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs"
                    >
                      {/* Item Top Banner */}
                      <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-semibold">
                            {idx + 1}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                            <Calendar className="w-3.5 h-3.5 text-slate-600" />
                            {item.date}
                          </div>
                          <span className="text-xs text-slate-300">•</span>
                          <div className="flex items-center gap-1 text-xs text-slate-500 font-normal">
                            <Clock className="w-3.5 h-3.5" />
                            {item.timeSlot}
                          </div>
                        </div>

                        <button
                          onClick={() => onRemoveItineraryItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                          title="Remove from itinerary"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Destination Preview */}
                      <div className="p-4 space-y-4">
                        <div
                          onClick={() => onSelectDestinationById(item.destinationId)}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <img
                            src={item.coverImage}
                            alt={item.destinationName}
                            className="w-14 h-14 rounded-xl object-cover group-hover:scale-103 transition-transform"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {item.destinationCategory}
                            </span>
                            <h3 className="font-semibold text-sm text-slate-900 group-hover:text-slate-700 transition-colors truncate mt-0.5">
                              {item.destinationName}
                            </h3>
                            <p className="text-xs text-slate-500 flex items-center gap-1 truncate font-normal">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {item.location}
                            </p>
                          </div>
                        </div>

                        {/* Notes Box */}
                        {item.notes && (
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-600 leading-relaxed font-normal">
                            <strong className="text-slate-900 font-medium">Trip Notes: </strong>
                            {item.notes}
                          </div>
                        )}

                        {/* Checklist Section */}
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-900 flex items-center gap-1">
                              <CheckSquare className="w-3.5 h-3.5 text-slate-700" />
                              Packing & Checklist
                            </span>
                            <span className="font-normal text-slate-500">
                              {completedCount}/{totalCount} ({progressPercent}%)
                            </span>
                          </div>

                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-slate-900 transition-all duration-300"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>

                          <div className="space-y-1 pt-1 max-h-40 overflow-y-auto">
                            {item.checklist.map((chk) => (
                              <label
                                key={chk.id}
                                className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-xs transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={chk.completed}
                                  onChange={() => onToggleChecklistItem(item.id, chk.id)}
                                  className="w-3.5 h-3.5 mt-0.5 rounded text-slate-900 focus:ring-slate-900 border-slate-300"
                                />
                                <span
                                  className={`flex-1 leading-relaxed ${
                                    chk.completed
                                      ? 'line-through text-slate-400'
                                      : 'text-slate-800 font-normal'
                                  }`}
                                >
                                  {chk.text}
                                </span>
                              </label>
                            ))}
                          </div>

                          <div className="flex gap-2 pt-1">
                            <input
                              type="text"
                              placeholder="Add item..."
                              value={activeItemChecklistInput[item.id] || ''}
                              onChange={(e) =>
                                setActiveItemChecklistInput({
                                  ...activeItemChecklistInput,
                                  [item.id]: e.target.value,
                                })
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const txt = activeItemChecklistInput[item.id];
                                  if (txt?.trim()) {
                                    onAddChecklistItem(item.id, txt.trim());
                                    setActiveItemChecklistInput({
                                      ...activeItemChecklistInput,
                                      [item.id]: '',
                                    });
                                  }
                                }
                              }}
                              className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-slate-900 font-normal"
                            />
                            <button
                              onClick={() => {
                                const txt = activeItemChecklistInput[item.id];
                                if (txt?.trim()) {
                                  onAddChecklistItem(item.id, txt.trim());
                                  setActiveItemChecklistInput({
                                    ...activeItemChecklistInput,
                                    [item.id]: '',
                                  });
                                }
                              }}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Add
                            </button>
                          </div>
                        </div>

                        {/* Action Bar */}
                        <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                          {destination && (
                            <button
                              onClick={() => onOpenDirectionsForDestination(destination)}
                              className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <Navigation className="w-3.5 h-3.5 text-slate-700" />
                              Directions
                            </button>
                          )}
                          <button
                            onClick={() => onSelectDestinationById(item.destinationId)}
                            className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                          >
                            View Guide
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
