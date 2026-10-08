import React, { useState } from 'react';
import { X, MapPin, Calendar, Clock, Star, Film, Sparkles, ChevronRight, Zap } from 'lucide-react';
import { api, DATES } from '../services/api';

export default function TheatreModal({
  movie,
  selectedCity,
  onClose,
  onSelectShowtime
}) {
  const [selectedDateId, setSelectedDateId] = useState('today');
  const theatres = api.getTheatresByCity(selectedCity);

  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-dark-900 border border-white/15 w-full max-w-4xl rounded-3xl p-6 sm:p-8 shadow-2xl relative my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-400 hover:text-white transition-colors border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Movie Spotlight (Funnel Step 1) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-white/10">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-20 h-28 object-cover rounded-2xl shadow-xl border border-white/10 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                Step 1: Choose Theatre & Showtime
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-300" />
                {movie.rating}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white">{movie.title}</h2>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>{movie.genre}</span>
              <span>•</span>
              <span>{movie.durationMins} Mins</span>
              <span>•</span>
              <span>{movie.format || 'IMAX'}</span>
              <span>•</span>
              <span>📍 {selectedCity}</span>
            </p>
          </div>
        </div>

        {/* Date Pickers Row */}
        <div className="my-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-rose-500" />
            Select Date
          </p>
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {DATES.map((d) => {
              const isSelected = selectedDateId === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDateId(d.id)}
                  className={`px-5 py-3 rounded-2xl text-xs font-bold flex flex-col items-center min-w-[90px] border transition-all ${
                    isSelected
                      ? 'bg-gradient-to-b from-rose-600 to-rose-700 text-white border-rose-500 shadow-lg shadow-rose-600/30 scale-105'
                      : 'bg-dark-800 text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-wider font-semibold opacity-80">{d.day}</span>
                  <span className="text-sm font-black mt-0.5">{d.dateStr}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Nearby Theatres & Showtime Pills */}
        <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-rose-500" />
            Nearby Theatres in {selectedCity}
          </p>

          {theatres.map((theatre) => {
            const showtimes = api.getShowtimesForTheatre(theatre.id, selectedDateId, movie.id);
            return (
              <div
                key={theatre.id}
                className="bg-dark-800/90 rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                      {theatre.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{theatre.address}</p>
                  </div>
                  <div className="flex gap-1.5">
                    {theatre.formats?.map((fmt) => (
                      <span key={fmt} className="text-[10px] font-bold px-2 py-0.5 rounded bg-dark-700 text-slate-300 border border-white/5">
                        {fmt}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Showtimes Pills */}
                <div className="flex flex-wrap gap-2.5">
                  {showtimes.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => onSelectShowtime({
                        ...st,
                        movieId: movie.id,
                        movieTitle: movie.title,
                        theatreName: theatre.name,
                        theatreAddress: theatre.address,
                        city: selectedCity,
                        dateLabel: DATES.find(d => d.id === selectedDateId)?.label || 'Today'
                      })}
                      className="group flex flex-col items-center px-4 py-2.5 rounded-xl bg-dark-700/80 hover:bg-rose-600 text-slate-200 hover:text-white border border-white/10 hover:border-rose-500 transition-all shadow-sm hover:shadow-lg hover:shadow-rose-600/30 hover:scale-105 active:scale-95"
                    >
                      <span className="text-xs font-extrabold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-rose-400 group-hover:text-white" />
                        {st.time}
                      </span>
                      <span className="text-[10px] text-slate-400 group-hover:text-rose-100 font-semibold mt-0.5">
                        {st.format} • ₹{st.price}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
