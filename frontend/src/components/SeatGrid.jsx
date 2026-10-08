import React from 'react';

export default function SeatGrid({
  seats = [],
  selectedSeatIds = [],
  currentUser,
  onToggleSeat,
  onBlockedSeatClick
}) {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const seatsByRow = rows.map((r) => seats.filter((s) => s.rowLabel === r));

  return (
    <div className="w-full select-none">
      {/* Cinema Screen Curve Visualization */}
      <div className="w-full flex flex-col items-center mb-8">
        <div className="w-3/4 h-2 bg-gradient-to-r from-transparent via-sky-400 to-transparent rounded-full shadow-[0_8px_25px_rgba(56,189,248,0.5)] mb-2.5" />
        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
          CINEMA ALL EYES THIS WAY (SCREEN)
        </p>
      </div>

      {/* Seat Rows Matrix */}
      <div className="space-y-2.5 max-w-2xl mx-auto mb-8">
        {seatsByRow.map((rowSeats, rowIndex) => {
          const rowLabel = rows[rowIndex];

          return (
            <div key={rowLabel} className="flex items-center justify-center gap-2">
              <span className="w-7 text-xs font-extrabold text-slate-400 text-center shrink-0">
                {rowLabel}
              </span>

              <div className="flex flex-wrap gap-1.5 justify-center">
                {rowSeats.map((seat) => {
                  const currentUserIdStr = currentUser ? String(currentUser.id).replace(/^User_?/i, '').trim() : '';
                  const seatHolderIdStr = seat.heldBy != null 
                    ? String(seat.heldBy).replace(/^User_?/i, '').trim() 
                    : (seat.lockedByUserId != null ? String(seat.lockedByUserId).replace(/^User_?/i, '').trim() : '');

                  const isBooked = seat.status === 'BOOKED';
                  const isHeld = (seat.status === 'HELD' || seat.status === 'LOCKED') && (seat.remainingHoldSeconds == null || seat.remainingHoldSeconds > 0);
                  const isHeldByAnotherUser = isHeld && seatHolderIdStr !== '' && seatHolderIdStr !== currentUserIdStr;
                  const isHeldByCurrentUser = isHeld && seatHolderIdStr !== '' && seatHolderIdStr === currentUserIdStr;
                  const isSelectedInUi = selectedSeatIds.includes(seat.id);

                  // 🌟 Visual States Enforced:
                  // 1. Sold/Confirmed in DB: RED & DISABLED
                  // 2. Locked by another user in Redis: YELLOW & DISABLED
                  // 3. Selected by active user: GREEN
                  // 4. Available: WHITE & CLICKABLE
                  let colorClass = 'bg-white text-dark-900 hover:scale-110 hover:shadow-lg hover:shadow-white/20 border-slate-300';
                  let isDisabled = false;

                  if (isBooked) {
                    colorClass = 'bg-rose-600 text-white cursor-not-allowed opacity-85 border-rose-700';
                    isDisabled = true;
                  } else if (isHeldByAnotherUser) {
                    // YELLOW & DISABLED (Locked by Another User)
                    colorClass = 'bg-amber-400 text-dark-950 font-black cursor-not-allowed opacity-95 border-amber-500 shadow-md shadow-amber-400/40';
                    isDisabled = true;
                  } else if (isHeldByCurrentUser || isSelectedInUi) {
                    // GREEN (Selected by You)
                    colorClass = 'bg-emerald-500 text-white font-black scale-110 shadow-lg shadow-emerald-500/50 border-emerald-400';
                    isDisabled = false;
                  }

                  const handleSeatClick = () => {
                    if (isHeldByAnotherUser) {
                      if (onBlockedSeatClick) onBlockedSeatClick(seat);
                      return;
                    }
                    if (isBooked) return;
                    onToggleSeat(seat);
                  };

                  return (
                    <div key={seat.id} className="relative inline-block">
                      <button
                        type="button"
                        disabled={isDisabled}
                        onClick={handleSeatClick}
                        title={`Seat ${seat.seatLabel} (${seat.seatType}) - ₹${seat.price} | ${
                          isBooked
                            ? 'Confirmed / Sold in DB'
                            : isHeldByAnotherUser
                            ? `Locked by ${seat.heldByName || seat.lockedByUserName || `User ${seatHolderId}`} in Redis`
                            : (isHeldByCurrentUser || isSelectedInUi)
                            ? 'Selected by You'
                            : 'Available'
                        }`}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[10px] font-extrabold flex items-center justify-center transition-all duration-150 border ${colorClass} ${
                          seat.seatLabel === 'G12' ? 'ring-2 ring-rose-500/60' : ''
                        }`}
                      >
                        {seat.seatNumber}
                      </button>

                      {/* Invisible click interceptor for disabled yellow seats to fire conflict toasts */}
                      {isHeldByAnotherUser && (
                        <div
                          onClick={() => {
                            if (onBlockedSeatClick) onBlockedSeatClick(seat);
                          }}
                          className="absolute inset-0 cursor-not-allowed z-10"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <span className="w-7 text-xs font-extrabold text-slate-400 text-center shrink-0">
                {rowLabel}
              </span>
            </div>
          );
        })}
      </div>

      {/* Real-Time Color States Legend */}
      <div className="bg-dark-800/80 rounded-2xl p-4 border border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-white border border-slate-300 shadow-sm" />
          <span className="text-slate-300 font-semibold">White: Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-amber-400 shadow-sm shadow-amber-400/40" />
          <span className="text-amber-300 font-bold">Yellow: Locked by Another User (Disabled)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-emerald-500 shadow-sm shadow-emerald-500/40" />
          <span className="text-emerald-300 font-bold">Green: Selected by You</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-rose-600 shadow-sm shadow-rose-600/40" />
          <span className="text-rose-400 font-semibold">Red: Sold / Confirmed (Disabled)</span>
        </div>
      </div>
    </div>
  );
}
