// Mirrors src/types/index.ts and src/db/schema.ts in the Reflex backend.
// Keep these in lockstep with the backend by hand for now; if this ever
// becomes a pnpm workspace alongside the backend, this file is the one
// to replace with a shared package.

export type UserRole = "RETAILER" | "DISPATCHER" | "RIDER";

export type DeliveryStatus =
  | "OPEN"
  | "ASSIGNED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED";

// The order the backend's state machine actually allows forward
// movement through (VALID_TRANSITIONS in stateMachine.ts). CANCELLED is
// reachable from any non-terminal status, not a "next" step in the rail.
export const DELIVERY_STATUS_FLOW: DeliveryStatus[] = [
  "OPEN",
  "ASSIGNED",
  "PICKED_UP",
  "IN_TRANSIT",
  "DELIVERED",
];

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  createdAt: string;
}

// GET /api/riders returns a narrower projection than the full User row
// (see rider.service.ts listAllRiders — it selects only these four
// columns). Typing it as User[] would let code read .role/.createdAt
// without a compile error even though neither exists on the response.
export interface RiderSummary {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export interface Delivery {
  id: string;
  retailerId: string;
  riderId: string | null;
  customerName: string;
  customerPhone: string;
  address: string;
  itemDescription: string;
  status: DeliveryStatus;
  confirmationCode: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt: string | null;
}

export interface DeliveryEvent {
  id: string;
  deliveryId: string;
  actorId: string | null;
  status: DeliveryStatus;
  note: string | null;
  timestamp: string;
}

export interface DeliveryWithEvents extends Delivery {
  events: DeliveryEvent[];
}

// ---------- Auth ----------

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

export interface MeResponse extends User {}

// ---------- Requests ----------

export interface CreateDeliveryRequest {
  customerName: string;
  customerPhone: string;
  address: string;
  itemDescription: string;
}

export interface AssignDeliveryRequest {
  riderId: string;
}

export interface UpdateDeliveryStatusRequest {
  status: Extract<DeliveryStatus, "PICKED_UP" | "IN_TRANSIT">;
  note?: string;
}

export interface CancelDeliveryRequest {
  note?: string;
}

export interface ConfirmDeliveryRequest {
  confirmationCode: string;
}

// ---------- Errors ----------
// Every error the backend returns is { error: string } — errorHandler.ts.
export interface ApiErrorBody {
  error: string;
}

// ---------- Real-time (SSE) ----------
// Mirrors utils/eventBus.ts's RealtimeEvent.
export type DeliveryEventType =
  | "DELIVERY_CREATED"
  | "DELIVERY_ASSIGNED"
  | "DELIVERY_STATUS_UPDATED"
  | "DELIVERY_DELIVERED"
  | "DELIVERY_CANCELLED";

export interface RealtimeEvent {
  type: DeliveryEventType;
  delivery: Delivery;
  timestamp: string;
}
