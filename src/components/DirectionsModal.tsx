import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Navigation, 
  Bus, 
  Train, 
  Car, 
  MapPin, 
  Clock, 
  Check, 
  ExternalLink, 
  AlertTriangle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Destination, TransitOption } from '../types';

interface DirectionsModalProps {
  destination: Destination;
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (title: string, description?: string) => void;
}

export const DirectionsModal: React.FC<DirectionsModalProps> = ({
  destination,
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [selectedTransitId, setSelectedTransitId] = useState<string>(
    destination.transitOptions[0]?.id || ''
  );
  const [copiedCoords, setCopiedCoords] = useState(false);

  if (!isOpen) return null;

  const currentOption = destination.transitOptions.find(
    (opt) => opt.id === selectedTransitId
  ) || destination.transitOptions[0];

  const handleCopyCoords = () => {
    const coords = `${destination.coordinates.lat}, ${destination.coordinates.lng}`;
    navigator.clipboard.writeText(coords);
    setCopiedCoords(true);
    onShowToast('Coordinates copied', `${coords} copied to clipboard`);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const getModeIcon = (mode: TransitOption['mode']) => {
    switch (mode) {
      case 'Direct Bus':
        return <Bus className="w-4 h-4" />;
      case 'Express Train':
      case 'Train & Bus':
        return <Train className="w-4 h-4" />;
      case 'Car / Taxi':
        return <Car className="w-4 h-4" />;
      default:
        return <Navigation className="w-4 h-4" />;
    }
  };

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
            <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-slate-900 leading-tight">
                Directions to {destination.name}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-normal">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {destination.location}
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

        {/* Modal Content */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Quick Route Selector */}
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Select Travel Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {destination.transitOptions.map((opt) => {
                const isSelected = opt.id === selectedTransitId;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedTransitId(opt.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className={`p-1.5 rounded-lg ${isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        {getModeIcon(opt.mode)}
                      </span>
                      <span className="text-xs font-medium text-slate-700">{opt.estimatedCost}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 truncate">{opt.mode}</p>
                      <p className="text-[11px] text-slate-500 font-normal">{opt.duration}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Option Details */}
          {currentOption && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-medium text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full">
                    Recommended Route
                  </span>
                  <h4 className="font-semibold text-sm text-slate-900 mt-1">{currentOption.from}</h4>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-600" />
                    {currentOption.duration}
                  </div>
                  <span className="text-xs text-slate-500 font-normal">{currentOption.frequency}</span>
                </div>
              </div>

              {/* Step-by-step route */}
              <div className="space-y-3">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Step-by-Step Route
                </p>
                <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-300">
                  {currentOption.steps.map((step, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-semibold">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-slate-700 font-normal leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pro Tip */}
              <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  <strong className="text-slate-900 font-medium">Travel Tip: </strong>
                  {currentOption.recommendedFor}
                </p>
              </div>
            </div>
          )}

          {/* Coordinates & Map Launch */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleCopyCoords}
              className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              {copiedCoords ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  Copied GPS
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 text-slate-500" />
                  Copy GPS Coordinates
                </>
              )}
            </button>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination.name + ' ' + destination.location)}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              Open in Maps
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Altitude / Safety Warning */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 leading-relaxed font-normal">
              <strong className="font-medium text-amber-900">High Altitude Notice:</strong> 5th Station sits at 2,305m. Rest for 1–2 hours at the station plaza to acclimate before attempting any summit trail.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors"
          >
            Got It
          </button>
        </div>
      </motion.div>
    </div>
  );
};
