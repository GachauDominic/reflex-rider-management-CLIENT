# Reflex Frontend

React + TypeScript frontend for the Reflex delivery-coordination backend. Talks to the real
Reflex API over REST + Server-Sent Events — no mocking, no separate backend-for-frontend layer.

## Stack

- **Build:** Vite 8, React 19, TypeScript
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`) + daisyUI v5, custom `reflex` theme
- **Routing:** React Router (declarative `<Routes>`/`<Route>`, nested `<Outlet>` guards)
- **State / data:** Redux Toolkit + RTK Query (axios-backed `baseQuery`), `redux-persist`
- **Forms:** react-hook-form + yup, validation rules mirrored exactly from the backend
- **Real-time:** native `EventSource` (SSE), no extra dependency
- **QR:** `qrcode.react` (generate) + `html5-qrcode` (scan), with a manual-entry fallback always available
- **Testing:** Cypress, stubbing the API via `cy.intercept()`

## Getting started

```bash
pnpm install
cp .env.local .env      # set VITE_API_URL to your running Reflex backend
pnpm dev
```

Runs on **http://localhost:5173** (pinned via `strictPort` in `vite.config.ts` — see below for why).

## Pairing with the backend

This is a genuinely separate app calling the real backend over HTTP — there is no proxy, no
shared build step, no mock server in dev or production.

1. **Run the backend first** (`npm run dev` in the Reflex backend repo, default `http://localhost:3000`).
2. **CORS must match exactly.** The backend's `.env` has:
   ```
   CORS_ORIGIN=http://localhost:5173
   ```
   If this frontend's dev server ever starts on a different port (5173 was busy), every
   request fails as a **CORS error**, not an auth error — confusing to debug blind. That's why
   `vite.config.ts` sets `server: { port: 5173, strictPort: true }`: it fails to start rather
   than silently drifting to 5174.
3. **`VITE_API_URL`** in this project's `.env` points at the backend's base URL. Nothing is
   hardcoded — `src/lib/axios.ts` reads it via `import.meta.env.VITE_API_URL`.

## How changes reflect in both directions

This was the core requirement for this build, so it's worth being explicit about the two
mechanisms that make it work together:

1. **RTK Query cache invalidation** — every mutation (`assignDelivery`, `updateDeliveryStatus`,
   `confirmDelivery`, `cancelDelivery`, `createDelivery`) declares `invalidatesTags`. The
   component that fired the mutation refetches automatically. This covers "my own action
   updates my own screen."

2. **Server-Sent Events** (`src/hooks/useDeliveryEvents.ts`) — the backend's `GET /api/events`
   pushes a named event (`DELIVERY_CREATED`, `DELIVERY_ASSIGNED`, `DELIVERY_STATUS_UPDATED`,
   `DELIVERY_DELIVERED`, `DELIVERY_CANCELLED`) to every connected client whenever *anyone*
   changes a delivery. The hook listens for all five, and calls the same
   `deliveriesApi.util.invalidateTags(...)` the mutations use. This covers "someone else's
   action updates my screen" — a dispatcher assigning a rider shows up on the retailer's
   already-open detail page with no refresh, because the backend already scopes which events
   reach which connection (dispatcher gets everything, a retailer only their own deliveries, a
   rider only what's assigned to them — see the backend's `events.routes.ts`).

Both paths funnel through the same RTK Query tag system, so there's exactly one cache to reason
about, not two.

One deliberate quirk carried over from the backend: `EventSource` can't set custom headers, so
the SSE connection authenticates via `?token=` in the URL instead of an `Authorization` header
(`authenticateFlexible` on the backend). This is why the token has to live somewhere JS can read
it back out of (`redux-persist` → `localStorage`), not in an httpOnly cookie.

## Project structure

```
src/
  types/           Mirrors backend src/types/index.ts and db/schema.ts field-for-field
  lib/
    axios.ts        Configured axios instance (baseURL only — auth header is per-request)
    validation.ts   yup schemas mirroring backend validation.ts / confirmationCode.ts exactly
    format.ts       Date/status label formatting
  api/               RTK Query slices — one per backend resource (auth, deliveries, riders)
    baseQuery.ts     Axios-backed baseQuery: attaches Bearer token, auto-logs out on 401
  app/
    store.ts         Redux store, persistence config, RTK Query middleware wiring
    hooks.ts         Typed useAppDispatch / useAppSelector
  features/auth/     authSlice — token + user, the only slice persisted to localStorage
  hooks/
    useDeliveryEvents.ts   The SSE listener (see above)
  components/        Reusable UI: StatusFlowRail (signature status visualization),
                     DeliveryCard, DeliveryActions (role/status-aware action buttons),
                     Assign/Confirm/Cancel modals, QrScanner, RouteGuards, AppShell, Navbar
  pages/             One page per route; DeliveriesPage adapts its own content per role
                     rather than having three near-duplicate list pages, since the backend
                     already scopes GET /api/deliveries by role server-side
  routes.tsx         Route tree, nesting RequireAuth → AppShell → RequireRole per page
```

## Design notes

The one deliberate visual signature is `StatusFlowRail` — a horizontal line-and-dot rail
showing a delivery's real position in the backend's state machine (`OPEN → ASSIGNED →
PICKED_UP → IN_TRANSIT → DELIVERED`), used everywhere a delivery appears rather than a plain
status badge. `CANCELLED` renders as a distinct broken marker rather than a sixth step, since
it's a branch off any non-terminal status in the backend's model, not a forward step. The
palette and type system are documented directly in `src/index.css`.

## Testing

```bash
pnpm cypress:open   # interactive
pnpm cypress:run    # headless
```

Every spec stubs the backend with `cy.intercept()` — **no running backend or database needed
to run these**, matching the same "hermetic tests" principle used on the backend's mocked
integration suite. `cypress/e2e/`:

- `login.cy.ts` — successful login + the backend's exact error message on bad credentials
- `role-gating.cy.ts` — each `RequireRole` boundary, and the unauthenticated → `/login` redirect
- `delivery-lifecycle.cy.ts` — retailer creates a delivery, client-side phone validation blocks
  a bad number before any API call, and a rider confirms a delivery via **manual code entry**

That last one is deliberate: camera-based QR scanning isn't realistically automatable in CI, so
the confirm flow is tested through the same manual-entry fallback `QrScanner` is designed to
degrade to on camera failure — which also means that fallback path is never allowed to bit-rot
<<<<<<< HEAD
unnoticed.
=======
unnoticed.
>>>>>>> 83ca16380e5c96115bcd2ff992a245d1bbb9ad04
