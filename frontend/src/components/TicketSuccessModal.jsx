import React, { useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { CheckCircle, Download, X, Film, MapPin, Calendar, Clock, Ticket, Share2 } from 'lucide-react';

export default function TicketSuccessModal({ ticket, onClose, onViewProfile }) {
  useEffect(() => {
    // Launch celebratory confetti burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-dark-900 border border-white/15 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl relative my-auto">
        
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-400 hover:text-white transition-colors border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">Booking Confirmed!</h2>
          <p className="text-xs text-slate-400 mt-1">
            Persisted in PostgreSQL • Redis Hold Released • Ticket Ready
          </p>
        </div>

        {/* Digital Ticket Pass Stub */}
        <div className="bg-gradient-to-b from-dark-800 to-dark-850 rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative">
          
          {/* Top Pass Section */}
          <div className="p-6 border-b border-dashed border-white/20 relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                Step 4: Confirmed Digital Pass
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">
                #{ticket.bookingId}
              </span>
            </div>

            <h3 className="text-xl font-black text-white">{ticket.movieTitle}</h3>

            <div className="mt-4 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="font-semibold text-slate-200">{ticket.theatreName} ({ticket.screenName})</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>{ticket.startTime || 'Today, 07:30 PM'}</span>
              </div>
            </div>

            {/* Cutout notches */}
            <div className="absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-dark-900 border-r border-white/10" />
            <div className="absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-dark-900 border-l border-white/10" />
          </div>

          {/* Bottom Pass Stub with QR Code */}
          <div className="p-6 bg-dark-800/90 flex flex-col items-center text-center">
            <div className="p-3 bg-white rounded-2xl shadow-lg mb-3">
              <QRCodeSVG
                value={ticket.qrCodeToken || `BI-TICKET-${ticket.bookingId}`}
                size={130}
                level="H"
                includeMargin={false}
              />
            </div>
            
            <p className="font-mono text-[11px] font-bold text-slate-400 tracking-wider">
              {ticket.qrCodeToken || `BI-TICKET-${ticket.bookingId}`}
            </p>

            <div className="mt-4 w-full flex items-center justify-around py-3 bg-dark-900/80 rounded-2xl border border-white/5">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Seats</p>
                <p className="text-sm font-black text-emerald-400">
                  {ticket.seatLabels?.join(', ') || 'Seats Reserved'}
                </p>
              </div>
              <div className="h-6 w-[1px] bg-white/10" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Amount Paid</p>
                <p className="text-sm font-black text-rose-400">₹{ticket.totalAmount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => {
              window.print();
            }}
            className="flex-1 py-3 rounded-2xl bg-dark-800 hover:bg-dark-700 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/10 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Ticket
          </button>

          <button
            onClick={() => {
              onClose();
              onViewProfile();
            }}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <Ticket className="w-4 h-4" />
            My Bookings
          </button>
        </div>
      </div>
    </div>
  );
}
