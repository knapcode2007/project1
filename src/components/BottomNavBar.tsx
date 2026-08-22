import React from 'react';
import { Compass, Mountain, Calendar, Bookmark, Home } from 'lucide-react';

export type AppTab = 'explore' | 'itinerary' | 'destination' | 'saved';

interface BottomNavBarProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  itineraryCount: number;
  savedCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onTabChange,
  itineraryCount,
  savedCount,
}) => {
  return (
    <nav
      id="bottom-app-navigation"
      className="fixed bottom-0 left-0 right-0 md:max-w-[640px] md:mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 z-50 flex items-center justify-around shadow-xs"
    >
      {/* 1. Home / Explore */}
      <button
        id="nav-home"
        onClick={() => onTabChange('explore')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
          currentTab === 'explore'
            ? 'text-slate-900 font-medium'
            : 'text-slate-400 hover:text-slate-600 font-normal'
        }`}
      >
        <div className="relative">
          <Home className="w-5 h-5" />
          {currentTab === 'explore' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-slate-900" />
          )}
        </div>
        <span className="text-[11px]">Home</span>
      </button>

      {/* 2. Itinerary */}
      <button
        id="nav-itinerary"
        onClick={() => onTabChange('itinerary')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all relative ${
          currentTab === 'itinerary'
            ? 'text-slate-900 font-medium'
            : 'text-slate-400 hover:text-slate-600 font-normal'
        }`}
      >
        <div className="relative">
          <Calendar className="w-5 h-5" />
          {itineraryCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-slate-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-semibold">
              {itineraryCount}
            </span>
          )}
          {currentTab === 'itinerary' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-slate-900" />
          )}
        </div>
        <span className="text-[11px]">Itinerary</span>
      </button>

      {/* 3. Details / Guide */}
      <button
        id="nav-destination"
        onClick={() => onTabChange('destination')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
          currentTab === 'destination'
            ? 'text-slate-900 font-medium'
            : 'text-slate-400 hover:text-slate-600 font-normal'
        }`}
      >
        <div className="relative">
          <Mountain className="w-5 h-5" />
          {currentTab === 'destination' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-slate-900" />
          )}
        </div>
        <span className="text-[11px]">Details</span>
      </button>

      {/* 4. Saved / Bookmarks */}
      <button
        id="nav-saved"
        onClick={() => onTabChange('saved')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all relative ${
          currentTab === 'saved'
            ? 'text-slate-900 font-medium'
            : 'text-slate-400 hover:text-slate-600 font-normal'
        }`}
      >
        <div className="relative">
          <Bookmark className="w-5 h-5" />
          {savedCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-slate-200 text-slate-700 text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-semibold">
              {savedCount}
            </span>
          )}
          {currentTab === 'saved' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-slate-900" />
          )}
        </div>
        <span className="text-[11px]">Saved</span>
      </button>
    </nav>
  );
};
