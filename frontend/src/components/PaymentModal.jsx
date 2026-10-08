import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, XCircle, Clock, CreditCard, AlertCircle, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';

export default function PaymentModal({
  bookingData,
  currentUser,
  onClose,
  onBackToSeats,
  onPaymentSuccess,
  onPaymentCancelled
}) {
  const [processing, setProcessing] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(bookingData.ttlSeconds || 600);
  const [errorMessage, setErrorMessage] = useState(null);

  // 10-Minute Hold Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSimulateFailure('Hold session expired after 10 minutes.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Button 1: "Simulate Success"
  const handleSimulateSuccess = async () => {
    setProcessing(true);
    setErrorMessage(null);

    try {
      const response = await api.confirmPayment(
        bookingData.showtimeId,
        bookingData.seatIds,
        currentUser.id,
        currentUser.name,
        bookingData.movieTitle,
        bookingData.theatreName,
        bookingData.screenName,
        'Chennai',
        bookingData.totalAmount,
        bookingData.subtotal,
        bookingData.convenienceFee
      );
      onPaymentSuccess(response);
    } catch (err) {
      setErrorMessage(err.message || 'Payment confirmation failed');
      setProcessing(false);
    }
  };

  // Button 2: "Simulate Failure"
  const handleSimulateFailure = async (reason = 'User simulated failed payment') => {
    setProcessing(true);
    try {
      await api.cancelPayment(
        bookingData.showtimeId,
        bookingData.seatIds,
        currentUser.id,
        currentUser.name
      );
      onPaymentCancelled(reason);
    } catch (err) {
      console.error(err);
      onPaymentCancelled(reason);
    }
  };

  const subtotal = bookingData.subtotal || (bookingData.totalAmount - 42);
  const convenienceFee = bookingData.convenienceFee || 42;
  const total = bookingData.totalAmount || (subtotal + convenienceFee);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-dark-900 border border-white/15 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        
        {/* Top bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2">
            {onBackToSeats && (
              <button
                onClick={onBackToSeats}
                className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-300 text-xs font-bold flex items-center gap-1 border border-white/10"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Seats</span>
              </button>
            )}
            <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Step 3: Mock Payment Engine
            </span>
          </div>

          <button
            onClick={onClose}
            title="Dismiss view (hold remains active in Redis)"
            className="p-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-400 hover:text-white transition-colors border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Title */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-rose-600/30">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white">Simulated Payment Engine</h2>
          <p className="text-xs text-slate-400 mt-1">
            Paying as: <span className="font-bold text-white">{currentUser.name}</span>
          </p>
        </div>

        {/* 10-Minute Hold Countdown Banner */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs mb-6">
          <div className="flex items-center gap-2 font-bold">
            <Clock className="w-4 h-4 animate-pulse" />
            <span>Redis 10-Min Atomic Hold Countdown:</span>
          </div>
          <span className="font-mono text-sm font-black bg-amber-500/20 px-3 py-1 rounded-xl">
            {formatTimer(remainingSeconds)}
          </span>
        </div>

        {/* Itemized Pricing Breakdown as Requested */}
        <div className="bg-dark-800 rounded-2xl p-5 border border-white/10 mb-6 space-y-3 text-xs">
          <div className="flex justify-between pb-2.5 border-b border-white/10">
            <span className="text-slate-400">Movie Title</span>
            <span className="font-bold text-white text-right">{bookingData.movieTitle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Theatre & Screen</span>
            <span className="font-semibold text-slate-200">{bookingData.theatreName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Reserved Seats</span>
            <span className="font-extrabold text-emerald-400">
              {bookingData.selectedSeats?.map((s) => s.seatLabel).join(', ') || bookingData.seatIds.join(', ')}
            </span>
          </div>

          {/* Itemized Cost Breakdown */}
          <div className="pt-2.5 border-t border-white/10 space-y-2">
            <div className="flex justify-between text-slate-300">
              <span>Seats Subtotal ({bookingData.seatIds.length} tickets)</span>
              <span className="font-bold">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Convenience & Gateway Fee</span>
              <span className="font-bold">₹{convenienceFee}</span>
            </div>
          </div>

          {/* Grand Total */}
          <div className="flex justify-between pt-3 border-t border-white/15 text-sm">
            <span className="font-bold text-slate-200">Total Payable</span>
            <span className="font-black text-rose-400 text-base">₹{total}</span>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs mb-6 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Two Explicit Action Buttons as Specified */}
        <div className="space-y-3">
          {/* 1. Simulate Success */}
          <button
            disabled={processing}
            onClick={handleSimulateSuccess}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            <CheckCircle2 className="w-5 h-5" />
            {processing ? 'Confirming in PostgreSQL & Redis...' : 'Simulate Success'}
          </button>

          {/* 2. Simulate Failure */}
          <button
            disabled={processing}
            onClick={() => handleSimulateFailure('User triggered intentional payment failure')}
            className="w-full py-3.5 rounded-2xl bg-dark-800 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-all hover:border-rose-500/60 active:scale-95 disabled:opacity-50"
          >
            <XCircle className="w-4 h-4 text-rose-500" />
            Simulate Failure (Release Seats)
          </button>
        </div>

        <p className="text-[11px] text-slate-500 text-center mt-5">
          Atomic lock is active in Redis. Clicking Simulate Failure deletes hold keys immediately.
        </p>
      </div>
    </div>
  );
}
