import { DELIVERY_STATUS_FLOW, type DeliveryStatus } from "../types";

export const STATUS_META: Record<DeliveryStatus, { label: string; color: string }> = {
  OPEN: { label: "Open", color: "var(--color-status-open)" },
  ASSIGNED: { label: "Assigned", color: "var(--color-status-assigned)" },
  PICKED_UP: { label: "Picked up", color: "var(--color-status-pickedup)" },
  IN_TRANSIT: { label: "In transit", color: "var(--color-status-intransit)" },
  DELIVERED: { label: "Delivered", color: "var(--color-status-delivered)" },
  CANCELLED: { label: "Cancelled", color: "var(--color-status-cancelled)" },
};

/**
 * Renders a delivery's position in the real backend state machine
 * (VALID_TRANSITIONS in stateMachine.ts) as a horizontal rail of five
 * steps. Completed and current steps are filled in that step's own
 * color; future steps stay outlined. CANCELLED is a terminal branch
 * reachable from any non-terminal step, so it renders as its own
 * distinct marker rather than pretending to be a sixth step on the
 * line — matching how the backend actually models it.
 */
export function StatusFlowRail({ status }: { status: DeliveryStatus }) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-2" role="img" aria-label="Delivery cancelled">
        <span
          className="inline-block h-2.5 w-2.5 rotate-45 rounded-[2px]"
          style={{ backgroundColor: STATUS_META.CANCELLED.color }}
        />
        <span className="font-mono text-xs uppercase tracking-wide text-error">Cancelled</span>
      </div>
    );
  }

  const currentIndex = DELIVERY_STATUS_FLOW.indexOf(status);

  return (
    <div
      className="flex items-center"
      role="img"
      aria-label={`Delivery status: ${STATUS_META[status].label}, step ${currentIndex + 1} of ${DELIVERY_STATUS_FLOW.length}`}
    >
      {DELIVERY_STATUS_FLOW.map((step, index) => {
        const isReached = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const meta = STATUS_META[step];

        return (
          <div key={step} className="flex items-center">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${isCurrent ? "ring-2 ring-offset-2 ring-offset-base-100" : ""}`}
              style={{
                backgroundColor: isReached ? meta.color : "var(--color-base-300)",
                ...(isCurrent ? ({ "--tw-ring-color": meta.color } as React.CSSProperties) : {}),
              }}
              title={meta.label}
            />
            {index < DELIVERY_STATUS_FLOW.length - 1 && (
              <span
                className="h-px w-6 sm:w-8"
                style={{ backgroundColor: index < currentIndex ? meta.color : "var(--color-base-300)" }}
              />
            )}
          </div>
        );
      })}
      <span className="ml-3 font-mono text-xs uppercase tracking-wide" style={{ color: STATUS_META[status].color }}>
        {STATUS_META[status].label}
      </span>
    </div>
  );
}
