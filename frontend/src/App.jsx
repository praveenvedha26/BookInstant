import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import HeroCarousel from './components/HeroCarousel';
import MovieCarousel from './components/MovieCarousel';
import CategoryGrid from './components/CategoryGrid';
import UpcomingSection from './components/UpcomingSection';
import EventsSection from './components/EventsSection';
import TheatreModal from './components/TheatreModal';
import SeatGridModal from './components/SeatGridModal';
import PaymentModal from './components/PaymentModal';
import TicketSuccessModal from './components/TicketSuccessModal';
import UserProfileModal from './components/UserProfileModal';
import UserProfilePage from './components/UserProfilePage';
import CheckoutPage from './components/CheckoutPage';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import UserAuthPage from './components/UserAuthPage';
import ProtectedRoute from './components/ProtectedRoute';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';
import { api, STANDARD_USERS, ADMIN_USER, AVAILABLE_USERS } from './services/api';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedCity, setSelectedCity] = useState('Chennai');
  const [movies, setMovies] = useState([]);
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Active User State (null if unauthenticated, or loaded from session)
  const [currentUser, setCurrentUser] = useState(() => {
    return api.getSessionUser() || STANDARD_USERS[0];
  });

  // Toast Notifications State
  const [toasts, setToasts] = useState([]);

  // 4-Step Funnel States
  const [funnelMovie, setFunnelMovie] = useState(null); // Movie selected for booking
  const [selectedShowtime, setSelectedShowtime] = useState(null); // Step 1 completed
  const [activeBookingData, setActiveBookingData] = useState(null); // Step 2 completed (Seats locked)
  const [confirmedTicket, setConfirmedTicket] = useState(null); // Step 3 completed (Confirmed pass)
  const [pendingBookingMovie, setPendingBookingMovie] = useState(null); // For unauthenticated funnel resume

  // Profile & Auth Modal States
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileInitialTab, setProfileInitialTab] = useState('tickets');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    // Initialize active user session with JWT token in localStorage
    const savedUser = api.getSessionUser();
    if (savedUser) {
      setCurrentUser(savedUser);
      api.setSessionUser(savedUser);
    }

    const loadCatalog = async () => {
      const [fetchedMovies, fetchedEvents] = await Promise.all([
        api.getMovies(),
        api.getEvents()
      ]);
      setMovies(fetchedMovies);
      setEvents(fetchedEvents);
    };
    loadCatalog();
  }, []);

  // Filter movies for Search
  const displayedMovies = searchQuery.trim()
    ? movies.filter((m) =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.genre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.format?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : movies;

  const currentReleases = displayedMovies.filter((m) => !m.isUpcoming);

  // 🌟 Dynamic Concurrency Simulation User Swapper (Inside Admin Dashboard)
  const handleSwitchUser = (newUser) => {
    api.setSessionUser(newUser);
    setCurrentUser(newUser);

    if (activeBookingData && String(activeBookingData.userId) !== String(newUser.id)) {
      setActiveBookingData(null);
    }

    window.dispatchEvent(new CustomEvent('bookinstant_session_switched', { detail: { user: newUser, token: newUser.token } }));
    window.dispatchEvent(new CustomEvent('bookinstant_holds_changed'));

    addToast({
      type: 'success',
      title: 'Context Swapped',
      message: `Active session swapped to ${newUser.name}. Real-time Redis holds and conflict responses updated.`
    });
  };

  // Funnel Step 0: Start Booking -> Check Authentication Gate
  const handleStartBooking = (movie) => {
    // If not authenticated, prompt standard login modal before proceeding
    if (!currentUser || !currentUser.token) {
      setPendingBookingMovie(movie);
      setShowAuthModal(true);
      addToast({
        type: 'info',
        title: 'Sign In Required',
        message: 'Please sign in or create an account to reserve movie seats.'
      });
      return;
    }

    setFunnelMovie(movie);
    setSelectedShowtime(null);
    setActiveBookingData(null);
    setConfirmedTicket(null);
  };

  // Funnel Step 1: Showtime Chosen -> Open Seat Grid (Step 2)
  const handleSelectShowtime = (showtime) => {
    setSelectedShowtime(showtime);
  };

  // Funnel Step 2: Seats Locked -> Open Mock Payment Modal (Step 3)
  const handleProceedToPayment = (bookingPayload) => {
    setActiveBookingData(bookingPayload);
  };

  // Funnel Step 3: Payment Confirmed -> Open Ticket Pass (Step 4)
  const handlePaymentSuccess = (ticketReceipt) => {
    setActiveBookingData(null);
    setFunnelMovie(null);
    setSelectedShowtime(null);
    setConfirmedTicket(ticketReceipt);
    addToast({
      type: 'success',
      title: 'Booking Confirmed',
      message: `Ticket #${ticketReceipt.bookingId} issued with digital QR pass!`
    });
  };

  // Payment Cancelled
  const handlePaymentCancelled = () => {
    setActiveBookingData(null);
    addToast({
      type: 'info',
      title: 'Payment Cancelled',
      message: 'Hold keys deleted from Redis. Seats released back to the available pool.'
    });
  };

  // 🌟 CRITICAL BUG FIX 1: LOGOUT REDIRECTION TO /login
  const handleLogout = () => {
    api.clearSession();
    setCurrentUser(null);
    addToast({
      type: 'info',
      title: 'Signed Out',
      message: 'You have been logged out. Redirecting to login...'
    });
    // Redirect directly to the Login/Signup page (/login), not left on the home screen
    navigate('/login', { replace: true });
  };

  // User Auth Success from modal or page
  const handleUserAuthSuccess = (user) => {
    api.setSessionUser(user);
    setCurrentUser(user);
    setShowAuthModal(false);
    addToast({
      type: 'success',
      title: 'Welcome Back!',
      message: `Signed in as ${user.name} (${user.role || 'ROLE_USER'}).`
    });

    if (pendingBookingMovie) {
      setFunnelMovie(pendingBookingMovie);
      setPendingBookingMovie(null);
    }
  };

  // 🌟 CRITICAL BUG FIX 3: ADMIN LOGIN DIRECT ROUTING TO /admin
  const handleAdminLoginSuccess = (adminUser) => {
    api.setSessionUser(adminUser);
    setCurrentUser(adminUser);
    addToast({
      type: 'success',
      title: 'Admin Access Granted',
      message: `Logged into BookInstant Admin as ${adminUser.name}. Routing directly to Admin Dashboard.`
    });
    // Ensure admins are routed directly to the Admin Dashboard upon successful authentication
    navigate('/admin', { replace: true });
  };

  // Render storefront wrapper for public catalog routes
  const renderStorefront = (activeView) => (
    <div className="flex-1 flex flex-col">
      <Header
        activeTab={activeView}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        currentUser={currentUser}
        onOpenProfile={(tab) => {
          setProfileInitialTab(tab || 'tickets');
          setShowProfileModal(true);
        }}
        onOpenAuthModal={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={setSearchQuery}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-8 py-6">
        {activeView === 'for-you' && (
          <div>
            {!searchQuery && (
              <HeroCarousel
                movies={movies}
                onBookNow={handleStartBooking}
              />
            )}

            <MovieCarousel
              title={searchQuery ? `Search Results for "${searchQuery}"` : "This Week's Releases"}
              movies={currentReleases}
              onSelectMovie={handleStartBooking}
            />

            {!searchQuery && (
              <div className="mt-8 pt-8 border-t border-white/10">
                <UpcomingSection
                  movies={movies}
                  onSelectMovie={handleStartBooking}
                />
              </div>
            )}
          </div>
        )}

        {activeView === 'categories' && (
          <CategoryGrid
            movies={movies}
            onSelectMovie={handleStartBooking}
          />
        )}

        {activeView === 'upcoming' && (
          <UpcomingSection
            movies={movies}
            onSelectMovie={handleStartBooking}
          />
        )}

        {activeView === 'events' && (
          <EventsSection
            events={events}
            onBookEvent={(evt) => {
              handleStartBooking({
                id: evt.id,
                title: evt.title,
                genre: evt.category,
                format: 'LIVE',
                durationMins: 150,
                rating: 9.2,
                posterUrl: evt.banner,
                backdropUrl: evt.banner
              });
            }}
          />
        )}
      </main>

      <footer className="glass-panel border-t border-white/10 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">BookInstant</span>
            <span>•</span>
            <span>High-Concurrency Movie Booking Engine</span>
          </div>
          <div className="flex items-center gap-4">
            <span>District UI</span>
            <span>•</span>
            <button
              onClick={() => navigate('/admin/login')}
              className="text-amber-400 hover:text-amber-300 font-semibold transition-colors text-[11px]"
            >
              Admin Portal (/admin/login)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col font-sans">
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* 🌟 ROUTING ARCHITECTURE SPECIFIED BY USER */}
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<UserAuthPage mode="login" onAuthSuccess={handleUserAuthSuccess} />} />
        <Route path="/signup" element={<UserAuthPage mode="signup" onAuthSuccess={handleUserAuthSuccess} />} />
        <Route path="/admin/login" element={<AdminLogin onAdminLoginSuccess={handleAdminLoginSuccess} />} />

        {/* GUEST / PUBLIC CATALOG ROUTES */}
        <Route path="/" element={renderStorefront('for-you')} />
        <Route path="/movies" element={renderStorefront('for-you')} />
        <Route path="/categories" element={renderStorefront('categories')} />
        <Route path="/upcoming" element={renderStorefront('upcoming')} />
        <Route path="/events" element={renderStorefront('events')} />

        {/* PROTECTED USER ROUTES (Requires ROLE_USER or ROLE_ADMIN) */}
        <Route element={<ProtectedRoute currentUser={currentUser} allowedRoles={['ROLE_USER', 'ROLE_ADMIN']} />}>
          <Route path="/profile" element={<UserProfilePage currentUser={currentUser} initialTab="profile" onLogout={handleLogout} />} />
          <Route path="/my-bookings" element={<UserProfilePage currentUser={currentUser} initialTab="tickets" onLogout={handleLogout} />} />
          <Route path="/checkout" element={<CheckoutPage bookingData={activeBookingData} currentUser={currentUser} onPaymentSuccess={handlePaymentSuccess} onCancel={handlePaymentCancelled} onLogout={handleLogout} />} />
        </Route>

        {/* PROTECTED ADMIN ROUTES (Requires ROLE_ADMIN strictly) */}
        <Route element={<ProtectedRoute currentUser={currentUser} allowedRoles={['ROLE_ADMIN']} />}>
          <Route 
            path="/admin" 
            element={
              <AdminDashboard
                currentUser={currentUser}
                onExitAdmin={() => navigate('/')}
                onMovieAdded={(newMovie) => setMovies((prev) => [newMovie, ...prev])}
                onSwitchUser={handleSwitchUser}
              />
            } 
          />
        </Route>

        {/* Catch-all redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* 🌟 4-STEP BOOKING FUNNEL MODALS */}

      {/* STEP 1: THEATRE & SHOWTIME SELECTION MODAL */}
      {funnelMovie && !selectedShowtime && (
        <TheatreModal
          movie={funnelMovie}
          selectedCity={selectedCity}
          onClose={() => setFunnelMovie(null)}
          onSelectShowtime={handleSelectShowtime}
        />
      )}

      {/* STEP 2: INTERACTIVE SEAT GRID & REDIS LOCK MODAL */}
      {funnelMovie && selectedShowtime && !activeBookingData && (
        <SeatGridModal
          movie={funnelMovie}
          showtime={selectedShowtime}
          currentUser={currentUser || STANDARD_USERS[0]}
          onClose={() => {
            setFunnelMovie(null);
            setSelectedShowtime(null);
          }}
          onBackToTheatres={() => setSelectedShowtime(null)}
          onProceedToPayment={handleProceedToPayment}
          onTriggerToast={addToast}
        />
      )}

      {/* STEP 3: MOCK PAYMENT MODAL (ITEMIZED PRICING + SUCCESS/FAILURE BUTTONS) */}
      {activeBookingData && (
        <PaymentModal
          bookingData={activeBookingData}
          currentUser={currentUser || STANDARD_USERS[0]}
          onClose={() => setActiveBookingData(null)}
          onBackToSeats={() => setActiveBookingData(null)}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentCancelled={handlePaymentCancelled}
        />
      )}

      {/* STEP 4: DIGITAL CONFIRMATION TICKET RECEIPT WITH QR CODE */}
      {confirmedTicket && (
        <TicketSuccessModal
          ticket={confirmedTicket}
          onClose={() => setConfirmedTicket(null)}
          onViewProfile={() => {
            setConfirmedTicket(null);
            navigate('/my-bookings');
          }}
        />
      )}

      {/* USER PROFILE MODAL (QUICK POPUP) */}
      {showProfileModal && (
        <UserProfileModal
          currentUser={currentUser || STANDARD_USERS[0]}
          initialTab={profileInitialTab}
          setCurrentUser={setCurrentUser}
          onClose={() => setShowProfileModal(false)}
          onLogout={handleLogout}
        />
      )}

      {/* STANDARD USER JWT AUTH & LOGIN / SIGNUP MODAL */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        currentUser={currentUser}
        onLoginSuccess={handleUserAuthSuccess}
        onLogout={handleLogout}
      />
    </div>
  );
}
