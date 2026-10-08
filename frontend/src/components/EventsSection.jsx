import React, { useState } from 'react';
import { Music, Mic, Theater, MapPin, Calendar, Ticket, Sparkles, Zap } from 'lucide-react';

const EVENT_CATEGORIES = ['All Events', 'Live Music', 'Stand-Up Comedy', 'Theatre & Plays'];

export default function EventsSection({ events, onBookEvent }) {
  const [selectedCategory, setSelectedCategory] = useState('All Events');

  const filteredEvents = events.filter((e) => {
    if (selectedCategory === 'All Events') return true;
    return e.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Live Music':
        return <Music className="w-4 h-4 text-rose-400" />;
      case 'Stand-Up Comedy':
        return <Mic className="w-4 h-4 text-amber-400" />;
      case 'Theatre & Plays':
        return <Theater className="w-4 h-4 text-indigo-400" />;
      default:
        return <Ticket className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <section className="py-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            District Live Experiences
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            Live Music, Comedy & Theatre
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Curated offline experiences with reserved seating and instant ticket passes.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {EVENT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-dark-800 text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            className="bg-dark-800 rounded-3xl overflow-hidden border border-white/10 hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/20 flex flex-col group cursor-pointer"
            onClick={() => onBookEvent(evt)}
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-dark-900">
              <img
                src={evt.banner}
                alt={evt.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent" />

              {/* Tag */}
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-extrabold text-amber-300 border border-white/10 flex items-center gap-1">
                {getCategoryIcon(evt.category)}
                {evt.tag}
              </div>

              {/* Price */}
              <div className="absolute bottom-3 right-3 bg-indigo-600/90 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-extrabold text-white shadow-lg shadow-indigo-600/30">
                From ₹{evt.price}
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                  {evt.category}
                </span>
                <h3 className="text-base font-extrabold text-white mt-1 group-hover:text-indigo-300 transition-colors line-clamp-2">
                  {evt.title}
                </h3>

                <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{evt.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="truncate">{evt.venue}, {evt.city}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBookEvent(evt);
                }}
                className="mt-5 w-full py-2.5 rounded-xl bg-dark-700 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-white/10 group-hover:border-indigo-500"
              >
                <Zap className="w-3.5 h-3.5" />
                Book Passes
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
