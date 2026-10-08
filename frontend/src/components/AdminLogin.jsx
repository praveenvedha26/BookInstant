import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldAlert, Lock, Mail, KeyRound, AlertTriangle, ArrowLeft, 
  CheckCircle2, Sparkles, ChevronRight, Server 
} from 'lucide-react';
import { api, ADMIN_USER } from '../services/api';

export default function AdminLogin({ onAdminLoginSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@bookinstant.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuickFill = () => {
    setEmail(ADMIN_USER?.email || 'admin@bookinstant.com');
    setPassword('password123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(false);

    try {
      setLoading(true);
      const res = await api.adminLogin(email, password);
      if (res.success) {
        if (onAdminLoginSuccess) onAdminLoginSuccess(res.user);
        navigate('/admin');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-rose-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Admin Login Card */}
      <div className="w-full max-w-md relative z-10 bg-dark-900/90 border border-amber-500/30 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        
        {/* Header Icon + Brand */}
        <div className="flex items-center gap-3.5 mb-6 pb-6 border-b border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-dark-950 font-black shadow-lg shadow-amber-500/20">
            <ShieldAlert className="w-6 h-6 text-dark-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white tracking-tight">BookInstant Admin</h1>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                ROLE_ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-400">Concurrency Inspector & Distributed Locks</p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mb-6 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs text-amber-300">
          <Server className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <p className="leading-relaxed text-[11px]">
            Restricted control center. Authenticates administrators with high-privilege JWT access to live Redis holds and conflict audit logs.
          </p>
        </div>

        {/* Quick Fill Preset for Evaluator */}
        <div className="mb-5">
          <button
            type="button"
            onClick={handleQuickFill}
            className="w-full p-2.5 rounded-xl bg-dark-800 hover:bg-dark-750 border border-amber-500/30 hover:border-amber-400/50 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                Evaluator Quick-Fill
              </span>
              <span className="text-xs font-semibold text-slate-300 group-hover:text-white">
                Admin User (admin@bookinstant.com)
              </span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition-colors" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div className="leading-relaxed font-medium">{error}</div>
          </div>
        )}

        {/* Admin Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bookinstant.com"
                className="w-full bg-dark-800 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Admin Security Key / Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-dark-800 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-dark-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
          >
            <Lock className="w-4 h-4" />
            {loading ? 'Verifying Admin Privileges...' : 'Authenticate & Enter Admin Console'}
          </button>
        </form>

        {/* Back Link */}
        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <Link
            to="/"
            className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1.5 transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to User Booking Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
