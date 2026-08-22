import React from 'react';
import { motion } from 'motion/react';
import { Bookmark, Star, MapPin, ChevronRight, Compass } from 'lucide-react';
import { Destination } from '../types';

interface SavedViewProps {
  savedDestinations: Destination[];
  onSelectDestination: (dest: Destination) => void;
  onRemoveBookmark: (destId: string) => void;
  onNavigateToExplore: () => void;
}

export const SavedView: React.FC<SavedViewProps> = ({
  savedDestinations,
  onSelectDestination,
  onRemoveBookmark,
  onNavigateToExplore,
}) => {
  return (
    <div className="w-full bg-slate-50/60 min-h-screen flex flex-col pb-28">
      {/* Header */}
      <div className="bg-white p-4 border-b border-slate-200 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1 text-slate-500">
              <Bookmark className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold uppercase tracking-widest">Wishlist</span>
            </div>
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight mt-0.5">Saved Places</h1>
          </div>
          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            {savedDestinations.length} places
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {savedDestinations.length === 0 ? (
          <div className="text-center py-14 px-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-3">
              <Bookmark className="w-6 h-6" />
            </div>
            <h2 className="text-base font-semibold text-slate-900">Your Wishlist is Empty</h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed font-normal">
              Tap the bookmark icon on any travel guide to keep quick reference tabs here.
            </p>
            <button
              onClick={onNavigateToExplore}
              className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-medium inline-flex items-center gap-1.5 shadow-xs transition-all"
            >
              Browse Destinations
              <Compass className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {savedDestinations.map((dest) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => onSelectDestination(dest)}
                className="bg-white rounded-2xl p-3 border border-slate-200/90 hover:border-slate-300 transition-all flex items-center gap-3 cursor-pointer shadow-xs group"
              >
                <img
                  src={dest.coverImage}
                  alt={dest.name}
                  className="w-18 h-18 rounded-xl object-cover group-hover:scale-103 transition-transform shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {dest.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-900">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {dest.rating}
                    </div>
                  </div>

                  <h3 className="font-semibold text-sm text-slate-900 truncate mt-1">
                    {dest.name}
                  </h3>

                  <p className="text-xs text-slate-500 flex items-center gap-1 truncate mt-0.5 font-normal">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {dest.location}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-500">{dest.elevation}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveBookmark(dest.id);
                      }}
                      className="text-rose-600 hover:underline font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
