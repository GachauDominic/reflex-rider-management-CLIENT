import { Link, useParams } from "react-router";
import { HiOutlineArrowLeft, HiOutlinePhone, HiOutlineMapPin, HiOutlineCube } from "react-icons/hi2";
import { useGetDeliveryQuery } from "../api/deliveriesApi";
import { StatusFlowRail } from "../components/StatusFlowRail";
import { ConfirmationQr } from "../components/ConfirmationQr";
import { DeliveryActions } from "../components/DeliveryActions";
import { LoadingState, ErrorAlert, getErrorMessage } from "../components/Feedback";
import { formatDateTime, formatStatusLabel } from "../lib/format";
import { useAppSelector } from "../app/hooks";

export default function DeliveryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAppSelector((state) => state.auth.user);
  const { data: delivery, isLoading, error } = useGetDeliveryQuery(id ?? "", { skip: !id });

  if (isLoading) return <LoadingState label="Loading delivery…" />;
  if (error) return <ErrorAlert message={getErrorMessage(error, "Could not load this delivery")} />;
  if (!delivery) return null;

  // A retailer/dispatcher gets real value from seeing the code to hand
  // off or display; a rider mid-route generally doesn't need to see the
  // answer to what they're about to scan, so it's hidden for that role
  // once a delivery is actively in their hands (pure UX choice — the
  // backend doesn't restrict who can read the code, since it isn't a
  // security boundary either way).
  const showQr = delivery.status !== "DELIVERED" && delivery.status !== "CANCELLED" && user?.role !== "RIDER";

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/deliveries" className="mb-4 inline-flex items-center gap-1 text-sm text-base-content/60 hover:underline">
        <HiOutlineArrowLeft className="h-4 w-4" /> Back to deliveries
      </Link>

      <div className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-xl font-bold">{delivery.customerName}</h1>
              <p className="font-mono text-xs text-base-content/60">{delivery.confirmationCode}</p>
            </div>
            <StatusFlowRail status={delivery.status} />
          </div>

          <dl className="grid gap-2 text-sm">
            <div className="flex items-center gap-2">
              <HiOutlinePhone className="text-base-content/40" aria-hidden />
              <dd className="font-mono">{delivery.customerPhone}</dd>
            </div>
            <div className="flex items-center gap-2">
              <HiOutlineMapPin className="text-base-content/40" aria-hidden />
              <dd>{delivery.address}</dd>
            </div>
            <div className="flex items-center gap-2">
              <HiOutlineCube className="text-base-content/40" aria-hidden />
              <dd>{delivery.itemDescription}</dd>
            </div>
          </dl>

          {showQr && <ConfirmationQr code={delivery.confirmationCode} />}

          <DeliveryActions delivery={delivery} />
        </div>
      </div>

      <h2 className="mb-3 mt-6 font-display text-sm font-semibold uppercase tracking-wide text-base-content/60">
        History
      </h2>
      <ol className="flex flex-col gap-3 border-l border-base-300 pl-4">
        {delivery.events.map((event) => (
          <li key={event.id} className="relative">
            <span
              className="absolute -left-[1.15rem] top-1.5 h-2 w-2 rounded-full bg-primary"
              aria-hidden
            />
            <p className="text-sm font-medium">{formatStatusLabel(event.status)}</p>
            {event.note && <p className="text-sm text-base-content/70">{event.note}</p>}
            <p className="font-mono text-xs text-base-content/50">{formatDateTime(event.timestamp)}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
