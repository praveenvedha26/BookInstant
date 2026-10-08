import React, { useState } from 'react';
import { Star, Zap, Filter, Sparkles, Check, Film, Clock } from 'lucide-react';

const GENRES = ['All', 'Action', 'Sci-Fi', 'Horror', 'Drama', 'Comedy'];
const FORMATS = ['IMAX', '2D', '3D'];
const AGE_RATINGS = ['13+', '15+', '18+'];
const LANGUAGES = ['English', 'Tamil', 'Hindi'];

export default function CategoryGrid({ movies, onSelectMovie }) {
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedFormats, setSelectedFormats] = useState([]);
  const [selectedAgeRatings, setSelectedAgeRatings] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);

  // Multi-criteria filter logic
  const filteredMovies = movies.filter((movie) => {
    if (selectedGenre !== 'All' && movie.genre?.toLowerCase() !== selectedGenre.toLowerCase()) {
      return false;
    }
    if (selectedFormats.length > 0 && !selectedFormats.includes(movie.format)) {
      return false;
    }
    if (selectedAgeRatings.length > 0 && !selectedAgeRatings.includes(movie.ageRating)) {
      return false;
    }
    if (selectedLanguages.length > 0 && movie.language && !selectedLanguages.includes(movie.language)) {
      return false;
    }
    return true;
  });

  const toggleFilter = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const hasActiveFilters = selectedFormats.length > 0 || selectedAgeRatings.length > 0 || selectedLanguages.length > 0 || selectedGenre !== 'All';

  const resetFilters = () => {
    setSelectedGenre('All');
    setSelectedFormats([]);
    setSelectedAgeRatings([]);
    setSelectedLanguages([]);
  };

  return (
    <section className="py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            District Catalog Explorer
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Explore All Movies by Genre
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse the complete catalog with live multi-filter dimensions and instant seat reservations.
          </p>
        </div>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-xs text-rose-400 hover:text-rose-300 font-bold self-start sm:self-auto underline"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* Genre Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {GENRES.map((genre) => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`px-5 py-2 rounded-2xl text-xs font-bold transition-all ${
              selectedGenre === genre
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 scale-105'
                : 'bg-dark-800 text-slate-400 hover:text-white hover:bg-dark-700 border border-white/10'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Top Multi-Filter Row: Format, Age Rating, Language */}
      <div className="bg-dark-800/80 rounded-2xl p-4 border border-white/10 mb-8 flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Formats */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">Format:</span>
          <div className="flex gap-1.5">
            {FORMATS.map((fmt) => {
              const active = selectedFormats.includes(fmt);
              return (
                <button
                  key={fmt}
                  onClick={() => toggleFilter(selectedFormats, setSelectedFormats, fmt)}
                  className={`px-3 py-1 rounded-xl font-bold border transition-all ${
                    active
                      ? 'bg-sky-500/30 border-sky-400 text-sky-200'
                      : 'bg-dark-700 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {fmt} {active && '✓'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Age Ratings */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">Age Rating:</span>
          <div className="flex gap-1.5">
            {AGE_RATINGS.map((age) => {
              const active = selectedAgeRatings.includes(age);
              return (
                <button
                  key={age}
                  onClick={() => toggleFilter(selectedAgeRatings, setSelectedAgeRatings, age)}
                  className={`px-3 py-1 rounded-xl font-bold border transition-all ${
                    active
                      ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200'
                      : 'bg-dark-700 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {age} {active && '✓'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Languages */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">Language:</span>
          <div className="flex gap-1.5">
            {LANGUAGES.map((lang) => {
              const active = selectedLanguages.includes(lang);
              return (
                <button
                  key={lang}
                  onClick={() => toggleFilter(selectedLanguages, setSelectedLanguages, lang)}
                  className={`px-3 py-1 rounded-xl font-bold border transition-all ${
                    active
                      ? 'bg-purple-500/30 border-purple-400 text-purple-200'
                      : 'bg-dark-700 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {lang} {active && '✓'}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Multi-Row District Category Grid showing ALL matching movies */}
      {filteredMovies.length === 0 ? (
        <div className="text-center py-20 bg-dark-800/50 rounded-3xl border border-white/10 p-8 max-w-md mx-auto">
          <Film className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Movies Match These Filters</h3>
          <p className="text-xs text-slate-400 mt-1 mb-5">Try relaxing your selected format, age, or language filters.</p>
          <button
            onClick={resetFilters}
            className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-lg shadow-rose-600/30"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => (
            <div
              key={movie.id}
              onClick={() => onSelectMovie(movie)}
              className="group relative bg-dark-800 rounded-3xl overflow-hidden border border-white/10 hover:border-rose-500/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-rose-500/20 cursor-pointer flex flex-col"
            >
              {/* Poster wrapper */}
              <div className="relative aspect-[2/3] overflow-hidden bg-dark-900">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-900/20 to-transparent" />

                {/* Rating badge */}
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 flex items-center gap-1 text-xs font-extrabold text-amber-300">
                  <Star className="w-3.5 h-3.5 fill-amber-300" />
                  {movie.rating}
                </div>

                {/* Format Badge */}
                <div className="absolute top-3 left-3 bg-rose-600/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-extrabold text-white tracking-wider uppercase">
                  {movie.format || '2D'}
                </div>

                {/* Age tag & Language */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                  <span className="bg-dark-900/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-slate-300 border border-white/10">
                    {movie.ageRating || '13+'}
                  </span>
                  <span className="bg-dark-900/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-slate-300 border border-white/10">
                    {movie.language || 'English'}
                  </span>
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-white text-base truncate group-hover:text-rose-400 transition-colors">
                    {movie.title}
                  </h3>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <span>{movie.genre}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {movie.durationMins}m
                    </span>
                  </div>
                </div>

                {/* Hover Quick "Book Now" Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectMovie(movie);
                  }}
                  className="mt-4 w-full py-2.5 rounded-xl bg-dark-700 hover:bg-rose-600 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-white/10 group-hover:border-rose-500 shadow-md group-hover:shadow-rose-600/30"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  Book Instant Seats
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
