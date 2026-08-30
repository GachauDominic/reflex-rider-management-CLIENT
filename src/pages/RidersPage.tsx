import { Link } from "react-router";
import { HiOutlinePhone, HiOutlineEnvelope } from "react-icons/hi2";
import { useListRidersQuery } from "../api/ridersApi";
import { LoadingState, ErrorAlert, EmptyState, getErrorMessage } from "../components/Feedback";

export default function RidersPage() {
  const { data: riders, isLoading, error } = useListRidersQuery();

  return (
    <div>
      <h1 className="mb-5 font-display text-xl font-bold">Riders</h1>

      {isLoading && <LoadingState label="Loading riders…" />}
      {error && <ErrorAlert message={getErrorMessage(error, "Could not load riders")} />}
      {riders && riders.length === 0 && (
        <EmptyState title="No riders yet" hint="Riders show up here once they're registered." />
      )}

      {riders && riders.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {riders.map((rider) => (
            <Link
              key={rider.id}
              to={`/riders/${rider.id}`}
              className="card border border-base-300 bg-base-100 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="card-body gap-1 p-5">
                <p className="font-display font-semibold">{rider.name}</p>
                <div className="flex items-center gap-2 text-sm text-base-content/70">
                  <HiOutlineEnvelope className="text-base-content/40" aria-hidden />
                  {rider.email}
                </div>
                {rider.phone && (
                  <div className="flex items-center gap-2 font-mono text-sm text-base-content/70">
                    <HiOutlinePhone className="text-base-content/40" aria-hidden />
                    {rider.phone}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
