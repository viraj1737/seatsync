# SeatSync — Smart Library Seat Availability & Reservation System

SeatSync is a simple, responsive web application built for the Advanced Web Technologies (AWT) course. It enables university students to check real-time seat availability across library floors/zones and reserve seats for defined time slots, while providing library staff with an administrative dashboard to manage seating layout and inspect occupancy analytics.

---

## 🛠️ Mandatory Technology Stack

- **Frontend Structure & Styling:** HTML5, CSS3 (Custom Apple-inspired design system tokens, no external CSS frameworks)
- **Frontend Core & Logic:** JavaScript (ES6+), AngularJS 1.x (Two-way binding, controllers, directives, services, filters)
- **Interactive Micro-interactions:** jQuery (Non-Angular decorative elements, animations, syllabus demonstration)
- **Data Visualisation:** D3.js + SVG (Admin occupancy and booking trend charts)
- **Server-Side Runtime:** Node.js (LTS v26+)
- **Application Framework:** Express.js (RESTful API, routing, static serving)
- **Database & ODM:** MongoDB Community Server + Mongoose
- **State & Authentication:** `express-session`, cookie-based sessions, `bcryptjs` password hashing

---

## 📁 Project Architecture & Folder Structure

```
SeatSync/
├── README.md                   # Setup guide and documentation
├── .gitignore                  # Git ignore rules
├── package.json                # Dependencies and project scripts
├── .env.example                # Environment template
├── .env                        # Local environment variables
├── frontend/                   # Client-side application
│   ├── index.html              # Main landing / status page
│   ├── login.html              # Student / Admin authentication
│   ├── register.html           # Student registration
│   ├── student.html            # Student dashboard, seat map & booking
│   ├── admin.html              # Admin management & analytics
│   ├── css/
│   │   ├── tokens.css          # Design tokens (colors, radii, spacing)
│   │   ├── base.css            # Typography & global styles
│   │   ├── components.css      # Buttons, cards, modals, tables, badges
│   │   └── responsive.css      # Media queries for tablet and mobile
│   ├── js/
│   │   ├── app.js              # AngularJS root module configuration
│   │   ├── services/
│   │   │   └── api.service.js  # Angular $http abstraction
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── student.controller.js
│   │   │   └── admin.controller.js
│   │   ├── directives/
│   │   │   └── seat.directive.js
│   │   ├── jquery-effects.js   # Micro-interactions & syllabus demo
│   │   └── charts.js           # D3.js SVG chart renderings
│   └── assets/
│       ├── images/
│       └── icons/
└── backend/                    # Server-side application
    ├── server.js               # Entry point listener
    ├── app.js                  # Express middleware & route mounting
    ├── config/
    │   ├── database.js         # MongoDB connection handler
    │   └── session.js          # Session store configuration
    ├── models/
    │   ├── User.js             # User schema (student / admin)
    │   ├── Floor.js            # Floor and zone schema
    │   ├── Seat.js             # Physical seat schema
    │   └── Booking.js          # Reservation and conflict rules
    ├── routes/
    │   ├── auth.routes.js      # Register, login, session, logout
    │   ├── floor.routes.js     # Floor catalog routes
    │   ├── seat.routes.js      # Seat queries with availability
    │   ├── booking.routes.js   # Booking creation & cancellation
    │   └── admin.routes.js     # Admin floor/seat CRUD & stats
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── seat.controller.js
    │   ├── booking.controller.js
    │   └── admin.controller.js
    ├── middleware/
    │   ├── requireAuth.js      # Session verification
    │   └── requireAdmin.js     # Admin role guard
    └── utils/
        └── bookingRules.js     # Time slot validation & overlap math
```

---

## 🚀 Getting Started (Mac Setup)

### 1. Prerequisites
- **Node.js**: v18+ or v20+ LTS (Tested on Node v26)
- **MongoDB**: Installed and running locally:
  ```bash
  # Check if MongoDB is running
  brew services list | grep mongodb
  # Or start it:
  brew services start mongodb-community
  ```

### 2. Installation
```bash
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default settings:
```ini
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/seatsync
SESSION_SECRET=seatsync_development_secret_key_2026
```

### 4. Running the Server
```bash
# Start server
npm start

# Or with Node watch mode (auto-reload on save)
npm run dev
```

### 5. Health Check Verification
Visit in browser or test via curl:
```bash
curl http://localhost:3000/api/health
```
Expected output:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "SeatSync Library Reservation API",
    "database": "connected"
  }
}
```

---

## 🗺️ Milestone Roadmap

| Milestone | Deliverable | Status |
|---|---|---|
| **M1 — Setup** | Project structure, package.json, Express server, MongoDB connection, health check | **COMPLETED** |
| **M2 — Design System** | Apple-inspired CSS tokens, typography, navigation, card components, responsive layout | *Next* |
| **M3 — Authentication** | Student registration, login/logout, sessions/cookies, role-based protection | Pending |
| **M4 — Library Data** | Floor & seat models, admin CRUD endpoints and views | Pending |
| **M5 — Seat Map** | AngularJS seat map interface, floor switcher, real-time availability legend | Pending |
| **M6 — Booking Engine** | Slot reservation, overlap conflict validation (HTTP 409), My Bookings & cancellation | Pending |
| **M7 — jQuery & D3.js** | jQuery micro-interactions + D3 SVG occupancy bar chart | Pending |
| **M8 — Polish & QA** | Responsive testing, error handling, loading states, accessibility | Pending |
| **M9 — Submission** | README, demo seed data, screenshots, viva report and syllabus evidence | Pending |
