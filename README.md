# BookInstant - High-Concurrency Movie Booking Platform

BookInstant is an enterprise-grade full-stack movie booking platform featuring high-concurrency seat locking powered by **Redis distributed locks (Redisson)** to eliminate race conditions, alongside a mock payment workflow and an administrative concurrency audit dashboard.

---

## 🏗️ Architecture & Tech Stack

### Backend
- **Framework:** Java 21, Spring Boot 3.3.4
- **Security:** Spring Security with JWT (`io.jsonwebtoken` JJWT 0.12.5) & Stateless Auth
- **Persistence:** PostgreSQL 16 (Local Docker container / Production) with schema DDL & data seeds
- **Distributed Locks:** Redis 7 with Redisson Client (`lock:showtime:{id}` & `seat:hold:{showtimeId}:{seatId}` with 10-minute TTL)
- **Database Migrations:** Schema DDL & Data SQL initializers with pre-seeded movies, theatres, screens, and VIP/Standard seats

### Frontend
- **Framework:** React.js (Vite) with React Router v6
- **Styling:** Tailwind CSS with custom glassmorphism design system & micro-animations
- **Animations:** Framer Motion (interactive card shuffle / swipe UI inspired by District app)
- **Icons:** Lucide React Icons
- **Tickets & Celebration:** Canvas Confetti & SVG QR Code generator (`qrcode.react`)

---

## 🚀 Local Development Setup (VS Code + Docker)

### 1. Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Java 21 JDK](https://adoptium.net/) & [Maven](https://maven.apache.org/)
- [Node.js 20+](https://nodejs.org/) & `npm`
- [VS Code](https://code.visualstudio.com/) with recommended extensions

---

### 2. Start PostgreSQL & Redis Containers
From the project root:
```bash
docker compose up -d
```

This launches:
- **PostgreSQL 16** container `bookinstant_postgres` on port `5432`
  - Database: `bookinstant_db`
  - User: `postgres`
  - Password: `praveen26`
- **Redis 7** container `bookinstant_redis` on port `6379`

To inspect container status:
```bash
docker compose ps
```

To stop containers:
```bash
docker compose down
```

---

### 3. Run the Spring Boot Backend
```bash
cd backend
mvn spring-boot:run
```
The backend starts on `http://localhost:8080`.

**Database Connection Configuration:**
- JDBC URL: `jdbc:postgresql://localhost:5432/bookinstant_db`
- Username: `postgres`
- Password: `praveen26`
- Redis URL: `redis://127.0.0.1:6379`

*(Offline fallback: If running without Docker, run with `-Dspring.profiles.active=h2` to use the embedded in-memory database).*

---

### 4. Run the React Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend starts on `http://localhost:5173`.

---

## 🛠️ VS Code Integration (`.vscode`)

The project is pre-configured with complete VS Code workspaces:

- **`.vscode/settings.json`**: Java build path, Tailwind CSS class regexes, format-on-save, and file associations.
- **`.vscode/launch.json`**:
  - `Spring Boot - BookInstant Backend`: Debugs Spring Boot directly inside VS Code with environment variables pre-bound to local PostgreSQL and Redis.
  - `Debug Frontend (Chrome)`: Launches Chrome debugger attached to `http://localhost:5173`.
  - `Full Stack (Backend + Frontend)`: Compound launcher to start both debugging sessions simultaneously.
- **`.vscode/tasks.json`**: Run tasks via `Ctrl + Shift + P` -> `Tasks: Run Task`:
  - `Docker: Start Postgres & Redis`
  - `Docker: Stop Containers`
  - `Backend: Maven Run (Spring Boot)`
  - `Frontend: Start Dev Server (Vite)`
  - `Frontend: Build Production Bundle`
- **`.vscode/extensions.json`**: Recommends Java, Spring Boot, Docker, Tailwind CSS, and SQL tools extensions.

---

## 🔐 Credentials & Demo Accounts

### Standard Users (`ROLE_USER`)
- **User 1 (Praveen):** `praveen@bookinstant.com` / `password123`
- **User 2 (Sarah):** `sarah@bookinstant.com` / `password123`
- **User 3 (Alex):** `alex@bookinstant.com` / `password123`

### Administrator (`ROLE_ADMIN`)
- **Admin User:** `admin@bookinstant.com` / `password123`
- **Admin Portal Route:** `/admin/login` -> Access to `/admin` dashboard.

---

## 📦 Git & GitHub Push Setup

A clean `.gitignore` has been prepared to prevent committing `node_modules/`, `target/`, build artifacts, and secrets.

To push to your remote GitHub repository:
```bash
git add .
git commit -m "feat: complete full-stack BookInstant platform with Redis seat locking and VS Code config"
git remote add origin https://github.com/<your-username>/bookinstant.git
git push -u origin main
```
