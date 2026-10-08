import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, ArrowLeft, Shield, Clock, Ticket } from 'lucide-react';
import Header from './Header';
import PaymentModal from './PaymentModal';

export default function CheckoutPage({ 
  bookingData, 
  currentUser, 
  onPaymentSuccess, 
  onCancel,
  onLogout 
}) {
  const navigate = useNavigate();

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col font-sans">
        <Header currentUser={currentUser} onLogout={onLogout} selectedCity="Chennai" />
        <main className="flex-1 max-w-xl w-full mx-auto px-6 py-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-3xl bg-dark-800 border border-white/10 flex items-center justify-center text-slate-400 mb-5 shadow-xl">
            <Ticket className="w-8 h-8 text-rose-500" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">No Active Checkout Session</h1>
          <p className="text-xs text-slate-400 mb-6 max-w-sm leading-relaxed">
            Please select a movie showtime and choose your preferred seats to initiate an atomic 10-minute hold in Redis.
          </p>
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse Movie Catalog
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col font-sans">
      <Header currentUser={currentUser} onLogout={onLogout} selectedCity="Chennai" />
      <PaymentModal
        bookingData={bookingData}
        currentUser={currentUser}
        onClose={() => navigate('/')}
        onBackToSeats={() => navigate('/')}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentCancelled={onCancel}
      />
    </div>
  );
}
