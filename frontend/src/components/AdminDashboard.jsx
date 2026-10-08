import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, Database, Clock, RefreshCw, Zap, Film, PlusCircle, CheckCircle2, 
  AlertTriangle, Play, Flame, Server, ArrowLeft, BarChart3, Activity, 
  ChevronDown, Check, Users, Building2, Calendar, Grid3X3, LogOut, ExternalLink 
} from 'lucide-react';
import { api, STANDARD_USERS, AVAILABLE_USERS } from '../services/api';

export default function AdminDashboard({ 
  onExitAdmin, 
  onMovieAdded, 
  currentUser, 
  onSwitchUser 
}) {
  const [activeSection, setActiveSection] = useState('inspector'); // 'inspector' or 'catalog'
  const [catalogSubTab, setCatalogSubTab] = useState('movies'); // 'movies', 'theatres', 'showtimes', 'seats'
  
  const [activeHolds, setActiveHolds] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [benchmarkRunning, setBenchmarkRunning] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Concurrency Demo Switcher State
  const [showDemoDropdown, setShowDemoDropdown] = useState(false);
  const demoDropdownRef = useRef(null);

  // Active simulated user for testing holds (defaults to User 1: Praveen)
  const [simulatedUser, setSimulatedUser] = useState(() => {
    return STANDARD_USERS[0];
  });

  // Movie Form State
  const [movieForm, setMovieForm] = useState({
    title: '',
    description: '',
    posterUrl: '',
    backdropUrl: '',
    genre: 'Action',
    rating: 8.5,
    durationMins: 140,
    ageRating: '13+',
    format: 'IMAX',
    isUpcoming: false,
    isPreBook: false
  });
  const [formSuccess, setFormSuccess] = useState(null);

  // Close demo dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (demoDropdownRef.current && !demoDropdownRef.current.contains(event.target)) {
        setShowDemoDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      setErrorMessage(null);
      const [holds, logs] = await Promise.all([
        api.getAdminRedisHolds(),
        api.getAuditLogs()
      ]);
      setActiveHolds(holds);
      setAuditLogs(logs);
    } catch (e) {
      console.error(e);
      setErrorMessage(e.message);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2500); // Live poll every 2.5s
    return () => clearInterval(interval);
  }, []);

  const handleRunRaceTest = async () => {
    setBenchmarkRunning(true);
    setBenchmarkResult(null);
    try {
      const res = await api.runBenchmarkRaceTest(18);
      setBenchmarkResult(res);
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setBenchmarkRunning(false);
    }
  };

  const handleSelectSimulatedUser = (user) => {
    setSimulatedUser(user);
    setShowDemoDropdown(false);
    if (onSwitchUser) {
      onSwitchUser(user);
    }
  };

  const handleCreateMovie = (e) => {
    e.preventDefault();
    if (!movieForm.title) return;

    const newMovie = {
      id: Date.now(),
      ...movieForm,
      posterUrl: movieForm.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop',
      backdropUrl: movieForm.backdropUrl || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop'
    };

    if (onMovieAdded) onMovieAdded(newMovie);
    setFormSuccess(`Movie "${movieForm.title}" added to catalog successfully!`);
    setMovieForm({
      title: '',
      description: '',
      posterUrl: '',
      backdropUrl: '',
      genre: 'Action',
      rating: 8.5,
      durationMins: 140,
      ageRating: '13+',
      format: 'IMAX',
      isUpcoming: false,
      isPreBook: false
    });
    setTimeout(() => setFormSuccess(null), 4000);
  };

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* 🌟 TOP ADMIN HEADER & BAR */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-6 mb-8 border-b border-white/10 gap-5">
        
        {/* Left: BookInstant Admin Badge */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-dark-950 font-black shadow-lg shadow-amber-500/20 shrink-0">
            <ShieldAlert className="w-6 h-6 text-dark-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                BookInstant Admin
              </h1>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono tracking-wider">
                ROLE_ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Redisson Distributed Lock Monitoring • Redis TTL Holds • Catalog Management
            </p>
          </div>
        </div>

        {/* Center & Right: Navigation Tabs + ISOLATED CONCURRENCY DEMO SWITCHER */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          
          {/* Main Module Tabs */}
          <div className="flex bg-dark-800 p-1 rounded-2xl border border-white/10 text-xs font-bold">
            <button
              onClick={() => setActiveSection('inspector')}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                activeSection === 'inspector'
                  ? 'bg-amber-500 text-dark-950 font-black shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Concurrency Inspector</span>
            </button>
            <button
              onClick={() => setActiveSection('catalog')}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                activeSection === 'catalog'
                  ? 'bg-amber-500 text-dark-950 font-black shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Catalog Management</span>
            </button>
          </div>

          {/* 🌟 ISOLATED DEMO PANEL: Concurrency Inspector & Demo Switcher Dropdown */}
          <div className="relative" ref={demoDropdownRef}>
            <button
              onClick={() => setShowDemoDropdown(!showDemoDropdown)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-dark-800 to-indigo-950/40 hover:from-amber-500/30 border border-amber-500/40 hover:border-amber-400 text-xs font-semibold text-slate-200 transition-all shadow-md group"
              title="Switch user context to inspect Redis holds & test conflicts"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="font-bold text-amber-300 truncate max-w-[200px]">
                🧪 Demo Switcher: {simulatedUser.name}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-amber-400 transition-transform duration-200 ${showDemoDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showDemoDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-dark-900/95 border border-amber-500/30 rounded-2xl shadow-2xl p-3 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95">
                
                {/* Header Information */}
                <div className="px-3 py-2.5 bg-dark-800/90 rounded-xl border border-white/10 mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      ADMIN CONCURRENCY TEST SWITCHER
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Isolated in /admin
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300 mt-1">
                    Switches active user context dynamically for testing real-time Redis seat locking, viewing active key TTLs, and testing conflict responses.
                  </p>
                </div>

                {/* Available Standard User Profiles */}
                <div className="space-y-1">
                  {STANDARD_USERS.map((user) => {
                    const isSelected = simulatedUser.id === user.id;
                    return (
                      <button
                        key={user.id}
                        onClick={() => handleSelectSimulatedUser(user)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-600/30'
                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                            isSelected ? 'bg-white text-rose-600' : 'bg-dark-700 text-slate-200 border border-white/10'
                          }`}>
                            U{user.id}
                          </div>
                          <div className="min-w-0">
                            <p className="leading-tight font-bold truncate">{user.name}</p>
                            <p className={`text-[10px] truncate ${isSelected ? 'text-rose-100' : 'text-slate-400'}`}>
                              {user.email} • ID: {user.id}
                            </p>
                          </div>
                        </div>

                        {isSelected ? (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-white shrink-0 ml-2">
                            <Check className="w-4 h-4" />
                            <span>Active</span>
                          </div>
                        ) : (
                          <span className="text-[9px] font-mono text-slate-400 shrink-0 ml-2">Simulate</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="my-2 border-t border-white/10" />

                <div className="px-3 py-1.5 text-[10px] text-slate-400 leading-normal">
                  💡 Tip: Select a user here, then lock a seat on the storefront or run the Race Test to see the lock attributed to this user in Redis!
                </div>
              </div>
            )}
          </div>

          {/* Exit Admin Button */}
          <button
            onClick={onExitAdmin}
            className="px-3.5 py-2 rounded-xl bg-dark-700 hover:bg-dark-650 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit Admin</span>
          </button>
        </div>
      </div>

      {/* Error Banner if API forbidden */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* SECTION 1: CONCURRENCY INSPECTOR */}
      {activeSection === 'inspector' && (
        <div className="space-y-8">
          
          {/* Top Live Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-dark-800 rounded-3xl p-6 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Redis Holds</p>
                <h3 className="text-3xl font-black text-amber-400 mt-1">{activeHolds.length}</h3>
                <p className="text-[11px] text-slate-400 mt-1">10-Minute Atomic TTL Keys</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-dark-800 rounded-3xl p-6 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Distributed Locks</p>
                <h3 className="text-3xl font-black text-sky-400 mt-1">Redisson RLock</h3>
                <p className="text-[11px] text-slate-400 mt-1">lock:showtime:&#123;id&#125;</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
                <Server className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-dark-800 rounded-3xl p-6 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Audit Log Stream</p>
                <h3 className="text-3xl font-black text-emerald-400 mt-1">{auditLogs.length} Events</h3>
                <p className="text-[11px] text-slate-400 mt-1">Recent lock attempts tracked</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Race Condition Simulator Action Box */}
          <div className="bg-gradient-to-r from-dark-800 to-dark-850 rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-2xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold mb-2">
                  <Flame className="w-3.5 h-3.5" />
                  Live Race Condition Tester
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Simulate Concurrent Lock Contention (User A vs User B)
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Triggers 2 simultaneous concurrent requests targeting the exact same seat. 
                  Worker A acquires the Redisson lock and locks the seat (200 OK); Worker B immediately detects the hold and is rejected with HTTP 409 Conflict.
                </p>
              </div>

              <button
                disabled={benchmarkRunning}
                onClick={handleRunRaceTest}
                className="px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-dark-950 font-black text-sm flex items-center gap-2 shadow-xl shadow-amber-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shrink-0"
              >
                <Play className="w-4 h-4 fill-dark-950" />
                {benchmarkRunning ? 'Executing Race Threads...' : 'Fire Concurrent Race Test'}
              </button>
            </div>

            {/* Benchmark Live Result Box */}
            {benchmarkResult && (
              <div className="mt-6 p-4 rounded-2xl bg-dark-900 border border-white/10 animate-in fade-in">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Race Test Results on Showtime #{benchmarkResult.testedShowtimeId} (Target Seat #{benchmarkResult.targetSeatId}):
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {benchmarkResult.results?.map((r, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        r.httpCode === 200
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                          : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                      }`}
                    >
                      <div>
                        <span className="font-extrabold">{r.userId}:</span> {r.message}
                      </div>
                      <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-black/40">
                        HTTP {r.httpCode}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Active Redis Seat Holds Table */}
          <div className="bg-dark-800 rounded-3xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  Active Redis Seat Holds (10-Min Atomic TTL)
                </h3>
                <p className="text-xs text-slate-400">Keys formatted as seat:hold:&#123;showtimeId&#125;:&#123;seatId&#125;</p>
              </div>
              <button
                onClick={fetchData}
                className="p-2 rounded-xl bg-dark-700 hover:bg-dark-600 text-slate-300 hover:text-white border border-white/10"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {activeHolds.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                No seats currently locked in Redis. Select and lock seats on a movie showtime to see real-time atomic keys appear here!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Redis Key</th>
                      <th className="py-3 px-4">Seat</th>
                      <th className="py-3 px-4">Locked By User</th>
                      <th className="py-3 px-4">Remaining TTL</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {activeHolds.map((h, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-amber-300 font-bold">{h.redisKey}</td>
                        <td className="py-3 px-4 text-white font-bold">{h.seatLabel}</td>
                        <td className="py-3 px-4 text-slate-300">
                          {h.userName || `User #${h.userId}`}
                        </td>
                        <td className="py-3 px-4 text-sky-400 font-bold">{h.formattedTtl} ({h.ttlSeconds}s)</td>
                        <td className="py-3 px-4 text-right">
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] uppercase font-bold">
                            LOCKED (TTL)
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 🌟 LIVE AUDIT TABLE: Displays real-time reservation logs */}
          {/* Format: [Timestamp | User | Showtime ID | Seat | Status (200 OK / 409 Conflict)] */}
          <div className="bg-dark-800 rounded-3xl p-6 border border-white/10">
            <div className="mb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-400" />
                Live Audit Table: Concurrency & Reservation Logs
              </h3>
              <p className="text-xs text-slate-400">
                Format: [Timestamp | User | Showtime ID | Seat | Status (200 OK / 409 Conflict)]
              </p>
            </div>

            <div className="overflow-x-auto max-h-[420px]">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-dark-800 z-10">
                  <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Showtime ID</th>
                    <th className="py-3 px-4">Seat</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {auditLogs.map((log) => {
                    const isSuccess = log.resultCode === 200;
                    return (
                      <tr key={log.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-200">
                          {log.userId}
                        </td>
                        <td className="py-3 px-4 font-mono text-amber-300">
                          {log.showtimeId || 'showtime_1'}
                        </td>
                        <td className="py-3 px-4 text-indigo-300 font-mono font-bold">
                          {log.seatIds}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-300">
                          {log.action}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 rounded text-[10px] font-black uppercase font-mono ${
                              isSuccess
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {log.resultCode} {isSuccess ? '200 OK' : '409 Conflict'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px] truncate max-w-xs">
                          {log.details}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: CATALOG MANAGEMENT (Movies, Theatres, Showtimes, Seat Layouts) */}
      {activeSection === 'catalog' && (
        <div className="space-y-6">
          
          {/* Sub Navigation */}
          <div className="flex bg-dark-800 p-1 rounded-2xl border border-white/10 text-xs font-bold w-fit">
            <button
              onClick={() => setCatalogSubTab('movies')}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                catalogSubTab === 'movies'
                  ? 'bg-amber-500 text-dark-950 font-black shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Movies</span>
            </button>
            <button
              onClick={() => setCatalogSubTab('theatres')}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                catalogSubTab === 'theatres'
                  ? 'bg-amber-500 text-dark-950 font-black shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Theatres</span>
            </button>
            <button
              onClick={() => setCatalogSubTab('showtimes')}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                catalogSubTab === 'showtimes'
                  ? 'bg-amber-500 text-dark-950 font-black shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Showtimes</span>
            </button>
            <button
              onClick={() => setCatalogSubTab('seats')}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                catalogSubTab === 'seats'
                  ? 'bg-amber-500 text-dark-950 font-black shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
              <span>Seat Layouts</span>
            </button>
          </div>

          {/* SUBTAB 1: MOVIES */}
          {catalogSubTab === 'movies' && (
            <div className="bg-dark-800 rounded-3xl p-6 sm:p-8 border border-white/10 max-w-3xl">
              <div className="mb-6">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-amber-400" />
                  Catalog Manager: Add Movie to Showtimes
                </h3>
                <p className="text-xs text-slate-400">
                  Create and publish new movie releases, set genres, age tags, format, and pre-book status.
                </p>
              </div>

              {formSuccess && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {formSuccess}
                </div>
              )}

              <form onSubmit={handleCreateMovie} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Movie Title *</label>
                  <input
                    type="text"
                    required
                    value={movieForm.title}
                    onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                    placeholder="e.g. Deadpool & Wolverine"
                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={movieForm.description}
                    onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                    placeholder="Enter storyline summary..."
                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Genre</label>
                    <select
                      value={movieForm.genre}
                      onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                      className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="Action">Action</option>
                      <option value="Sci-Fi">Sci-Fi</option>
                      <option value="Horror">Horror</option>
                      <option value="Drama">Drama</option>
                      <option value="Comedy">Comedy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Format</label>
                    <select
                      value={movieForm.format}
                      onChange={(e) => setMovieForm({ ...movieForm, format: e.target.value })}
                      className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="IMAX">IMAX</option>
                      <option value="2D">2D</option>
                      <option value="3D">3D</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Age Rating</label>
                    <select
                      value={movieForm.ageRating}
                      onChange={(e) => setMovieForm({ ...movieForm, ageRating: e.target.value })}
                      className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="13+">13+</option>
                      <option value="15+">15+</option>
                      <option value="18+">18+</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Duration (Mins)</label>
                    <input
                      type="number"
                      value={movieForm.durationMins}
                      onChange={(e) => setMovieForm({ ...movieForm, durationMins: Number(e.target.value) })}
                      className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Rating (Out of 10)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={movieForm.rating}
                      onChange={(e) => setMovieForm({ ...movieForm, rating: Number(e.target.value) })}
                      className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={movieForm.isUpcoming}
                      onChange={(e) => setMovieForm({ ...movieForm, isUpcoming: e.target.checked })}
                      className="rounded text-amber-500 focus:ring-0"
                    />
                    <span className="text-slate-300 font-bold">Mark as Upcoming</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={movieForm.isPreBook}
                      onChange={(e) => setMovieForm({ ...movieForm, isPreBook: e.target.checked })}
                      className="rounded text-amber-500 focus:ring-0"
                    />
                    <span className="text-slate-300 font-bold">Enable Pre-Book Tag</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="mt-6 w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-dark-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-95"
                >
                  <PlusCircle className="w-4 h-4 fill-dark-950" />
                  Publish Movie to Catalog
                </button>
              </form>
            </div>
          )}

          {/* SUBTAB 2: THEATRES */}
          {catalogSubTab === 'theatres' && (
            <div className="bg-dark-800 rounded-3xl p-6 border border-white/10">
              <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                Integrated Cinema Theatres
              </h3>
              <p className="text-xs text-slate-400 mb-6">Venues and attached screens participating in Redisson seat holding</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {[
                  { name: 'PVR INOX IMAX Forum', city: 'Chennai', screens: '2 Screens (IMAX Laser, Dolby Atmos)', address: 'Vijaya Mall, Vadapalani' },
                  { name: 'SPI Palazzo Central', city: 'Chennai', screens: '3 Screens (Dolby Atmos Premium)', address: 'Nexus Vijaya Mall, Arcot Rd' },
                  { name: 'PVR ICON Gold Class', city: 'Mumbai', screens: '2 Screens (Gold Class Luxe)', address: 'Phoenix Palladium, Lower Parel' },
                  { name: 'Cinepolis Grand Mall', city: 'Bengaluru', screens: '4 Screens (IMAX 4K)', address: 'Orion Mall, Rajajinagar' }
                ].map((th, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-dark-900 border border-white/10">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-white text-sm">{th.name}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {th.city}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mb-2">{th.address}</p>
                    <p className="text-sky-300 font-mono text-[11px]">{th.screens}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUBTAB 3: SHOWTIMES */}
          {catalogSubTab === 'showtimes' && (
            <div className="bg-dark-800 rounded-3xl p-6 border border-white/10">
              <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                Active Showtimes & Key Scoping
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Unique scoped keys ensure holding a seat on one showtime does not lock the seat on other showtimes.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Showtime ID</th>
                      <th className="py-3 px-4">Movie</th>
                      <th className="py-3 px-4">Screen</th>
                      <th className="py-3 px-4">Slot Time</th>
                      <th className="py-3 px-4">Ticket Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {[
                      { id: 'showtime_1_1_today_slot1', movie: 'Dune: Part Two', screen: 'IMAX Laser Screen 1', time: 'Today 07:30 PM', price: '₹350' },
                      { id: 'showtime_1_1_today_slot2', movie: 'Dune: Part Two', screen: 'IMAX Laser Screen 1', time: 'Today 10:45 PM', price: '₹380' },
                      { id: 'showtime_2_2_today_slot1', movie: 'Oppenheimer', screen: 'Dolby Atmos Screen 2', time: 'Today 08:00 PM', price: '₹300' },
                      { id: 'showtime_3_1_tmrw_slot1', movie: 'Cyberpunk: Neon Genesis', screen: 'IMAX Laser Screen 1', time: 'Tomorrow 06:00 PM', price: '₹320' }
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/5">
                        <td className="py-3 px-4 text-amber-400 font-bold">{row.id}</td>
                        <td className="py-3 px-4 text-white font-sans font-bold">{row.movie}</td>
                        <td className="py-3 px-4 text-slate-300">{row.screen}</td>
                        <td className="py-3 px-4 text-sky-400">{row.time}</td>
                        <td className="py-3 px-4 text-emerald-400 font-bold">{row.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUBTAB 4: SEAT LAYOUTS */}
          {catalogSubTab === 'seats' && (
            <div className="bg-dark-800 rounded-3xl p-6 border border-white/10">
              <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
                <Grid3X3 className="w-5 h-5 text-amber-400" />
                Auditorium Seat Layout Configuration
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Standard 60-seat matrix: Rows A & B (VIP ₹450), Rows C to F (Standard ₹350).
              </p>

              <div className="p-6 bg-dark-900 rounded-2xl border border-white/10 text-center">
                <div className="w-2/3 mx-auto h-2 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent rounded-full mb-2 shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono mb-6">Auditorium Curve Screen</p>

                <div className="max-w-md mx-auto space-y-2">
                  {['A', 'B', 'C', 'D', 'E', 'F'].map((row) => (
                    <div key={row} className="flex items-center justify-center gap-1.5">
                      <span className="w-4 text-right text-xs font-mono font-bold text-slate-400 mr-2">{row}</span>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                        const isVip = row === 'A' || row === 'B';
                        return (
                          <div
                            key={num}
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-mono font-bold ${
                              isVip 
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                                : 'bg-slate-800 text-slate-300 border border-white/10'
                            }`}
                          >
                            {num}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-6 mt-6 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded bg-amber-500/20 border border-amber-500/40" />
                    <span>VIP Seats (Rows A-B)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded bg-slate-800 border border-white/10" />
                    <span>Standard Seats (Rows C-F)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
