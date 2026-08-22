import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Calendar, 
  Clock, 
  CheckSquare, 
  Plus, 
  Trash2, 
  Sparkles,
  MapPin
} from 'lucide-react';
import { Destination, ItineraryItem, ChecklistItem } from '../types';

interface SaveToItineraryModalProps {
  destination: Destination;
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<ItineraryItem, 'id' | 'createdAt'>) => void;
  onShowToast: (title: string, description?: string) => void;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: '1', text: 'Reserve 7th/8th station mountain hut in advance', completed: false },
  { id: '2', text: 'Sturdy waterproof hiking boots & wool socks', completed: false },
  { id: '3', text: 'Headlamp with extra lithium batteries (for night ascent)', completed: false },
  { id: '4', text: 'Thermal windbreaker & waterproof rain jacket', completed: false },
  { id: '5', text: '2 Liters of water & high-energy trail snacks', completed: false },
  { id: '6', text: '¥2,000 cash for 5th Station Conservation Fee & toilet coins', completed: false },
];

export const SaveToItineraryModal: React.FC<SaveToItineraryModalProps> = ({
  destination,
  isOpen,
  onClose,
  onSave,
  onShowToast,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [timeSlot, setTimeSlot] = useState<string>('Early Sunrise (04:30 AM)');
  const [notes, setNotes] = useState<string>('Catch Goraiko sunrise and get wooden walking stick stamped at each hut.');
  const [checklist, setChecklist] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST);
  const [newChecklistText, setNewChecklistText] = useState<string>('');

  if (!isOpen) return null;

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: newChecklistText.trim(),
      completed: false,
    };
    setChecklist([...checklist, newItem]);
    setNewChecklistText('');
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist(checklist.filter((item) => item.id !== id));
  };

  const handleToggleChecklistItem = (id: string) => {
    setChecklist(
      checklist.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      destinationId: destination.id,
      destinationName: destination.name,
      destinationCategory: destination.category,
      coverImage: destination.coverImage,
      location: destination.location,
      date: selectedDate,
      timeSlot,
      notes,
      checklist,
    });
    onShowToast(
      'Saved to Itinerary!',
      `${destination.name} scheduled for ${selectedDate}`
    );
    onClose();
  };

  const timeSlots = [
    'Early Sunrise (04:30 AM)',
    'Morning Ascent (08:00 AM)',
    'Afternoon Sightseeing (01:30 PM)',
    'Sunset & Evening (05:00 PM)',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-slate-900 leading-tight">
                Add to Itinerary
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-normal">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {destination.name} • {destination.country}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Destination Preview Card */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <img
              src={destination.coverImage}
              alt={destination.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                  {destination.category}
                </span>
                <span className="text-xs text-slate-500 font-normal">Elevation: {destination.elevation}</span>
              </div>
              <p className="text-sm font-semibold text-slate-900 truncate mt-0.5">{destination.name}</p>
              <p className="text-xs text-slate-500 font-normal">{destination.season}</p>
            </div>
          </div>

          {/* Date & Time Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-900 block mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-600" />
                Trip Date
              </label>
              <input
                type="date"
                required
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:outline-hidden focus:border-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-900 block mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-600" />
                Time Slot
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:outline-hidden focus:border-slate-900"
              >
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Personal Notes */}
          <div>
            <label className="text-xs font-medium text-slate-900 block mb-1.5">
              Trip Notes & Goals
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Book bus tickets from Shinjuku, meet guide at 5th station..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-slate-900 placeholder:text-slate-400 font-normal"
            />
          </div>

          {/* Gear & Preparation Checklist */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-900 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-slate-600" />
                Preparation Checklist ({checklist.filter(c => c.completed).length}/{checklist.length})
              </label>
            </div>

            {/* Checklist items list */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <label className="flex items-center gap-2 text-xs text-slate-900 cursor-pointer flex-1 min-w-0 font-normal">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleChecklistItem(item.id)}
                      className="w-3.5 h-3.5 rounded text-slate-900 focus:ring-slate-900 border-slate-300"
                    />
                    <span className={`truncate ${item.completed ? 'line-through text-slate-400' : ''}`}>
                      {item.text}
                    </span>
                  </label>
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

            {/* Add new item */}
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="Add custom packing or task item..."
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

          {/* Tips badge */}
          <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-slate-700 shrink-0" />
            <p className="text-[11px] text-slate-600 leading-tight font-normal">
              Added to your personal itinerary deck. You can check off items anytime in the Itinerary tab.
            </p>
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              Confirm & Save
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
