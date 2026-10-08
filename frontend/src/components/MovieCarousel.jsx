import React from 'react';
import { Star, ChevronRight, Zap } from 'lucide-react';

export default function MovieCarousel({ title, movies, onSelectMovie }) {
  if (!movies || movies.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            {title}
          </h2>
          <p className="text-xs text-slate-400 mt-1">Live in theatres with real-time seat lock availability</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <div
            key={movie.id}
            onClick={() => onSelectMovie(movie)}
            className="group relative bg-dark-800 rounded-2xl overflow-hidden border border-white/10 hover:border-rose-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-rose-500/20 cursor-pointer flex flex-col"
          >
            {/* Poster wrapper */}
            <div className="relative aspect-[2/3] overflow-hidden bg-dark-900">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

              {/* Rating badge */}
              <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1 text-xs font-bold text-amber-300">
                <Star className="w-3.5 h-3.5 fill-amber-300" />
                {movie.rating}
              </div>

              {/* Format Badge */}
              <div className="absolute top-3 left-3 bg-rose-600/90 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-extrabold text-white tracking-wider uppercase">
                {movie.format || '2D'}
              </div>

              {/* Age tag */}
              <div className="absolute bottom-3 left-3 bg-dark-800/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-slate-300 border border-white/10">
                {movie.ageRating || '13+'}
              </div>
            </div>

            {/* Movie Info */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-white text-base truncate group-hover:text-rose-400 transition-colors">
                  {movie.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <span>{movie.genre}</span>
                  <span>•</span>
                  <span>{movie.durationMins}m</span>
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectMovie(movie);
                }}
                className="mt-4 w-full py-2.5 rounded-xl bg-dark-700 hover:bg-rose-600 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-white/10 group-hover:border-rose-500"
              >
                <Zap className="w-3.5 h-3.5" />
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
