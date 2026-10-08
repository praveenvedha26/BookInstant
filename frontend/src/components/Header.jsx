import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, Search, ChevronDown, User, Sparkles, Film, 
  Ticket, Calendar, X, Check, ExternalLink, KeyRound, LogOut, Shield, ShieldAlert 
} from 'lucide-react';
import { api } from '../services/api';

export const CITIES = ['Chennai', 'Mumbai', 'Bengaluru'];

export default function Header({
  activeTab,
  setActiveTab,
  selectedCity,
  setSelectedCity,
  currentUser,
  onOpenProfile,
  onOpenAuthModal,
  onLogout,
  onSearch,
  searchQuery,
  setSearchQuery
}) {
  const navigate = useNavigate();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const profileDropdownRef = useRef(null);
  const cityDropdownRef = useRef(null);

  const isAuthenticated = Boolean(currentUser && currentUser.token);
  const rawRole = currentUser?.role || 'USER';
  const isAdmin = rawRole === 'ADMIN' || rawRole === 'ROLE_ADMIN';

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) {
        setShowCityDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'for-you', path: '/', label: 'For You' },
    { id: 'movies', path: '/movies', label: 'Movies' },
    { id: 'categories', path: '/categories', label: 'Categories' },
    { id: 'upcoming', path: '/upcoming', label: 'Upcoming & Pre-Book' },
    { id: 'events', path: '/events', label: 'Events' }
  ];

  const handleNavClick = (item) => {
    if (setActiveTab) setActiveTab(item.id);
    navigate(item.path);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 backdrop-blur-xl bg-[#090a0f]/90">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-3.5 flex items-center justify-between gap-6">
        
        {/* Left: Clean Brand Logo + District Style Location Pill */}
        <div className="flex items-center gap-4 shrink-0">
          <Link 
            to="/" 
            onClick={() => setActiveTab && setActiveTab('for-you')} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-600/30 group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-white group-hover:text-rose-400 transition-colors">
              BookInstant
            </span>
          </Link>

          {/* District Style Location Badge: 📍 Chennai ▼ (Subtle Pill) */}
          <div className="relative" ref={cityDropdownRef}>
            <button
              onClick={() => setShowCityDropdown(!showCityDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/10 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>{selectedCity}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showCityDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showCityDropdown && (
              <div className="absolute left-0 mt-2 w-36 bg-dark-800 border border-white/15 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95">
                {CITIES.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedCity(city);
                      setShowCityDropdown(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                      selectedCity === city
                        ? 'text-rose-400 bg-rose-500/10'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{city}</span>
                    {selectedCity === city && <Check className="w-3.5 h-3.5 text-rose-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: District Navigation with Generous Gap Spacing & Sleek Accent Bars */}
        <nav className="hidden lg:flex items-center gap-7">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`relative py-2 text-sm font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{item.label}</span>
                {/* Sleek bottom accent bar with soft glow */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 to-amber-500 rounded-full shadow-[0_0_12px_rgba(244,63,94,0.8)]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Far Right: Search, EXPLICIT ADMIN PORTAL ENTRY POINT & User Profile Dropdown */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Search Trigger */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            title="Search movies, genres, theatres"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* 🌟 EXPLICIT, VISIBLE ACCESS POINT FOR ADMIN LOGIN */}
          <Link
            to="/admin/login"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 border border-amber-500/35 hover:border-amber-400 transition-all shadow-sm"
            title="Explicit entry point for Admin Login (/admin/login)"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Admin Portal</span>
          </Link>

          {/* User Profile Avatar Dropdown */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-2 p-1.5 pl-2.5 pr-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition-all hover:border-white/20"
              title="User Account & Bookings"
            >
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-rose-500/20">
                {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
              </div>
              <span className="text-xs font-semibold text-slate-200 max-w-[110px] truncate hidden sm:inline">
                {currentUser?.displayName || currentUser?.name || 'Sign In'}
              </span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-dark-900/95 border border-white/15 rounded-2xl shadow-2xl p-3 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95">
                {/* User Identity Header */}
                <div className="px-3 py-3 bg-dark-800/80 rounded-xl border border-white/10 mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold text-white truncate">
                      {currentUser?.name || 'Guest User'}
                    </p>
                    <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {isAdmin ? 'ROLE_ADMIN' : isAuthenticated ? 'ROLE_USER' : 'GUEST'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {currentUser?.email || 'Not authenticated'}
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      navigate('/my-bookings');
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Ticket className="w-4 h-4 text-rose-400" />
                    <span>My Bookings</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      navigate('/profile');
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <User className="w-4 h-4 text-indigo-400" />
                    <span>My Profile</span>
                  </button>

                  {/* Explicit Admin Access Point */}
                  <Link
                    to="/admin/login"
                    onClick={() => setShowProfileDropdown(false)}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      <span>Admin Portal Login</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold">/admin/login</span>
                  </Link>
                </div>

                <div className="my-2 border-t border-white/10" />

                {/* Authentication Toggle */}
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      if (onLogout) onLogout();
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      navigate('/login');
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Sign In / Create Account</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Overlay Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-24 px-4 animate-in fade-in">
          <div className="bg-dark-800 border border-white/20 w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowSearchModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <Search className="w-6 h-6 text-rose-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  onSearch(e.target.value);
                }}
                placeholder="Search movies by title, genre, actor, or format (IMAX, 3D)..."
                autoFocus
                className="w-full bg-transparent text-lg text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="text-slate-400 py-1">Quick Filters:</span>
              {['IMAX', 'Sci-Fi', 'Action', 'Horror', 'Tamil', 'Dune', 'Oppenheimer', 'Gladiator'].map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    setSearchQuery(tag);
                    onSearch(tag);
                    setShowSearchModal(false);
                    if (setActiveTab) setActiveTab('for-you');
                    navigate('/');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-dark-700 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors border border-white/10"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
