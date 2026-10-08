import React, { useState, useEffect } from 'react';
import { X, Clock, ShieldCheck, AlertTriangle, Zap, ArrowLeft, Info } from 'lucide-react';
import SeatGrid from './SeatGrid';
import { api } from '../services/api';

export default function SeatGridModal({
  movie,
  showtime,
  currentUser,
  onClose,
  onBackToTheatres,
  onProceedToPayment,
  onTriggerToast
}) {
  const [seats, setSeats] = useState([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locking, setLocking] = useState(false);
  const [lockExpiresAt, setLockExpiresAt] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(600); // 10 minutes

  // Load seats from server / Redis
  const fetchSeatStatus = async () => {
    try {
      const data = await api.getSeatsStatus(showtime.id, currentUser.id);
      setSeats(data);
    } catch (err) {
      console.error('Failed to load seats', err);
    } finally {
      setLoading(false);
    }
  };

  // Immediate fetch + 1.5-second live polling + storage event listener
  useEffect(() => {
    fetchSeatStatus();
    const pollInterval = setInterval(fetchSeatStatus, 1500);

    const handleStorageChange = () => {
      fetchSeatStatus();
    };
    const handleSessionChange = () => {
      setSelectedSeatIds([]);
      setLockExpiresAt(null);
      fetchSeatStatus();
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('bookinstant_holds_changed', handleStorageChange);
    window.addEventListener('bookinstant_session_switched', handleSessionChange);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('bookinstant_holds_changed', handleStorageChange);
      window.removeEventListener('bookinstant_session_switched', handleSessionChange);
    };
  }, [showtime.id, currentUser.id]);

  // Clean local selection and refresh when showtime or user changes
  useEffect(() => {
    setSelectedSeatIds([]);
    setLockExpiresAt(null);
    fetchSeatStatus();
  }, [showtime.id, currentUser.id]);

  // Dynamic 10-minute hold countdown timer
  useEffect(() => {
    if (!lockExpiresAt) return;

    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(lockExpiresAt).getTime() - Date.now()) / 1000));
      setRemainingSeconds(remaining);
      if (remaining === 0) {
        clearInterval(timer);
        onTriggerToast({
          type: 'error',
          title: 'Hold Expired',
          message: 'Your 10-minute hold has expired. Please re-select your seats.'
        });
        setSelectedSeatIds([]);
        setLockExpiresAt(null);
        fetchSeatStatus();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lockExpiresAt]);

  // 1. Clicking a Seat: Pure local UI toggle (Highlights Green, NO API call to Redis)
  const toggleSeatSelection = (seat) => {
    // A. If seat is permanently booked in DB for this showtime
    if (seat.status === 'BOOKED') {
      onTriggerToast({
        type: 'error',
        title: 'Seat Unavailable',
        message: `Seat ${seat.seatLabel} is already booked for this showtime.`
      });
      return;
    }

    // B. If seat is held by another user in Redis for this showtime
    const currentUserIdStr = currentUser ? String(currentUser.id).replace(/^User_?/i, '').trim() : '';
    const seatHolderIdStr = seat.heldBy != null 
      ? String(seat.heldBy).replace(/^User_?/i, '').trim() 
      : (seat.lockedByUserId != null ? String(seat.lockedByUserId).replace(/^User_?/i, '').trim() : '');

    if ((seat.status === 'HELD' || seat.status === 'LOCKED') && seatHolderIdStr !== '' && seatHolderIdStr !== currentUserIdStr) {
      handleBlockedSeatClick(seat);
      return;
    }

    // C. Local state toggle: Pure UI selection (NO Redis network call)
    if (selectedSeatIds.includes(seat.id)) {
      setSelectedSeatIds(selectedSeatIds.filter((id) => id !== seat.id));
    } else {
      if (selectedSeatIds.length >= 6) {
        onTriggerToast({
          type: 'info',
          title: 'Limit Reached',
          message: 'Maximum 6 seats per booking transaction.'
        });
        return;
      }
      setSelectedSeatIds([...selectedSeatIds, seat.id]);
    }
  };

  // Blocked / Yellow seat click handler
  const handleBlockedSeatClick = (seat) => {
    const holder = seat.heldByName || seat.lockedByUserName || `User ${seat.heldBy || seat.lockedByUserId}`;
    onTriggerToast({
      type: 'error',
      title: 'Seats Unavailable',
      message: `Reservation Failed: Seat ${seat.seatLabel} was just locked by ${holder}!`
    });
    fetchSeatStatus();
  };

  // 2. Clicking "Lock Seats & Pay": Triggers POST /api/v1/seats/lock
  const handleAcquireLockAndCheckout = async () => {
    if (selectedSeatIds.length === 0) {
      onTriggerToast({
        type: 'error',
        title: 'No Selection',
        message: 'Please click to select at least one available seat.'
      });
      return;
    }

    setLocking(true);

    try {
      // POST /api/v1/seats/lock { showtimeId, seatIds, userId }
      const lockRes = await api.lockSeats(showtime.id, selectedSeatIds, currentUser.id, currentUser.name);

      // On 200 OK: Start 10-minute countdown timer and open payment modal
      setLockExpiresAt(lockRes.expiresAt);
      setRemainingSeconds(lockRes.ttlSeconds || 600);

      const selectedSeats = seats.filter((s) => selectedSeatIds.includes(s.id));
      const subtotal = selectedSeats.reduce((sum, s) => sum + (s.price || showtime.price), 0);
      const convenienceFee = 42; // Flat mock fee
      const totalAmount = subtotal + convenienceFee;

      onProceedToPayment({
        showtimeId: showtime.id,
        seatIds: selectedSeatIds,
        selectedSeats,
        movieTitle: movie.title,
        theatreName: showtime.theatreName,
        screenName: showtime.screenName || 'IMAX Laser Screen 1',
        subtotal,
        convenienceFee,
        totalAmount,
        ttlSeconds: lockRes.ttlSeconds || 600,
        userId: currentUser.id
      });
    } catch (err) {
      // On 409 Conflict: Show red error toast, clear local selection, and refresh seat grid for this showtime
      onTriggerToast({
        type: 'error',
        title: 'Seats Unavailable',
        message: err.message || 'One or more selected seats are no longer available for this showtime.'
      });
      setSelectedSeatIds([]);
      fetchSeatStatus();
    } finally {
      setLocking(false);
    }
  };

  const selectedSeatsList = seats.filter((s) => selectedSeatIds.includes(s.id));
  const subtotalPrice = selectedSeatsList.reduce((sum, s) => sum + (s.price || showtime.price), 0);

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-dark-900 border border-white/15 w-full max-w-4xl rounded-3xl p-6 sm:p-8 shadow-2xl relative my-auto">
        
        {/* Top Controls */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            {onBackToTheatres && (
              <button
                onClick={onBackToTheatres}
                className="p-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-300 hover:text-white transition-colors border border-white/10 flex items-center gap-1 text-xs font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Theatres</span>
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  Step 2: Interactive Seat Grid
                </span>
                <h2 className="text-xl font-black text-white">{movie.title}</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {showtime.theatreName} • {showtime.time} ({showtime.format || 'IMAX'})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-400 hover:text-white transition-colors border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Hold Countdown Banner (if locked) */}
        {lockExpiresAt && (
          <div className="mb-6 flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
            <div className="flex items-center gap-2 text-xs font-bold">
              <Clock className="w-4 h-4 animate-pulse" />
              <span>Redis Distributed Hold Active: Seats held exclusively for {currentUser.name}</span>
            </div>
            <div className="font-mono text-sm font-black bg-amber-500/20 px-3 py-1 rounded-xl">
              {formatTimer(remainingSeconds)}
            </div>
          </div>
        )}

        {/* Reusable SeatGrid Component with Client-Side Seat Disabling */}
        <SeatGrid
          seats={seats}
          selectedSeatIds={selectedSeatIds}
          currentUser={currentUser}
          onToggleSeat={toggleSeatSelection}
          onBlockedSeatClick={handleBlockedSeatClick}
        />

        {/* Bottom Checkout Funnel Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
          <div>
            <p className="text-xs text-slate-400">
              Selected Seats: <span className="font-bold text-white">{selectedSeatsList.map((s) => s.seatLabel).join(', ') || 'None'}</span>
            </p>
            <p className="text-xl font-black text-white mt-0.5">
              Subtotal: <span className="text-rose-400">₹{subtotalPrice}</span>
              <span className="text-xs text-slate-400 font-normal ml-2">({selectedSeatIds.length} tickets)</span>
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-dark-800 hover:bg-dark-700 text-slate-300 font-bold text-xs border border-white/10"
            >
              Cancel
            </button>

            <button
              disabled={selectedSeatIds.length === 0 || locking}
              onClick={handleAcquireLockAndCheckout}
              className="flex-1 sm:flex-none px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 disabled:opacity-50 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-rose-600/40 glow-brand transition-all active:scale-95"
            >
              <Zap className="w-4 h-4 fill-white" />
              {locking ? 'Acquiring Redis Lock...' : 'Lock Seats & Pay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
