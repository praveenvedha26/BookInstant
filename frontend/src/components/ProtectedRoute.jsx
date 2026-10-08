import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { api } from '../services/api';
import { ShieldAlert, Lock, ArrowLeft } from 'lucide-react';

/**
 * ProtectedRoute: Enforces role-based access for protected pages.
 * Supports:
 * - allowedRoles={['ROLE_USER', 'ROLE_ADMIN']}
 * - allowedRoles={['ROLE_ADMIN']}
 * - Unauthenticated users are redirected directly to /login (or /admin/login for admin paths).
 * - Renders children or <Outlet /> when access is permitted.
 */
export default function ProtectedRoute({ allowedRoles = ['ROLE_USER', 'ROLE_ADMIN'], currentUser, children }) {
  const location = useLocation();
  const activeUser = currentUser || api.getSessionUser();
  const isAuthenticated = Boolean(activeUser && activeUser.token);

  // Normalize allowedRoles to include both with and without ROLE_ prefix
  const normalizedAllowedRoles = allowedRoles.map((r) => (r.startsWith('ROLE_') ? r : `ROLE_${r}`));
  const isAdminOnly = normalizedAllowedRoles.length === 1 && normalizedAllowedRoles.includes('ROLE_ADMIN');

  // 1. Unauthenticated Check: Redirect to appropriate login page
  if (!isAuthenticated) {
    if (isAdminOnly || location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Role Check
  const rawRole = activeUser.role || 'USER';
  const userRole = rawRole.startsWith('ROLE_') ? rawRole : `ROLE_${rawRole}`;

  const hasPermission = normalizedAllowedRoles.includes(userRole);

  if (!hasPermission) {
    // If standard user attempts to access admin route
    if (isAdminOnly || location.pathname.startsWith('/admin')) {
      return (
        <div className="min-h-screen bg-[#090a0f] text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-dark-900 border border-rose-500/30 rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-rose-500/20">
              <ShieldAlert className="w-8 h-8" />
            </div>
            
            <span className="text-[10px] uppercase font-mono font-black tracking-widest px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40">
              HTTP 403 FORBIDDEN
            </span>
            
            <h2 className="text-2xl font-black text-white mt-4 mb-2">Admin Privileges Required</h2>
            
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Access to this console requires <code className="text-rose-300 font-mono">ROLE_ADMIN</code>. 
              Logged in as <span className="text-amber-300 font-medium">{activeUser.name}</span> ({userRole}).
            </p>

            <div className="space-y-3">
              <a
                href="/admin/login"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
              >
                <Lock className="w-4 h-4" />
                Sign in with Admin Account
              </a>

              <a
                href="/"
                className="w-full py-3 px-4 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 border border-white/10 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to BookInstant Movies
              </a>
            </div>
          </div>
        </div>
      );
    }

    // Default redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Authorized: Render children or nested routes via Outlet
  return children ? children : <Outlet />;
}
