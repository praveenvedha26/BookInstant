import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Clock, Sparkles, ChevronLeft, ChevronRight, Zap, ShieldCheck } from 'lucide-react';

export default function HeroCarousel({ movies, onBookNow }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Take top 4 or 5 spotlight movies
  const spotlightMovies = (movies && movies.length > 0)
    ? movies.slice(0, 5)
    : [];

  useEffect(() => {
    if (spotlightMovies.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % spotlightMovies.length);
    }, 5000); // 5-second auto rotation

    return () => clearInterval(interval);
  }, [spotlightMovies.length, isPaused]);

  if (spotlightMovies.length === 0) return null;

  const currentMovie = spotlightMovies[currentIndex];

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + spotlightMovies.length) % spotlightMovies.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % spotlightMovies.length);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full rounded-3xl overflow-hidden mb-12 border border-white/10 shadow-2xl bg-dark-900 group"
    >
      {/* Background Animated Backdrop Image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMovie.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.45, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0 z-0"
        >
          <img
            src={currentMovie.backdropUrl || currentMovie.posterUrl}
            alt={currentMovie.title}
            className="w-full h-full object-cover object-center"
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradients */}
      <div className="absolute inset-0 z-1 bg-gradient-to-t from-dark-950 via-dark-900/80 to-transparent" />
      <div className="absolute inset-0 z-1 bg-gradient-to-r from-dark-950 via-dark-950/80 to-transparent" />

      {/* Content Container */}
      <div className="relative z-10 p-8 sm:p-12 lg:p-16 max-w-4xl flex flex-col justify-end min-h-[460px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMovie.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5 }}
          >
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                Spotlight Release #{currentIndex + 1}
              </span>

              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-extrabold tracking-wide flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-300" />
                {currentMovie.rating} / 10
              </span>

              <span className="px-2.5 py-0.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40 text-xs font-bold">
                {currentMovie.format || 'IMAX'}
              </span>

              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                {currentMovie.ageRating || '13+'}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-3 drop-shadow-md">
              {currentMovie.title}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-300 mb-4 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-slate-400" />
                {currentMovie.durationMins} Mins
              </span>
              <span>•</span>
              <span>{currentMovie.genre}</span>
              <span>•</span>
              <span>{currentMovie.language || 'English'}</span>
            </div>

            {/* Storyline Description */}
            <p className="text-sm sm:text-base text-slate-300 mb-8 max-w-2xl line-clamp-2 leading-relaxed drop-shadow">
              {currentMovie.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => onBookNow(currentMovie)}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-extrabold text-base shadow-xl shadow-rose-600/40 hover:scale-105 active:scale-95 transition-all glow-brand"
              >
                <Zap className="w-5 h-5 fill-white text-white" />
                Book Instant Seats
              </button>

              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-dark-800/90 border border-white/10 text-xs text-slate-300 backdrop-blur-md">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero Race Conditions • Redisson Distributed Lock</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Manual Navigation Arrows (‹ and ›) */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-2xl bg-black/40 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
        title="Previous Spotlight"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-2xl bg-black/40 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
        title="Next Spotlight"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Pagination Dots at Bottom */}
      <div className="absolute bottom-6 right-8 sm:right-12 z-20 flex items-center gap-2">
        {spotlightMovies.map((m, idx) => (
          <button
            key={m.id}
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all rounded-full ${
              currentIndex === idx
                ? 'w-8 h-2.5 bg-gradient-to-r from-rose-500 to-amber-500 shadow-md shadow-rose-500/50'
                : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/60'
            }`}
            title={`Slide ${idx + 1}: ${m.title}`}
          />
        ))}
      </div>
    </div>
  );
}
