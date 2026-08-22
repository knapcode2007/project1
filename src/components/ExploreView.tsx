import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  MapPin, 
  Star, 
  Bookmark, 
  BookmarkCheck, 
  Compass, 
  Sparkles, 
  ChevronRight,
  Mountain,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { Destination } from '../types';

interface ExploreViewProps {
  destinations: Destination[];
  bookmarkedIds: string[];
  onSelectDestination: (destination: Destination) => void;
  onToggleBookmark: (destinationId: string) => void;
  onShowToast: (title: string, description?: string) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  destinations,
  bookmarkedIds,
  onSelectDestination,
  onToggleBookmark,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Mountain', 'Lakes & Nature', 'Cultural', 'Historic'];

  const filteredDestinations = useMemo(() => {
    return destinations.filter((dest) => {
      const matchesCategory =
        selectedCategory === 'All' || dest.category === selectedCategory;
      const matchesSearch =
        dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [destinations, selectedCategory, searchQuery]);

  return (
    <div className="w-full bg-slate-50/60 min-h-screen flex flex-col pb-28">
      {/* Header */}
      <div className="bg-white p-4 border-b border-slate-200 sticky top-0 z-20">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-1 text-slate-500">
              <Compass className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold uppercase tracking-widest">Zenith Travel</span>
            </div>
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight mt-0.5">Explore Japan</h1>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-semibold text-xs border border-slate-200">
            ZT
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search mountains, lakes, shrines, trails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400 font-normal"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pt-2.5 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Destination Grid / Cards */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredDestinations.length} destinations</span>
          <span className="flex items-center gap-1 font-medium text-slate-700">
            <Sparkles className="w-3 h-3 text-slate-700" />
            Curated Guides
          </span>
        </div>

        <div className="space-y-4">
          {filteredDestinations.map((dest) => {
            const isBookmarked = bookmarkedIds.includes(dest.id);
            return (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                onClick={() => onSelectDestination(dest)}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs cursor-pointer group transition-all"
              >
                {/* Card Image */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                  <img
                    src={dest.coverImage}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="px-2.5 py-0.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white font-medium text-[11px]">
                      {dest.category}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleBookmark(dest.id);
                      onShowToast(
                        isBookmarked ? 'Removed from Bookmarks' : 'Saved to Bookmarks',
                        `${dest.name} ${isBookmarked ? 'removed from' : 'added to'} your wishlist.`
                      );
                    }}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
                      isBookmarked
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'bg-black/30 hover:bg-black/50 text-white border border-white/15'
                    }`}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="w-4 h-4 fill-slate-900 text-slate-900" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>

                  {/* Bottom Text Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-base text-white tracking-tight">{dest.name}</h3>
                      <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded text-xs font-medium text-amber-300">
                        <Star className="w-3 h-3 fill-amber-300" />
                        {dest.rating}
                      </div>
                    </div>
                    <p className="text-xs text-slate-200 flex items-center gap-1 mt-0.5 truncate font-normal">
                      <MapPin className="w-3 h-3 text-slate-300" />
                      {dest.location}
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                    {dest.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2 text-slate-500">
                      <span>Hours: {dest.openingHours.split('(')[0]}</span>
                      <span>•</span>
                      <span>{dest.entryFee.split('(')[0]}</span>
                    </div>

                    <div className="flex items-center gap-1 font-medium text-slate-900 group-hover:translate-x-0.5 transition-transform">
                      Details
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
