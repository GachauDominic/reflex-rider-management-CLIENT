import { Outlet } from "react-router";
import { Navbar } from "./Navbar";
import { useDeliveryEvents } from "../hooks/useDeliveryEvents";

/**
 * Rendered once for the whole authenticated session (see routes.tsx —
 * this is the element for the RequireAuth-guarded parent route). The SSE
 * connection in useDeliveryEvents() lives here rather than per-page, so
 * navigating between pages doesn't tear down and reopen the stream.
 */
export function AppShell() {
  useDeliveryEvents();

  return (
    <div className="min-h-dvh bg-base-200">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
