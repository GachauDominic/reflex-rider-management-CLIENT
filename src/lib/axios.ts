import axios from "axios";

// A CORS request, not same-origin — this frontend and the Reflex
// backend run on different origins in dev (5173 vs 4000), and likely
// different origins in production too. The backend's own cors()
// middleware (CORS_ORIGIN env var) is what actually allows this; this
// client just needs the right baseURL and, per request, the right
// Authorization header — see api/baseQuery.ts for that part.
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
