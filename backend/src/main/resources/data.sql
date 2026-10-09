-- Users (Passwords are bcrypt encoded: 'password123')
INSERT INTO users (id, name, email, password, role) VALUES 
(1, 'User 1 (Praveen)', 'praveen@bookinstant.com', '$2a$10$wKz0b9fP9Zk9P1Qk/O73iO0tWJ0m7a7w1K5H7UeF6H.W8h8W1uC0m', 'USER'),
(2, 'User 2 (Sarah)', 'sarah@bookinstant.com', '$2a$10$wKz0b9fP9Zk9P1Qk/O73iO0tWJ0m7a7w1K5H7UeF6H.W8h8W1uC0m', 'USER'),
(3, 'User 3 (Alex)', 'alex@bookinstant.com', '$2a$10$wKz0b9fP9Zk9P1Qk/O73iO0tWJ0m7a7w1K5H7UeF6H.W8h8W1uC0m', 'USER'),
(99, 'Admin User', 'admin@bookinstant.com', '$2a$10$wKz0b9fP9Zk9P1Qk/O73iO0tWJ0m7a7w1K5H7UeF6H.W8h8W1uC0m', 'ADMIN');

-- Movies
INSERT INTO movies (id, title, description, poster_url, backdrop_url, rating, genre, duration_mins, age_rating, format, is_upcoming, is_pre_book, release_date) VALUES
(1, 'Dune: Part Two', 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop', 9.1, 'Sci-Fi', 166, '13+', 'IMAX', false, false, '2024-03-01'),
(2, 'Oppenheimer', 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.', 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1600&auto=format&fit=crop', 8.9, 'Drama', 180, '15+', 'IMAX', false, false, '2023-07-21'),
(3, 'Cyberpunk: Neon Genesis', 'In 2099 Neo-Tokyo, a cybernetic detective unravels a sentient AI conspiracy that threatens humanity.', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1600&auto=format&fit=crop', 8.7, 'Action', 142, '18+', '3D', false, false, '2024-05-15'),
(4, 'Interstellar Odyssey', 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity survival.', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1600&auto=format&fit=crop', 9.0, 'Sci-Fi', 169, '13+', 'IMAX', false, false, '2024-06-10'),
(5, 'Shadows in the Mist', 'An isolated forensic investigator encounters supernatural psychological horrors in the Scottish highlands.', 'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop', 7.9, 'Horror', 115, '18+', '2D', false, false, '2024-07-01'),
(6, 'Avengers: Secret Wars', 'The ultimate multiversal collision where heroes collide across alternate timelines to rescue reality.', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600&auto=format&fit=crop', 9.4, 'Action', 175, '13+', 'IMAX', true, true, '2025-05-01'),
(7, 'Gladiator II', 'Years after Maximus, Lucius steps into the Colosseum to avenge the fallen legacy of Rome.', 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=1600&auto=format&fit=crop', 8.8, 'Action', 150, '15+', '2D', true, false, '2025-11-20'),
(8, 'Live Comedy: Standup Arena', 'Top stand-up comedians headline an electrifying evening of sharp satire and uncensored laughs.', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1600&auto=format&fit=crop', 8.5, 'Comedy', 120, '15+', '2D', false, false, '2024-08-20');

-- Theatres
INSERT INTO theatres (id, name, city, address) VALUES
(1, 'PVR INOX IMAX Forum', 'Chennai', 'Vijaya Mall, Vadapalani, Chennai'),
(2, 'SPI Palazzo Central', 'Chennai', 'Nexus Vijaya Mall, Arcot Rd, Chennai'),
(3, 'PVR ICON Gold Class', 'Mumbai', 'Phoenix Palladium, Lower Parel, Mumbai'),
(4, 'Cinepolis Grand Mall', 'Bengaluru', 'Orion Mall, Rajajinagar, Bengaluru');

-- Screens
INSERT INTO screens (id, theatre_id, name, total_seats) VALUES
(1, 1, 'IMAX Laser Screen 1', 60),
(2, 1, 'Dolby Atmos Screen 2', 60),
(3, 3, 'Screen 1 Gold', 60),
(4, 4, 'IMAX 4K Screen 3', 60);

-- Showtimes
INSERT INTO showtimes (id, movie_id, screen_id, start_time, price) VALUES
(1, 1, 1, '2026-10-07 19:30:00', 350.00),
(2, 1, 1, '2026-10-07 22:45:00', 380.00),
(3, 2, 2, '2026-10-07 20:00:00', 300.00),
(4, 3, 1, '2026-10-08 18:00:00', 320.00),
(5, 4, 3, '2026-10-08 21:00:00', 450.00),
(6, 5, 4, '2026-10-08 22:15:00', 250.00);

-- Seats for Screen 1 (Rows A to F, 1 to 10)
INSERT INTO seats (id, screen_id, row_label, seat_number, seat_type) VALUES
-- Row A (VIP)
(1, 1, 'A', 1, 'VIP'), (2, 1, 'A', 2, 'VIP'), (3, 1, 'A', 3, 'VIP'), (4, 1, 'A', 4, 'VIP'), (5, 1, 'A', 5, 'VIP'),
(6, 1, 'A', 6, 'VIP'), (7, 1, 'A', 7, 'VIP'), (8, 1, 'A', 8, 'VIP'), (9, 1, 'A', 9, 'VIP'), (10, 1, 'A', 10, 'VIP'),
-- Row B (VIP)
(11, 1, 'B', 1, 'VIP'), (12, 1, 'B', 2, 'VIP'), (13, 1, 'B', 3, 'VIP'), (14, 1, 'B', 4, 'VIP'), (15, 1, 'B', 5, 'VIP'),
(16, 1, 'B', 6, 'VIP'), (17, 1, 'B', 7, 'VIP'), (18, 1, 'B', 8, 'VIP'), (19, 1, 'B', 9, 'VIP'), (20, 1, 'B', 10, 'VIP'),
-- Row C (STANDARD)
(21, 1, 'C', 1, 'STANDARD'), (22, 1, 'C', 2, 'STANDARD'), (23, 1, 'C', 3, 'STANDARD'), (24, 1, 'C', 4, 'STANDARD'), (25, 1, 'C', 5, 'STANDARD'),
(26, 1, 'C', 6, 'STANDARD'), (27, 1, 'C', 7, 'STANDARD'), (28, 1, 'C', 8, 'STANDARD'), (29, 1, 'C', 9, 'STANDARD'), (30, 1, 'C', 10, 'STANDARD'),
-- Row D (STANDARD)
(31, 1, 'D', 1, 'STANDARD'), (32, 1, 'D', 2, 'STANDARD'), (33, 1, 'D', 3, 'STANDARD'), (34, 1, 'D', 4, 'STANDARD'), (35, 1, 'D', 5, 'STANDARD'),
(36, 1, 'D', 6, 'STANDARD'), (37, 1, 'D', 7, 'STANDARD'), (38, 1, 'D', 8, 'STANDARD'), (39, 1, 'D', 9, 'STANDARD'), (40, 1, 'D', 10, 'STANDARD'),
-- Row E (STANDARD)
(41, 1, 'E', 1, 'STANDARD'), (42, 1, 'E', 2, 'STANDARD'), (43, 1, 'E', 3, 'STANDARD'), (44, 1, 'E', 4, 'STANDARD'), (45, 1, 'E', 5, 'STANDARD'),
(46, 1, 'E', 6, 'STANDARD'), (47, 1, 'E', 7, 'STANDARD'), (48, 1, 'E', 8, 'STANDARD'), (49, 1, 'E', 9, 'STANDARD'), (50, 1, 'E', 10, 'STANDARD'),
-- Row F (STANDARD)
(51, 1, 'F', 1, 'STANDARD'), (52, 1, 'F', 2, 'STANDARD'), (53, 1, 'F', 3, 'STANDARD'), (54, 1, 'F', 4, 'STANDARD'), (55, 1, 'F', 5, 'STANDARD'),
(56, 1, 'F', 6, 'STANDARD'), (57, 1, 'F', 7, 'STANDARD'), (58, 1, 'F', 8, 'STANDARD'), (59, 1, 'F', 9, 'STANDARD'), (60, 1, 'F', 10, 'STANDARD');

-- Initial Confirmed Booking for demonstration (Sold seats: C4, C5)
INSERT INTO bookings (id, user_id, showtime_id, total_amount, status, qr_code_token, created_at) VALUES
(1, 3, 1, 700.00, 'CONFIRMED', 'TKT-DUNE2-1-240301-C4C5', CURRENT_TIMESTAMP);

INSERT INTO booking_seats (id, booking_id, seat_id) VALUES
(1, 1, 24),
(2, 1, 25);

-- Synchronize sequences with max IDs so new auto-generated IDs never collide
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));
SELECT setval('movies_id_seq', (SELECT COALESCE(MAX(id), 1) FROM movies));
SELECT setval('theatres_id_seq', (SELECT COALESCE(MAX(id), 1) FROM theatres));
SELECT setval('screens_id_seq', (SELECT COALESCE(MAX(id), 1) FROM screens));
SELECT setval('showtimes_id_seq', (SELECT COALESCE(MAX(id), 1) FROM showtimes));
SELECT setval('seats_id_seq', (SELECT COALESCE(MAX(id), 1) FROM seats));
SELECT setval('bookings_id_seq', (SELECT COALESCE(MAX(id), 1) FROM bookings));
SELECT setval('booking_seats_id_seq', (SELECT COALESCE(MAX(id), 1) FROM booking_seats));

