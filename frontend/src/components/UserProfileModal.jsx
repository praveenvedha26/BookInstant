import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, User, Ticket, CreditCard, Heart, LogOut, Download, MapPin, Calendar, Clock, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

export default function UserProfileModal({
  currentUser,
  initialTab = 'tickets',
  setCurrentUser,
  onClose,
  onLogout
}) {
  const [activeTab, setActiveTab] = useState(initialTab || 'tickets'); // 'tickets', 'payments', 'theatres'
  const [bookings, setBookings] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      const data = await api.getUserBookings(currentUser.id);
      setBookings(data);
    };
    fetchBookings();
  }, [currentUser.id]);

  const savedCards = [
    { id: 1, type: 'Visa Instant', number: '•••• •••• •••• 4242', expires: '08/28', bank: 'HDFC Bank' },
    { id: 2, type: 'UPI Handle', number: 'praveen@okaxis', expires: 'Verified', bank: 'Axis Bank' }
  ];

  const favoriteTheatres = [
    { id: 1, name: 'PVR INOX IMAX Forum', city: 'Chennai', screens: 'IMAX Laser & Dolby 7.1' },
    { id: 2, name: 'SPI Palazzo Central', city: 'Chennai', screens: 'Dolby Atmos Premium' },
    { id: 3, name: 'PVR ICON Gold Class', city: 'Mumbai', screens: 'Luxe Recliners' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-dark-900 border border-white/15 w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl relative my-auto">
        
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-400 hover:text-white transition-colors border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Card Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-white/10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-xl font-black text-white shadow-lg shadow-rose-600/30">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-black text-white">{currentUser.name}</h2>
            <p className="text-xs text-slate-400">{currentUser.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Verified Member
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-dark-800 text-slate-400 border border-white/10">
                Role: {currentUser.role || 'USER'}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="flex gap-2 my-6 bg-dark-800/80 p-1.5 rounded-2xl border border-white/10 text-xs font-bold">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'tickets' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Ticket className="w-4 h-4" />
            Booked Tickets ({bookings.length})
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'payments' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Payment Methods
          </button>

          <button
            onClick={() => setActiveTab('theatres')}
            className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'theatres' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4" />
            Favorites
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[260px] max-h-[380px] overflow-y-auto pr-1">
          {activeTab === 'tickets' && (
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  <Ticket className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No booked tickets yet. Select a movie to book seats instantly!
                </div>
              ) : (
                bookings.map((t) => (
                  <div
                    key={t.id || t.bookingId}
                    className="p-4 rounded-2xl bg-dark-800 border border-white/10 hover:border-rose-500/40 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {t.status}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          #{t.bookingId || t.id}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-white text-base">{t.movieTitle}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {t.theatreName} • {t.screenName}
                      </p>
                      <p className="text-xs text-emerald-400 font-bold mt-1">
                        Seats: {t.seatLabels?.join(', ') || 'Confirmed'} • Paid: ₹{t.totalAmount}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="p-1.5 bg-white rounded-xl shadow-md">
                        <QRCodeSVG value={t.qrCodeToken || `BI-${t.bookingId}`} size={56} />
                      </div>
                      <button
                        onClick={() => setSelectedTicket(t)}
                        className="px-3 py-2 rounded-xl bg-dark-700 hover:bg-rose-600 text-slate-200 hover:text-white text-xs font-bold transition-colors"
                      >
                        View Pass
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-3">
              {savedCards.map((c) => (
                <div key={c.id} className="p-4 rounded-2xl bg-dark-800 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center text-rose-500">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{c.bank} ({c.type})</h4>
                      <p className="text-xs font-mono text-slate-400">{c.number}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">Expires: {c.expires}</span>
                </div>
              ))}
              <p className="text-[11px] text-slate-500 mt-3 text-center">
                Instant Mock Gateway integration active with 0-fee transaction simulation.
              </p>
            </div>
          )}

          {activeTab === 'theatres' && (
            <div className="space-y-3">
              {favoriteTheatres.map((th) => (
                <div key={th.id} className="p-4 rounded-2xl bg-dark-800 border border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{th.name}</h4>
                    <p className="text-xs text-slate-400">{th.city} • {th.screens}</p>
                  </div>
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Logout Button */}
        <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Switch / Logout
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-300 font-bold text-xs"
          >
            Close
          </button>
        </div>

        {/* Nested Detailed Pass View */}
        {selectedTicket && (
          <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-dark-900 border border-white/20 p-6 rounded-3xl max-w-sm w-full text-center relative">
              <button
                onClick={() => setSelectedTicket(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-black text-white mb-1">{selectedTicket.movieTitle}</h3>
              <p className="text-xs text-slate-400 mb-4">{selectedTicket.theatreName}</p>
              <div className="p-4 bg-white rounded-2xl mx-auto w-fit mb-4">
                <QRCodeSVG value={selectedTicket.qrCodeToken || `BI-${selectedTicket.bookingId}`} size={160} />
              </div>
              <p className="font-mono text-xs text-slate-300 mb-2">{selectedTicket.qrCodeToken}</p>
              <p className="text-sm font-bold text-emerald-400">Seats: {selectedTicket.seatLabels?.join(', ')}</p>
              <button
                onClick={() => window.print()}
                className="mt-5 w-full py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download Digital Ticket
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
