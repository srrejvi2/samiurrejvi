import React from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, Calendar, BookOpen, AlertCircle, Sparkles } from 'lucide-react';
import { ArchivePhoto } from '../types';

interface LightboxProps {
  photo: ArchivePhoto | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function Lightbox({ photo, onClose, onPrev, onNext }: LightboxProps) {
  if (!photo) return null;

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext]);

  // Prevent background scroll when open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-slate-950/98 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6"
      id="lightbox-overlay"
      onClick={(e) => {
        if ((e.target as HTMLElement).id === 'lightbox-overlay') onClose();
      }}
    >
      {/* Lightbox container */}
      <div className="relative w-full max-w-6xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-full max-h-[85vh] text-slate-900 border border-slate-100">
        
        {/* Navigation buttons */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-slate-900/60 hover:bg-slate-900 text-white p-2 rounded-full transition-all cursor-pointer shadow-lg hover:scale-105"
          title="Close Lightbox"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Carousel Prev button */}
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-slate-800 p-3 rounded-full transition-all cursor-pointer shadow-xl border border-slate-100 hover:-translate-x-1 hover:scale-105 active:scale-95"
          title="Previous Image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Carousel Next button */}
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-slate-800 p-3 rounded-full transition-all cursor-pointer shadow-xl border border-slate-100 hover:translate-x-1 hover:scale-105 active:scale-95"
          title="Next Image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Left Side: Photo Frame */}
        <div className="w-full md:w-3/5 bg-slate-950 relative flex items-center justify-center overflow-hidden h-[45%] md:h-full group">
          <img 
            src={photo.url} 
            alt=""
            className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 select-none pointer-events-none"
          />
          <img 
            src={photo.url} 
            alt={photo.title}
            className="relative z-10 w-full h-full object-contain pointer-events-none select-none transition-transform duration-700 ease-out"
          />
          <div className="absolute bottom-4 left-4 right-4 bg-slate-950/70 p-3.5 rounded-xl backdrop-blur-xs text-white max-w-fit flex items-center gap-2 border border-white/10 shadow-md z-20">
            <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="text-xs font-mono uppercase tracking-wider">{photo.location}</span>
          </div>
        </div>

        {/* Right Side: Editorial Stories panel */}
        <div className="w-full md:w-2/5 flex flex-col justify-between p-6 sm:p-10 overflow-y-auto bg-slate-50 h-[55%] md:h-full border-t md:border-t-0 md:border-l border-slate-100">
          <div className="space-y-6">
            
            {/* Meta Tags */}
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase border ${
                photo.category === 'photoshop' 
                  ? 'bg-purple-50 text-purple-600 border-purple-100' 
                  : 'bg-blue-50 text-blue-600 border-blue-100'
              }`}>
                {photo.category === 'photoshop' ? 'Masterpiece Composition' : 'Travel Chronicle'}
              </span>
              <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>{photo.date}</span>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 leading-tight">
              {photo.title}
            </h3>

            {/* Summary description */}
            <p className="text-sm font-sans text-slate-600 italic border-l-2 border-slate-300 pl-3 whitespace-pre-wrap">
              {photo.description}
            </p>

            {/* Humanized Essay / Story detailing successes or learning from failures */}
            <div className="space-y-3.5 min-h-[140px]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-widest">
                {photo.story.toLowerCase().includes('fail') ? (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Lessons from Failures</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    <span>The Chronicle of Success</span>
                  </>
                )}
              </div>
              
              <p className="text-sm leading-relaxed text-slate-705 font-sans font-normal antialiased whitespace-pre-wrap">
                {photo.story}
              </p>
            </div>

          </div>

          {/* Footer Metadata in lightbox */}
          <div className="pt-6 border-t border-slate-200 mt-8 flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            <span>Digital Photo Archive</span>
            <span>ID: {photo.id}</span>
          </div>

        </div>

      </div>
    </div>
  );
}
