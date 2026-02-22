# North Luxe MERN Backend

## MongoDB Schema Design

- `User`: admin/editor identity, auth hash, role and status.
- `Tour`: title, slug, pricing, image gallery, availability, status, featured flags.
- `Booking`: customer details, linked `tour`, payment + booking state, admin notes.
- `Testimonial`: guest feedback cards for the website testimonials section.
- `Blog`: category, content, cover media, publish state, slug, analytics fields.
- `GalleryItem`: reusable media assets by category.
- `ContactMessage`: website inquiries, urgency, status, and admin replies.
- `SiteSetting`: global site/CMS settings consumed by both admin and public UI.
- `Notification`: dashboard activity stream (bookings/system events).

## API Structure (Express)

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/tours/public`
- `GET /api/tours/:slug/public`
- `GET/POST/PATCH/DELETE /api/tours` (admin)
- `GET /api/blogs/public`
- `GET /api/blogs/:slug/public`
- `GET/POST/PATCH/DELETE /api/blogs` (admin)
- `POST /api/bookings/public` (website booking capture)
- `GET/PATCH/DELETE /api/bookings` (admin management)
- `POST /api/payments/intent` (payment hook endpoint)
- `GET /api/gallery/public`
- `GET/POST/PATCH/DELETE /api/gallery` (admin management)
- `POST /api/contacts/public`
- `GET/PATCH/POST(:id/reply)/DELETE /api/contacts` (admin inbox)
- `GET /api/settings/public`
- `GET/PATCH /api/settings` (admin CMS settings)
- `GET/PATCH/DELETE /api/notifications`
- `GET /api/dashboard/overview`
- `GET /api/testimonials/public`
- `GET/POST/PATCH/DELETE /api/testimonials` (admin-ready)
- `GET/POST/PATCH/DELETE /api/users` (admin role required)

## Local Setup

1. Copy `.env.example` to `.env`.
2. Install backend deps: `npm install` in `backend/`.
3. Seed data: `npm run seed` in `backend/`.
4. Start API: `npm run dev` in `backend/`.
5. In frontend root, set `VITE_API_URL=http://localhost:5000/api` in `.env`.

## Booking Confirmation Email

- On successful `POST /api/bookings/public`, the backend sends a confirmation email.
- If SMTP env vars are missing, backend logs an email preview to console (safe fallback for local dev).
