# North Luxe

North Luxe is a full-stack travel platform for Northern Pakistan tours with:
- A public website (tours, destinations, booking flow, blogs, contact)
- A custom booking/request flow
- An admin dashboard for CMS-style management (tours, blogs, bookings, contacts, settings, users)

This repository contains both frontend and backend applications.

## Tech Stack

- Frontend: React, Vite, React Router, Tailwind CSS, React Query, Axios
- Backend: Node.js, Express, MongoDB (Mongoose), JWT auth, Nodemailer, Stripe hooks

## Repository Structure

```text
NorthLuxe/
  Frontend/   # React + Vite app
  backend/    # Express + MongoDB API
```

## Prerequisites

- Node.js 18+ (recommended latest LTS)
- npm 9+
- MongoDB (local or remote connection string)

## Environment Variables

### Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env` and fill values:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/north-luxe
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=change-me
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@northluxe.com
ADMIN_PASSWORD=Admin@123
EMAIL_FROM=no-reply@northluxe.com
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
```

### Frontend (`Frontend/.env`)
Copy `Frontend/.env.example` to `Frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Local Development

Run backend and frontend in separate terminals.

### 1) Backend

```bash
cd backend
npm install
npm run seed
npm run dev
```

Backend scripts:
- `npm run dev` - start API with nodemon
- `npm start` - start API in normal mode
- `npm run seed` - seed initial data

### 2) Frontend

```bash
cd Frontend
npm install
npm run dev
```

Frontend scripts:
- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run preview` - preview production build
- `npm run lint` - run ESLint

## App URLs (Default)

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

## Main Functional Areas

- Public:
  - Home, tours listing, tour details
  - Destinations and destination details
  - Standard booking and custom plan request
  - Blog and contact
- Admin:
  - Dashboard overview
  - Tours/blogs/gallery/testimonials CRUD
  - Booking and contact management
  - Site settings and user management

## Notes

- If SMTP variables are not configured, email functionality falls back to safe local behavior (console preview/logging).
- Ensure `CLIENT_ORIGIN` (backend) matches your frontend dev URL.
- If API calls fail from frontend, verify `VITE_API_URL` and backend port.

## Additional Documentation

- Backend details: [backend/README.md](backend/README.md)
- Frontend scaffold notes: [Frontend/README.md](Frontend/README.md)
