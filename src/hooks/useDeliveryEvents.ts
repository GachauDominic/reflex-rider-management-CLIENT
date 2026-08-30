import { useEffect } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { deliveriesApi } from "../api/deliveriesApi";
import { ridersApi } from "../api/ridersApi";
import type { RealtimeEvent, DeliveryEventType } from "../types";

// GET /api/events is Server-Sent Events, not a websocket, and the
// backend sends each event under its own named event type (event:
// DELIVERY_ASSIGNED, etc — see routes/events.routes.ts) rather than the
// generic "message" event. EventSource's default onmessage only fires
// for unnamed events, so each type needs its own addEventListener.
const EVENT_TYPES: DeliveryEventType[] = [
  "DELIVERY_CREATED",
  "DELIVERY_ASSIGNED",
  "DELIVERY_STATUS_UPDATED",
  "DELIVERY_DELIVERED",
  "DELIVERY_CANCELLED",
];

const TOAST_COPY: Record<DeliveryEventType, (d: RealtimeEvent["delivery"]) => string> = {
  DELIVERY_CREATED: (d) => `New delivery request for ${d.customerName}`,
  DELIVERY_ASSIGNED: (d) => `Delivery for ${d.customerName} was assigned to a rider`,
  DELIVERY_STATUS_UPDATED: (d) => `Delivery for ${d.customerName} is now ${d.status.replace("_", " ").toLowerCase()}`,
  DELIVERY_DELIVERED: (d) => `Delivered to ${d.customerName}`,
  DELIVERY_CANCELLED: (d) => `Delivery for ${d.customerName} was cancelled`,
};

/**
 * Opens one SSE connection for the lifetime of an authenticated session
 * and keeps RTK Query's delivery cache fresh as events arrive — mount
 * this once, high in the authenticated part of the tree (see
 * components/AppShell.tsx), not per-page.
 */
export function useDeliveryEvents() {
  const token = useAppSelector((state) => state.auth.token);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!token) return;

    // EventSource can't set custom headers, which is exactly why the
    // backend's SSE route uses authenticateFlexible to also accept the
    // token as a query param — see middleware/auth.ts.
    const url = `${import.meta.env.VITE_API_URL}/api/events?token=${encodeURIComponent(token)}`;
    const source = new EventSource(url);

    const handleEvent = (raw: MessageEvent<string>) => {
      const event: RealtimeEvent = JSON.parse(raw.data);

      dispatch(
        deliveriesApi.util.invalidateTags([
          { type: "Delivery", id: "LIST" },
          { type: "Delivery", id: event.delivery.id },
        ])
      );
      if (event.delivery.riderId) {
        dispatch(ridersApi.util.invalidateTags([{ type: "RiderDeliveries", id: event.delivery.riderId }]));
      }

      toast(TOAST_COPY[event.type](event.delivery));
    };

    for (const type of EVENT_TYPES) {
      source.addEventListener(type, handleEvent);
    }

    // Connection errors are expected and self-healing: the browser
    // retries automatically using the backend's `retry: 3000` directive.
    // Nothing to surface to the user unless it never recovers, which
    // isn't distinguishable from here — so this stays silent on purpose.
    source.onerror = () => {};

    return () => {
      for (const type of EVENT_TYPES) {
        source.removeEventListener(type, handleEvent);
      }
      source.close();
    };
  }, [token, dispatch]);
}
