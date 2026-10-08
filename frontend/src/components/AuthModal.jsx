import React, { useState, useEffect } from 'react';
import { 
  X, Lock, Mail, User, Shield, KeyRound, Check, Copy, 
  ExternalLink, LogOut, ArrowRight, Sparkles, AlertCircle 
} from 'lucide-react';
import { api, STANDARD_USERS } from '../services/api';

export default function AuthModal({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout
}) {
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' | 'register' | 'inspector'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [role, setRole] = useState('USER');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setEmail(currentUser.email || '');
    }
    setError('');
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const currentToken = api.getSessionToken();
  const decodedToken = api.decodeJwt(currentToken);

  const handleQuickSelect = (user) => {
    setEmail(user.email);
    setPassword('password123');
    setError('');
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login(email, password);
      if (res.success) {
        onLoginSuccess(res.user);
        onClose();
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide your name.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.signup(name, email, password);
      if (res.success) {
        onLoginSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(currentToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-dark-900 border border-white/20 w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl relative my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-400 hover:text-white transition-colors border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-600/30">
            <KeyRound className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight">Spring Security JWT Portal</h2>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                HS256 Auth
              </span>
            </div>
            <p className="text-xs text-slate-400">Manage active bearer credentials & simulate multi-session permissions</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-dark-800 p-1 rounded-2xl border border-white/10 mb-6">
          <button
            onClick={() => { setActiveTab('signin'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'signin'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In (JWT)
          </button>
          <button
            onClick={() => { setActiveTab('register'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'register'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
          <button
            onClick={() => { setActiveTab('inspector'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'inspector'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Inspect Active Token
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: SIGN IN */}
        {activeTab === 'signin' && (
          <div>
            {/* Quick-fill preset buttons */}
            <div className="mb-5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                Fast-Fill Demo Accounts:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {STANDARD_USERS.map((u) => {
                  const isCurrent = email.toLowerCase() === u.email.toLowerCase();
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickSelect(u)}
                      className={`p-2 rounded-xl text-left border transition-all ${
                        isCurrent
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                          : 'bg-dark-800 border-white/10 hover:border-white/20 text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="text-[11px] font-bold truncate">{u.name}</div>
                      <div className="text-[9px] text-slate-400 truncate">ROLE_USER</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. praveen@bookinstant.com"
                    className="w-full bg-dark-800 border border-white/15 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-dark-800 border border-white/15 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all"
              >
                {loading ? 'Authenticating...' : 'Sign In & Load JWT'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: REGISTER */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  className="w-full bg-dark-800 border border-white/15 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. maya@example.com"
                  className="w-full bg-dark-800 border border-white/15 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-dark-800 border border-white/15 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors font-mono"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-400">Account Access:</span>
              <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                ROLE_USER
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all"
            >
              {loading ? 'Creating Account...' : 'Register & Generate JWT'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* TAB 3: LIVE JWT INSPECTOR */}
        {activeTab === 'inspector' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-dark-800 border border-white/10">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Raw Bearer Token (localStorage)
                </span>
                <button
                  onClick={handleCopyToken}
                  className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-bold"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Token'}
                </button>
              </div>
              <div className="p-2.5 rounded-xl bg-dark-950 font-mono text-[11px] text-slate-300 break-all select-all border border-white/5 max-h-24 overflow-y-auto">
                {currentToken || 'No token active in localStorage'}
              </div>
            </div>

            {decodedToken ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-dark-800 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                    Header (HS256)
                  </span>
                  <pre className="font-mono text-[11px] text-emerald-400 bg-dark-950 p-2.5 rounded-xl overflow-x-auto border border-white/5">
                    {JSON.stringify(decodedToken.header, null, 2)}
                  </pre>
                </div>

                <div className="p-3.5 rounded-2xl bg-dark-800 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                    Claims Payload
                  </span>
                  <pre className="font-mono text-[11px] text-indigo-300 bg-dark-950 p-2.5 rounded-xl overflow-x-auto border border-white/5">
                    {JSON.stringify(decodedToken.payload, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-dark-800 text-center text-xs text-slate-400">
                Invalid or unparsed token format.
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Validated against Spring Security Filter
              </span>

              <button
                type="button"
                onClick={() => {
                  api.clearSession();
                  onLogout();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Purge Token & Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
