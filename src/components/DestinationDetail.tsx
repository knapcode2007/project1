import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Bookmark, 
  BookmarkCheck, 
  Star, 
  Clock, 
  CircleDollarSign, 
  Navigation, 
  Compass, 
  ThumbsUp, 
  PlusCircle, 
  Check, 
  Share2, 
  Wind, 
  Mountain, 
  AlertCircle, 
  MessageSquarePlus, 
  Layers
} from 'lucide-react';
import { Destination, Review } from '../types';

interface DestinationDetailProps {
  destination: Destination;
  isBookmarked: boolean;
  isInItinerary: boolean;
  onToggleBookmark: (destinationId: string) => void;
  onOpenSaveModal: () => void;
  onOpenDirectionsModal: () => void;
  onOpenAddReviewModal: () => void;
  onBack?: () => void;
  onToggleHelpfulReview: (reviewId: string) => void;
  onShowToast: (title: string, description?: string) => void;
  onNavigateToItinerary: () => void;
}

export const DestinationDetail: React.FC<DestinationDetailProps> = ({
  destination,
  isBookmarked,
  isInItinerary,
  onToggleBookmark,
  onOpenSaveModal,
  onOpenDirectionsModal,
  onOpenAddReviewModal,
  onBack,
  onToggleHelpfulReview,
  onShowToast,
  onNavigateToItinerary,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');
  const [selectedReviewTag, setSelectedReviewTag] = useState<string>('all');
  const [selectedTrail, setSelectedTrail] = useState<string>(destination.trails[0]?.id || '');

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${destination.name} - Zenith Travel Guide`,
        text: `Discover ${destination.name} (${destination.elevation}) in Japan with trails, logistics, and directions.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      onShowToast('Link Copied', 'Destination link copied to clipboard.');
    }
  };

  const filteredReviews = selectedReviewTag === 'all'
    ? destination.reviews
    : destination.reviews.filter((r) => r.tags?.includes(selectedReviewTag));

  return (
    <div id="destination-detail-container" className="w-full relative bg-white flex flex-col min-h-screen pb-28">
      {/* 1. Hero Section */}
      <div className="relative w-full h-[380px] bg-slate-900 overflow-hidden">
        <img
          id="destination-hero-image"
          src={destination.coverImage}
          alt={destination.name}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Minimal Hero Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />

        {/* Top Actions Overlay */}
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10 pt-5">
          <button
            id="btn-back-navigation"
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-black/30 hover:bg-black/40 active:scale-95 backdrop-blur-md border border-white/15 flex items-center justify-center text-white transition-all"
            aria-label="Go back or browse all destinations"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <button
              id="btn-share-destination"
              onClick={handleShare}
              className="w-9 h-9 rounded-full bg-black/30 hover:bg-black/40 active:scale-95 backdrop-blur-md border border-white/15 flex items-center justify-center text-white transition-all"
              aria-label="Share destination"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              id="btn-bookmark-destination"
              onClick={() => {
                onToggleBookmark(destination.id);
                onShowToast(
                  isBookmarked ? 'Removed from Bookmarks' : 'Saved to Bookmarks',
                  `${destination.name} ${isBookmarked ? 'removed from' : 'added to'} your wishlist.`
                );
              }}
              className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all active:scale-95 ${
                isBookmarked
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'bg-black/30 hover:bg-black/40 text-white border border-white/15'
              }`}
              aria-label="Bookmark destination"
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4 fill-slate-900 text-slate-900" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Hero Text */}
        <div className="absolute bottom-0 left-0 w-full p-5 z-10 flex flex-col gap-2">
          {/* Category Chips */}
          <div className="flex items-center gap-2 text-white">
            <span className="px-2.5 py-0.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full font-medium text-[11px] text-white/90">
              {destination.category}
            </span>
            <span className="px-2.5 py-0.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full font-medium text-[11px] text-white/90">
              {destination.country}
            </span>
            {destination.elevation && (
              <span className="px-2.5 py-0.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full font-medium text-[11px] text-white/90 flex items-center gap-1">
                <Mountain className="w-3 h-3 text-slate-300" />
                {destination.elevation}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight leading-snug">
            {destination.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 text-white/90 text-xs font-medium">
            <div className="flex text-amber-300">
              <Star className="w-3.5 h-3.5 fill-amber-300" />
            </div>
            <span>
              {destination.rating} ({destination.reviewCount.toLocaleString()} reviews)
            </span>
          </div>
        </div>
      </div>

      {/* 2. Tab Navigation */}
      <div className="w-full bg-white border-b border-slate-200 flex px-5 sticky top-0 z-20">
        <button
          id="tab-overview"
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-3.5 font-medium text-xs tracking-tight transition-all text-center relative ${
            activeTab === 'overview'
              ? 'text-slate-900 font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Overview
          {activeTab === 'overview' && (
            <motion.div
              layoutId="activeTabIndicator"
              className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900"
            />
          )}
        </button>

        <button
          id="tab-reviews"
          onClick={() => setActiveTab('reviews')}
          className={`flex-1 py-3.5 font-medium text-xs tracking-tight transition-all text-center relative ${
            activeTab === 'reviews'
              ? 'text-slate-900 font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Reviews ({destination.reviews.length})
          {activeTab === 'reviews' && (
            <motion.div
              layoutId="activeTabIndicator"
              className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900"
            />
          )}
        </button>
      </div>

      {/* 3. Tab Content Area */}
      <div className="flex-1 p-5 space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-6"
            >
              {/* Description Section */}
              <section id="section-description">
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {destination.description}
                </p>
              </section>

              {/* Logistics Grid (Opening Hours & Entry Fee) */}
              <section id="section-logistics" className="grid grid-cols-2 gap-3">
                {/* Opening Hours */}
                <div className="bg-slate-50 p-3.5 rounded-xl flex flex-col gap-2 border border-slate-200/80">
                  <div className="w-7 h-7 rounded-lg bg-slate-200/70 flex items-center justify-center text-slate-700">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[11px] uppercase tracking-wider text-slate-500">
                      Opening Hours
                    </h3>
                    <p className="text-xs text-slate-800 mt-0.5 font-medium leading-snug">
                      {destination.openingHours}
                    </p>
                  </div>
                </div>

                {/* Entry Fee */}
                <div className="bg-slate-50 p-3.5 rounded-xl flex flex-col gap-2 border border-slate-200/80">
                  <div className="w-7 h-7 rounded-lg bg-slate-200/70 flex items-center justify-center text-slate-700">
                    <CircleDollarSign className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[11px] uppercase tracking-wider text-slate-500">
                      Entry Fee
                    </h3>
                    <p className="text-xs text-slate-800 mt-0.5 font-medium leading-snug">
                      {destination.entryFee}
                    </p>
                  </div>
                </div>
              </section>

              {/* Location Map Section */}
              <section id="section-location" className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-slate-900">Location</h2>
                  <span className="text-xs text-slate-500 font-normal">Honshu Island, Japan</span>
                </div>

                <div className="w-full h-44 rounded-xl overflow-hidden relative border border-slate-200 group">
                  <img
                    id="location-map-image"
                    src={destination.mapImage}
                    alt={`Location Map of ${destination.name}`}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                  {/* Map marker */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
                    <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md">
                      <Mountain className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Get Directions Interactive Pill Button */}
                  <button
                    id="btn-get-directions"
                    onClick={onOpenDirectionsModal}
                    className="absolute bottom-3 right-3 bg-white hover:bg-slate-50 active:scale-95 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-900 flex items-center gap-1.5 shadow-xs border border-slate-200 transition-all cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 text-slate-700" />
                    Directions
                  </button>
                </div>
              </section>

              {/* Weather & Mountain Safety Status */}
              {destination.weather && (
                <section className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4 text-slate-700" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Conditions & Safety
                      </h3>
                    </div>
                    <span className="text-[11px] font-medium text-teal-800 bg-teal-50 border border-teal-200/60 px-2 py-0.5 rounded-full">
                      {destination.weather.trailStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/80">
                    <div>
                      <p className="text-[11px] text-slate-500">Temp (Base/Peak)</p>
                      <p className="text-xs font-semibold text-slate-900 mt-0.5">{destination.weather.temperature}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500">Visibility</p>
                      <p className="text-xs font-semibold text-slate-900 mt-0.5">{destination.weather.visibility}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500">Wind Speed</p>
                      <p className="text-xs font-semibold text-slate-900 mt-0.5">{destination.weather.windSpeed}</p>
                    </div>
                  </div>
                </section>
              )}

              {/* Popular Trails & Climbing Routes */}
              {destination.trails && destination.trails.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-slate-900 flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-slate-700" />
                      Ascent Trails & Routes
                    </h2>
                    <span className="text-xs text-slate-500">{destination.trails.length} official routes</span>
                  </div>

                  <div className="space-y-2.5">
                    {destination.trails.map((trail) => {
                      const isSelected = selectedTrail === trail.id;
                      return (
                        <div
                          key={trail.id}
                          onClick={() => setSelectedTrail(trail.id)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-sm font-semibold text-slate-900">{trail.name}</h4>
                              <p className="text-xs text-slate-500 mt-0.5">{trail.duration} • {trail.distance}</p>
                            </div>
                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                              trail.difficulty === 'Easy'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                : trail.difficulty === 'Moderate'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                            }`}>
                              {trail.difficulty}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-2 leading-relaxed font-normal">
                            {trail.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </motion.div>
          ) : (
            /* Reviews Tab Content */
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-4"
            >
              {/* Review Summary Score Card */}
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex flex-col items-center shrink-0 pr-2">
                  <span className="text-2xl font-bold text-slate-900 leading-none">
                    {destination.rating}
                  </span>
                  <div className="flex text-amber-400 mt-1.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400/30" />
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1">
                    {destination.reviewCount.toLocaleString()} ratings
                  </span>
                </div>

                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 w-3">5</span>
                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-900 w-[90%]" />
                    </div>
                    <span className="text-[11px] text-slate-500 w-7 text-right">90%</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 w-3">4</span>
                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-900 w-[8%]" />
                    </div>
                    <span className="text-[11px] text-slate-500 w-7 text-right">8%</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 w-3">3</span>
                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-900 w-[2%]" />
                    </div>
                    <span className="text-[11px] text-slate-500 w-7 text-right">2%</span>
                  </div>
                </div>
              </div>

              {/* Action: Write a review & Filter Chips */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-[70%] no-scrollbar">
                  {['all', 'Sunrise Summit', 'Yoshida Trail', 'Gear Advice'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedReviewTag(tag)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                        selectedReviewTag === tag
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tag === 'all' ? 'All Reviews' : tag}
                    </button>
                  ))}
                </div>

                <button
                  id="btn-write-review"
                  onClick={onOpenAddReviewModal}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors shrink-0"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5 text-slate-700" />
                  Write Review
                </button>
              </div>

              {/* Review Items List */}
              <div className="flex flex-col gap-4 mt-2">
                {filteredReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="border-b border-slate-100 pb-4 last:border-0"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-3 items-center">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-semibold text-xs">
                          {rev.avatarInitial}
                        </div>
                        <div>
                          <h4 className="font-semibold text-xs text-slate-900">{rev.author}</h4>
                          <p className="text-[11px] text-slate-400">{rev.date}</p>
                        </div>
                      </div>

                      {/* Star Display */}
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${
                              s <= rev.rating ? 'fill-amber-400' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {rev.content}
                    </p>

                    {/* Tags & Helpful button */}
                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex gap-1.5">
                        {rev.tags?.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-normal"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => onToggleHelpfulReview(rev.id)}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                          rev.userVotedHelpful
                            ? 'bg-slate-100 text-slate-900 font-medium'
                            : 'text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>Helpful ({rev.helpfulCount})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 w-full md:max-w-[640px] md:left-1/2 md:-translate-x-1/2 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 pb-5 z-40">
        {isInItinerary ? (
          <div className="flex items-center gap-2">
            <button
              id="btn-view-in-itinerary"
              onClick={onNavigateToItinerary}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-medium text-xs tracking-tight flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-xs"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              In Itinerary • View Trip Plan
            </button>
            <button
              onClick={onOpenSaveModal}
              title="Edit scheduled dates or checklist"
              className="py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-medium transition-colors"
            >
              Edit
            </button>
          </div>
        ) : (
          <button
            id="btn-save-to-itinerary"
            onClick={onOpenSaveModal}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-medium text-xs tracking-tight flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Save to Itinerary
          </button>
        )}
      </div>
    </div>
  );
};
