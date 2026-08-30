export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-base-content/60">
      <span className="loading loading-spinner loading-md" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

/**
 * Every Reflex error response is { error: string } (errorHandler.ts).
 * RTK Query's baseQuery (see api/baseQuery.ts) already normalizes
 * whatever axios throws into { status, message }, so this component
 * only ever needs to read `.data.message` off a query/mutation's error.
 */
export function ErrorAlert({ message }: { message: string }) {
  return (
    <div role="alert" className="alert alert-error">
      <span>{message}</span>
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-box border border-dashed border-base-300 py-16 text-center">
      <p className="font-display text-base font-semibold">{title}</p>
      {hint && <p className="mt-1 text-sm text-base-content/60">{hint}</p>}
    </div>
  );
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error && typeof error === "object" && "data" in error) {
    const data = (error as { data?: { message?: string } }).data;
    if (data?.message) return data.message;
  }
  return fallback;
}
