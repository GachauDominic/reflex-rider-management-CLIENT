import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-base-200 px-4 text-center">
      <p className="font-mono text-sm text-base-content/50">404</p>
      <h1 className="font-display text-xl font-bold">Nothing here</h1>
      <p className="text-sm text-base-content/60">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary btn-sm mt-2">
        Back to Reflex
      </Link>
    </div>
  );
}
