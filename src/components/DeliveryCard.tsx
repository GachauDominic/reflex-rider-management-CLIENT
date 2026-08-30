import { Link } from "react-router";
import { HiOutlinePhone, HiOutlineMapPin, HiOutlineCube } from "react-icons/hi2";
import type { Delivery } from "../types";
import { StatusFlowRail } from "./StatusFlowRail";
import { formatDateTime } from "../lib/format";

export function DeliveryCard({ delivery, actions }: { delivery: Delivery; actions?: React.ReactNode }) {
  return (
    <div className="card border border-base-300 bg-base-100 shadow-sm transition-shadow hover:shadow-md">
      <div className="card-body gap-3 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link to={`/deliveries/${delivery.id}`} className="font-display text-lg font-semibold hover:underline">
              {delivery.customerName}
            </Link>
            <p className="font-mono text-xs text-base-content/60">{delivery.confirmationCode}</p>
          </div>
          <StatusFlowRail status={delivery.status} />
        </div>

        <dl className="grid gap-1.5 text-sm text-base-content/80">
          <div className="flex items-center gap-2">
            <HiOutlinePhone className="shrink-0 text-base-content/40" aria-hidden />
            <dd className="font-mono">{delivery.customerPhone}</dd>
          </div>
          <div className="flex items-center gap-2">
            <HiOutlineMapPin className="shrink-0 text-base-content/40" aria-hidden />
            <dd>{delivery.address}</dd>
          </div>
          <div className="flex items-center gap-2">
            <HiOutlineCube className="shrink-0 text-base-content/40" aria-hidden />
            <dd>{delivery.itemDescription}</dd>
          </div>
        </dl>

        <p className="text-xs text-base-content/50">Created {formatDateTime(delivery.createdAt)}</p>

        {actions && <div className="card-actions mt-1 justify-end">{actions}</div>}
      </div>
    </div>
  );
}
