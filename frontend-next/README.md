# North Luxe — Next.js frontend

This application is the Next.js App Router migration of the original Vite frontend in `../Frontend`. The original frontend remains available as the migration baseline.

## Local development

Requirements: Node.js 20.9 or newer and the existing backend service.

```powershell
Copy-Item .env.example .env.local
npm run dev
```

The frontend runs at `http://localhost:3000`. Browser requests use the same-origin `/api` Route Handler proxy. By default, that proxy targets the deployed Express backend. For local API development, set `API_PROXY_TARGET=http://localhost:5000/api` in `.env.local` and run the backend separately from `../backend`.

## Environment variables

- `NEXT_PUBLIC_API_URL`: Browser-facing API base URL. Keep it as `/api` for the same-origin proxy.
- `API_PROXY_TARGET`: Server-only Express API target, including `/api`.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key used by the booking flow.

Only variables prefixed with `NEXT_PUBLIC_` are exposed to browser code.

## Validation

```powershell
npm run lint
npm run build
```

The App Router filesystem under `src/app` preserves all public, dynamic, payment, authentication, and admin URLs from the original application. Shared UI lives under `src/components`, page-level client views under `src/views`, and the temporary navigation compatibility layer under `src/lib/router.jsx`.

The Express/MongoDB backend remains separate during the compatibility phase. This keeps authentication, payments, email, database models, webhooks, and business logic stable while the frontend is validated.
