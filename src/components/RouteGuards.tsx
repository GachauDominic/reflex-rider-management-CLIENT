import { Navigate, Outlet, useLocation } from "react-router";
import { useAppSelector } from "../app/hooks";
import type { UserRole } from "../types";

/**
 * Mirrors the backend's authenticate() middleware: no valid session,
 * no access, full stop. This is a UX convenience only — every protected
 * endpoint re-checks the real JWT server-side regardless of what this
 * component decides.
 */
export function RequireAuth() {
  const token = useAppSelector((state) => state.auth.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

/**
 * Mirrors the backend's authorize(...roles) middleware. Must render
 * inside a RequireAuth-guarded route, same ordering as the backend's
 * middleware chain (authenticate, then authorize).
 */
export function RequireRole({ roles }: { roles: UserRole[] }) {
  const user = useAppSelector((state) => state.auth.user);

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
