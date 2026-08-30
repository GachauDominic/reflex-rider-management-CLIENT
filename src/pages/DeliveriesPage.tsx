import { Link } from "react-router";
import { useState } from "react";
import { useListDeliveriesQuery } from "../api/deliveriesApi";
import { useAppSelector } from "../app/hooks";
import { DeliveryCard } from "../components/DeliveryCard";
import { DeliveryActions } from "../components/DeliveryActions";
import { LoadingState, ErrorAlert, EmptyState, getErrorMessage } from "../components/Feedback";
import type { DeliveryStatus } from "../types";

const DISPATCHER_FILTERS: { label: string; value: DeliveryStatus | "" }[] = [
  { label: "All", value: "" },
  { label: "Open", value: "OPEN" },
  { label: "Assigned", value: "ASSIGNED" },
  { label: "Picked up", value: "PICKED_UP" },
  { label: "In transit", value: "IN_TRANSIT" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function DeliveriesPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | "">("");

  const { data: deliveries, isLoading, error } = useListDeliveriesQuery(
    statusFilter ? { status: statusFilter } : undefined
  );

  const heading =
    user?.role === "RETAILER" ? "My deliveries" : user?.role === "RIDER" ? "My jobs" : "All deliveries";

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h1 className="font-display text-xl font-bold">{heading}</h1>
        {user?.role === "RETAILER" && (
          <Link to="/deliveries/new" className="btn btn-primary btn-sm">
            New delivery
          </Link>
        )}
      </div>

      {user?.role === "DISPATCHER" && (
        <div className="mb-4 flex flex-wrap gap-2">
          {DISPATCHER_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={`btn btn-sm ${statusFilter === filter.value ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}

      {isLoading && <LoadingState label="Loading deliveries…" />}
      {error && <ErrorAlert message={getErrorMessage(error, "Could not load deliveries")} />}

      {deliveries && deliveries.length === 0 && (
        <EmptyState
          title="Nothing here yet"
          hint={
            user?.role === "RETAILER"
              ? "Create your first delivery request to get started."
              : user?.role === "RIDER"
                ? "You'll see jobs here once a dispatcher assigns one to you."
                : "No deliveries match this filter."
          }
        />
      )}

      {deliveries && deliveries.length > 0 && (
        <div className="flex flex-col gap-3">
          {deliveries.map((delivery) => (
            <DeliveryCard key={delivery.id} delivery={delivery} actions={<DeliveryActions delivery={delivery} />} />
          ))}
        </div>
      )}
    </div>
  );
}
