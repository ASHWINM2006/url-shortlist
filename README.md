# TinyHop — URL Shortener with Analytics

A full-stack URL shortener with real-time analytics, QR codes, custom aliases, and a beautiful dark dashboard.

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + Recharts
- **Backend**: Node.js + Express
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT + bcryptjs

## Features

### Core
- User signup/login with JWT authentication
- Create short URLs with unique codes
- Custom aliases (e.g. `/my-link`)
- Server-side redirect handling
- URL validation (http/https only)
- Delete and edit links
- Link expiry dates
- Enable/disable links

### Analytics
- Total click count per URL
- Daily click trend chart (30 days)
- Browser, OS, and device breakdown
- Recent visit history with timestamps
- Dashboard overview with all-time stats

### Bonus
- QR code generation + download
- Password strength indicator
- Responsive dark UI
- Rate limiting on API
- Pagination + search

## Setup

### Prerequisites
- Node.js v18+
- MongoDB running locally (or MongoDB Atlas URI)

### 1. Backend

```bash
cd backend
npm install
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables (backend/.env)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/urlshortener
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
```

## Running

- Backend: http://localhost:5000
- Frontend: http://localhost:5173

Short URLs redirect via: `http://localhost:5000/:shortCode`
