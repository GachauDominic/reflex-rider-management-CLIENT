import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./baseQuery";
import type {
  AssignDeliveryRequest,
  CancelDeliveryRequest,
  ConfirmDeliveryRequest,
  CreateDeliveryRequest,
  Delivery,
  DeliveryStatus,
  DeliveryWithEvents,
  UpdateDeliveryStatusRequest,
} from "../types";

export const deliveriesApi = createApi({
  reducerPath: "deliveriesApi",
  baseQuery: axiosBaseQuery,
  tagTypes: ["Delivery"],
  endpoints: (builder) => ({
    // GET /api/deliveries — the backend filters this by role server-side:
    // RETAILER sees only their own, RIDER sees only what's assigned to
    // them, DISPATCHER sees everything. No client-side filtering needed
    // to enforce that; it's already scoped by the time it arrives.
    listDeliveries: builder.query<Delivery[], { status?: DeliveryStatus } | void>({
      query: (params) => ({ url: "/api/deliveries", method: "GET", params: params ?? undefined }),
      providesTags: (result) =>
        result
          ? [...result.map((d) => ({ type: "Delivery" as const, id: d.id })), { type: "Delivery" as const, id: "LIST" }]
          : [{ type: "Delivery" as const, id: "LIST" }],
    }),

    // GET /api/deliveries/:id — includes full event history.
    getDelivery: builder.query<DeliveryWithEvents, string>({
      query: (id) => ({ url: `/api/deliveries/${id}`, method: "GET" }),
      providesTags: (_result, _error, id) => [{ type: "Delivery", id }],
    }),

    // POST /api/deliveries — RETAILER only (enforced server-side by
    // authorize("RETAILER"); the UI also hides the "New delivery" action
    // from other roles, but the real boundary is the backend's).
    createDelivery: builder.mutation<Delivery, CreateDeliveryRequest>({
      query: (body) => ({ url: "/api/deliveries", method: "POST", data: body }),
      invalidatesTags: [{ type: "Delivery", id: "LIST" }],
    }),

    // PATCH /api/deliveries/:id/assign — DISPATCHER only.
    assignDelivery: builder.mutation<Delivery, { id: string } & AssignDeliveryRequest>({
      query: ({ id, ...body }) => ({ url: `/api/deliveries/${id}/assign`, method: "PATCH", data: body }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Delivery", id }, { type: "Delivery", id: "LIST" }],
    }),

    // PATCH /api/deliveries/:id/status — RIDER only, and only accepts
    // PICKED_UP or IN_TRANSIT (DELIVERED must go through confirmDelivery
    // below — the backend rejects it here on purpose, see
    // delivery.service.ts updateDeliveryStatus).
    updateDeliveryStatus: builder.mutation<Delivery, { id: string } & UpdateDeliveryStatusRequest>({
      query: ({ id, ...body }) => ({ url: `/api/deliveries/${id}/status`, method: "PATCH", data: body }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Delivery", id }, { type: "Delivery", id: "LIST" }],
    }),

    // PATCH /api/deliveries/:id/cancel — RETAILER, DISPATCHER, or the
    // assigned RIDER; the backend re-checks ownership regardless of who
    // the UI lets click the button.
    cancelDelivery: builder.mutation<Delivery, { id: string } & CancelDeliveryRequest>({
      query: ({ id, ...body }) => ({ url: `/api/deliveries/${id}/cancel`, method: "PATCH", data: body }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Delivery", id }, { type: "Delivery", id: "LIST" }],
    }),

    // POST /api/deliveries/:id/confirm — RIDER only. This is the QR
    // scan / manual-code-entry endpoint; it's the only path that can
    // move a delivery to DELIVERED.
    confirmDelivery: builder.mutation<Delivery, { id: string } & ConfirmDeliveryRequest>({
      query: ({ id, ...body }) => ({ url: `/api/deliveries/${id}/confirm`, method: "POST", data: body }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Delivery", id }, { type: "Delivery", id: "LIST" }],
    }),
  }),
});

export const {
  useListDeliveriesQuery,
  useGetDeliveryQuery,
  useCreateDeliveryMutation,
  useAssignDeliveryMutation,
  useUpdateDeliveryStatusMutation,
  useCancelDeliveryMutation,
  useConfirmDeliveryMutation,
} = deliveriesApi;
