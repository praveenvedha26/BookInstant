import React, { useState } from 'react';
import { Bell, BellCheck, Calendar, Flame, Zap, Star } from 'lucide-react';

export default function UpcomingSection({ movies, onSelectMovie }) {
  const [notifiedMovies, setNotifiedMovies] = useState({});

  const upcomingMovies = movies.filter((m) => m.isUpcoming);

  const toggleNotify = (movieId, title) => {
    setNotifiedMovies((prev) => {
      const nextState = { ...prev, [movieId]: !prev[movieId] };
      return nextState;
    });
  };

  return (
    <section className="py-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold mb-2">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Anticipated Blockbusters
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            Upcoming & Pre-Book Premieres
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Lock advance seats before anyone else or subscribe for instant premiere alert notifications.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {upcomingMovies.map((movie) => {
          const isNotified = !!notifiedMovies[movie.id];
          return (
            <div
              key={movie.id}
              className="bg-dark-800 rounded-3xl overflow-hidden border border-white/10 hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col group"
            >
              {/* Media Poster */}
              <div className="relative aspect-[16/9] overflow-hidden bg-dark-900">
                <img
                  src={movie.backdropUrl || movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/30 to-transparent" />

                {/* Pre-Book Tag */}
                {movie.isPreBook && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-rose-600 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-xl shadow-lg shadow-rose-600/30">
                    Pre-Book Active
                  </div>
                )}

                {/* Format & Rating */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-bold text-sky-300 border border-white/10">
                    {movie.format || 'IMAX'}
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md text-xs font-bold text-amber-300 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-300" />
                    {movie.rating}
                  </span>
                </div>

                <div className="absolute bottom-3 left-4 flex items-center gap-2 text-xs text-amber-300 font-bold">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Release: {movie.releaseDate || 'Coming Soon'}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-black text-white group-hover:text-amber-300 transition-colors">
                    {movie.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {movie.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center gap-3">
                  {movie.isPreBook ? (
                    <button
                      onClick={() => onSelectMovie(movie)}
                      className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all hover:scale-105 active:scale-95"
                    >
                      <Zap className="w-4 h-4 fill-white" />
                      Pre-Book Seats
                    </button>
                  ) : null}

                  <button
                    onClick={() => toggleNotify(movie.id, movie.title)}
                    className={`flex-1 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                      isNotified
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-dark-700/80 hover:bg-dark-600 text-slate-300 hover:text-white border-white/10'
                    }`}
                  >
                    {isNotified ? (
                      <>
                        <BellCheck className="w-4 h-4 text-emerald-400" />
                        <span>Notified ✓</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-4 h-4 text-amber-400" />
                        <span>Notify Me</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
