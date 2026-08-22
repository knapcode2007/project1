import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Star, Sparkles } from 'lucide-react';
import { Review } from '../types';

interface AddReviewModalProps {
  destinationName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (review: Omit<Review, 'id' | 'date' | 'helpfulCount' | 'userVotedHelpful'>) => void;
  onShowToast: (title: string, description?: string) => void;
}

export const AddReviewModal: React.FC<AddReviewModalProps> = ({
  destinationName,
  isOpen,
  onClose,
  onSubmit,
  onShowToast,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [author, setAuthor] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('Sunrise Summit');

  if (!isOpen) return null;

  const tags = [
    'Sunrise Summit',
    'Yoshida Trail',
    'Solo Hiker',
    'Photography',
    'Family Trip',
    'Gear Advice',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !content.trim()) return;

    const initials = author
      .trim()
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'TR';

    onSubmit({
      author: author.trim(),
      avatarInitial: initials,
      rating,
      content: content.trim(),
      tags: selectedTag ? [selectedTag] : undefined,
    });

    onShowToast('Review Published', `Thank you for reviewing ${destinationName}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center">
              <Star className="w-4 h-4 fill-slate-700 text-slate-700" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-slate-900 leading-tight">
                Review {destinationName}
              </h3>
              <p className="text-xs text-slate-500 font-normal">Share your experience with travelers</p>
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
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4">
          {/* Star Rating Selector */}
          <div className="text-center py-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs font-medium text-slate-600 mb-2">Select Your Rating</p>
            <div className="flex items-center justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-hidden transform transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-medium text-slate-700 mt-1.5">
              {rating === 5 && 'Outstanding / Life-Changing'}
              {rating === 4 && 'Very Good / Highly Recommended'}
              {rating === 3 && 'Good / Worth Visiting'}
              {rating === 2 && 'Fair / Needs Preparation'}
              {rating === 1 && 'Challenging / Tough Conditions'}
            </p>
          </div>

          {/* Author Name */}
          <div>
            <label className="text-xs font-medium text-slate-900 block mb-1.5">
              Your Name / Explorer Handle
            </label>
            <input
              type="text"
              required
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g., Alex Rivers"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:outline-hidden focus:border-slate-900"
            />
          </div>

          {/* Tag Selection */}
          <div>
            <label className="text-xs font-medium text-slate-900 block mb-1.5">
              Trip Category / Tag
            </label>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTag(t)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedTag === t
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Review Content */}
          <div>
            <label className="text-xs font-medium text-slate-900 block mb-1.5">
              Your Review & Advice
            </label>
            <textarea
              required
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share trail conditions, sunrise timing, gear essentials, and memorable moments..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-slate-900 placeholder:text-slate-400 font-normal"
            />
          </div>

          {/* Guidelines badge */}
          <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-slate-700 shrink-0" />
            <p className="text-[11px] text-slate-600 leading-tight font-normal">
              Honest hiker insights help fellow travelers pack accurately and safely explore.
            </p>
          </div>

          {/* Actions */}
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
              Publish Review
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
