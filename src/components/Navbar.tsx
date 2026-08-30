import { NavLink } from "react-router";
import { HiOutlineArrowRightOnRectangle } from "react-icons/hi2";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logout } from "../features/auth/authSlice";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-field px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? "bg-primary text-primary-content" : "text-base-content/70 hover:bg-base-200"
  }`;

export function Navbar() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  if (!user) return null;

  return (
    <header className="border-b border-base-300 bg-base-100">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <span className="font-display text-lg font-bold tracking-tight text-primary">Reflex</span>
          <nav className="flex items-center gap-1">
            <NavLink to="/deliveries" className={navLinkClass}>
              {user.role === "RETAILER" ? "My deliveries" : user.role === "RIDER" ? "My jobs" : "Deliveries"}
            </NavLink>
            {user.role === "RETAILER" && (
              <NavLink to="/deliveries/new" className={navLinkClass}>
                New delivery
              </NavLink>
            )}
            {user.role === "DISPATCHER" && (
              <NavLink to="/riders" className={navLinkClass}>
                Riders
              </NavLink>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right leading-tight">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="font-mono text-[11px] uppercase tracking-wide text-base-content/50">{user.role}</p>
          </div>
          <button
            type="button"
            onClick={() => dispatch(logout())}
            className="btn btn-ghost btn-sm btn-circle"
            aria-label="Log out"
            title="Log out"
          >
            <HiOutlineArrowRightOnRectangle className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
