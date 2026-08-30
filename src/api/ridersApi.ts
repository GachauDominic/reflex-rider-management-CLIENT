import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./baseQuery";
import type { Delivery, RiderSummary } from "../types";

export const ridersApi = createApi({
  reducerPath: "ridersApi",
  baseQuery: axiosBaseQuery,
  tagTypes: ["Rider", "RiderDeliveries"],
  endpoints: (builder) => ({
    // GET /api/riders — DISPATCHER only. Response is a narrow projection
    // (id, name, email, phone) per rider.service.ts, not a full User row.
    listRiders: builder.query<RiderSummary[], void>({
      query: () => ({ url: "/api/riders", method: "GET" }),
      providesTags: [{ type: "Rider", id: "LIST" }],
    }),

    // GET /api/riders/:id/deliveries — DISPATCHER (any rider) or RIDER
    // (their own id only; the backend 403s a rider requesting someone
    // else's).
    getRiderDeliveries: builder.query<Delivery[], string>({
      query: (riderId) => ({ url: `/api/riders/${riderId}/deliveries`, method: "GET" }),
      providesTags: (_result, _error, riderId) => [{ type: "RiderDeliveries", id: riderId }],
    }),
  }),
});

export const { useListRidersQuery, useGetRiderDeliveriesQuery } = ridersApi;
