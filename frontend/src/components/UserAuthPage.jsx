import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Film, Mail, Lock, User, ArrowRight, ArrowLeft, 
  CheckCircle2, AlertCircle, Sparkles, Ticket, ShieldAlert 
} from 'lucide-react';
import { api, STANDARD_USERS } from '../services/api';

export default function UserAuthPage({ mode = 'login', onAuthSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isSignupMode = mode === 'signup' || location.pathname === '/signup';
  
  const [isSignup, setIsSignup] = useState(isSignupMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('praveen@bookinstant.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuickSelectUser = (user) => {
    setEmail(user.email);
    setPassword('password123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (isSignup) {
        if (!name.trim()) {
          setError('Please provide your full name.');
          setLoading(false);
          return;
        }
        res = await api.signup(name, email, password);
      } else {
        res = await api.login(email, password);
      }

      if (res && res.success) {
        if (onAuthSuccess) onAuthSuccess(res.user);
        const destination = location.state?.from?.pathname || '/';
        navigate(destination, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10 bg-dark-900/95 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-600/30 group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-black text-white tracking-tight group-hover:text-rose-400 transition-colors">
                BookInstant
              </span>
              <p className="text-[10px] text-slate-400">High-Speed Seat Booking</p>
            </div>
          </Link>

          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
            {isSignup ? 'Create Account' : 'Standard User'}
          </span>
        </div>

        {/* Tab Toggle: Sign In vs Sign Up */}
        <div className="flex bg-dark-800 p-1 rounded-2xl border border-white/10 mb-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setIsSignup(false); setError(''); }}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              !isSignup
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignup(true); setError(''); }}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              isSignup
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Explicit Admin Portal Link Banner */}
        <div className="mb-6 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-300">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold">Need Admin Access?</span>
          </div>
          <Link 
            to="/admin/login" 
            className="font-bold text-amber-400 hover:text-amber-300 text-[11px] underline flex items-center gap-1"
          >
            Admin Login (/admin/login) →
          </Link>
        </div>

        {/* Quick Select for Standard Users (Sign In Mode) */}
        {!isSignup && (
          <div className="mb-6">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Fast-Fill Demo Accounts:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {STANDARD_USERS.map((user) => {
                const isSelected = email.toLowerCase() === user.email.toLowerCase();
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleQuickSelectUser(user)}
                    className={`p-2 rounded-xl text-left border text-xs transition-all ${
                      isSelected
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-sm'
                        : 'bg-dark-800 border-white/10 hover:border-white/25 text-slate-300'
                    }`}
                  >
                    <div className="font-bold truncate text-[11px]">{user.displayName}</div>
                    <div className="text-[9px] text-slate-400 font-mono">User #{user.id}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div className="leading-relaxed font-medium">{error}</div>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isSignup && (
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-dark-800 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-bold mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-dark-800 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-dark-800 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-rose-600/30 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
          >
            <Ticket className="w-4 h-4" />
            {loading ? 'Authenticating...' : isSignup ? 'Create Account & Start Booking' : 'Sign In with JWT'}
          </button>
        </form>

        {/* Bottom Navigation */}
        <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <Link to="/" className="hover:text-white inline-flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Browse Movies
          </Link>

          <Link to="/admin/login" className="text-slate-500 hover:text-amber-400 transition-colors text-[11px]">
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}
