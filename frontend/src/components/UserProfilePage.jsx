import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { 
  User, Ticket, CreditCard, Heart, LogOut, Download, MapPin, 
  Calendar, Clock, CheckCircle, ArrowLeft, Shield, Sparkles, Building2 
} from 'lucide-react';
import { api } from '../services/api';
import Header from './Header';

export default function UserProfilePage({ 
  currentUser, 
  initialTab = 'profile', 
  onLogout 
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [bookings, setBookings] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    if (currentUser?.id) {
      const fetchBookings = async () => {
        const data = await api.getUserBookings(currentUser.id);
        setBookings(data);
      };
      fetchBookings();
    }
  }, [currentUser?.id]);

  const savedCards = [
    { id: 1, type: 'Visa Instant', number: '•••• •••• •••• 4242', expires: '08/28', bank: 'HDFC Bank' },
    { id: 2, type: 'UPI Handle', number: `${currentUser?.displayName?.toLowerCase() || 'praveen'}@okaxis`, expires: 'Verified', bank: 'Axis Bank' }
  ];

  const favoriteTheatres = [
    { id: 1, name: 'PVR INOX IMAX Forum', city: 'Chennai', screens: 'IMAX Laser & Dolby 7.1' },
    { id: 2, name: 'SPI Palazzo Central', city: 'Chennai', screens: 'Dolby Atmos Premium' },
    { id: 3, name: 'PVR ICON Gold Class', city: 'Mumbai', screens: 'Luxe Recliners' }
  ];

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col font-sans">
      <Header
        activeTab=""
        currentUser={currentUser}
        onLogout={onLogout}
        selectedCity="Chennai"
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Movie Catalog
          </Link>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log Out
          </button>
        </div>

        {/* User Identity Card */}
        <div className="bg-dark-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-rose-600/30">
              {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {currentUser?.name || 'Member Profile'}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Verified Member
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{currentUser?.email}</p>
              <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                <span>User ID: #{currentUser?.id}</span>
                <span>•</span>
                <span className="font-mono text-indigo-400 font-semibold">{currentUser?.role || 'ROLE_USER'}</span>
              </div>
            </div>
          </div>

          <div className="flex bg-dark-800 p-1 rounded-2xl border border-white/10 text-xs font-bold w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeTab === 'profile'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeTab === 'tickets'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Ticket className="w-4 h-4" />
              Bookings ({bookings.length})
            </button>
          </div>
        </div>

        {/* TAB 1: TICKETS / MY BOOKINGS */}
        {activeTab === 'tickets' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-rose-500" />
              My Booked Tickets & Boarding Passes
            </h2>

            {bookings.length === 0 ? (
              <div className="bg-dark-900 border border-white/10 rounded-3xl p-12 text-center">
                <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white mb-1">No Bookings Yet</h3>
                <p className="text-xs text-slate-400 mb-6 max-w-sm mx-auto">
                  Reserve your seats with high-speed Redis distributed locks and get confirmed passes with digital QR codes.
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold text-xs shadow-lg shadow-rose-600/30"
                >
                  Browse Now Showing Movies
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookings.map((b) => (
                  <div
                    key={b.bookingId || b.id}
                    className="bg-dark-900 border border-white/10 rounded-2xl p-5 shadow-xl hover:border-rose-500/30 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          #{b.bookingId || b.id}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          CONFIRMED
                        </span>
                      </div>

                      <h3 className="text-base font-black text-white leading-tight mb-1">
                        {b.movieTitle || 'Dune: Part Two'}
                      </h3>
                      <p className="text-xs text-slate-300 flex items-center gap-1.5 mb-3">
                        <Building2 className="w-3.5 h-3.5 text-amber-400" />
                        {b.theatreName || 'PVR INOX Forum'} • {b.screenName || 'IMAX Screen 1'}
                      </p>

                      <div className="flex flex-wrap gap-2 text-[11px] mb-4">
                        <span className="px-2.5 py-1 rounded-lg bg-dark-800 text-slate-300 border border-white/10">
                          Seats: <strong className="text-white">{b.seatLabels?.join(', ') || 'VIP A1, A2'}</strong>
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-dark-800 text-slate-300 border border-white/10">
                          Total: <strong className="text-emerald-400">₹{b.totalAmount || 700}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <div className="text-[10px] text-slate-400">
                        Pass Code: <span className="font-mono text-slate-200">{b.qrCodeToken || 'TKT-LIVE'}</span>
                      </div>
                      <div className="p-1 rounded bg-white">
                        <QRCodeSVG value={b.qrCodeToken || 'TKT-BOOKINSTANT'} size={36} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PROFILE DETAILS & PAYMENT METHODS */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Saved Payment Methods */}
            <div className="bg-dark-900 border border-white/10 rounded-3xl p-6 shadow-xl">
              <h3 className="text-base font-black text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-rose-500" />
                Saved Payment Methods
              </h3>
              <div className="space-y-3">
                {savedCards.map((card) => (
                  <div key={card.id} className="p-4 rounded-2xl bg-dark-800 border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">{card.type}</p>
                      <p className="text-xs font-mono text-slate-400">{card.number}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                      {card.expires}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Favorite Theatres */}
            <div className="bg-dark-900 border border-white/10 rounded-3xl p-6 shadow-xl">
              <h3 className="text-base font-black text-white mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-500" />
                Favorite Theatres
              </h3>
              <div className="space-y-3">
                {favoriteTheatres.map((th) => (
                  <div key={th.id} className="p-4 rounded-2xl bg-dark-800 border border-white/10">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white">{th.name}</p>
                      <span className="text-[10px] font-mono text-slate-400">{th.city}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{th.screens}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
