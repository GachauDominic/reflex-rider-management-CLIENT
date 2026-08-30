import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Port is pinned (not left to Vite's default-with-fallback behavior)
// because the backend's CORS_ORIGIN must match this exactly — the
// backend only allows the single origin configured in its own .env,
// so if this ever silently shifts to 5174 because 5173 was busy, every
// request would fail as a CORS error rather than an auth error.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
  },
});
