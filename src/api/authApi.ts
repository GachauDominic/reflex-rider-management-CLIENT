import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./baseQuery";
import type { LoginResponse, MeResponse } from "../types";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    // POST /api/auth/login — the one endpoint with no Authorization
    // header required (loginRateLimit is the only middleware in front
    // of it on the backend).
    login: builder.mutation<LoginResponse, { email: string; password: string }>({
      query: (body) => ({ url: "/api/auth/login", method: "POST", data: body }),
    }),
    // GET /api/auth/me — requires a valid Bearer token.
    getMe: builder.query<MeResponse, void>({
      query: () => ({ url: "/api/auth/me", method: "GET" }),
    }),
  }),
});

export const { useLoginMutation, useGetMeQuery, useLazyGetMeQuery } = authApi;
