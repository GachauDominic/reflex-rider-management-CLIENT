import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosError, AxiosRequestConfig } from "axios";
import { apiClient } from "../lib/axios";
import { logout, type AuthState } from "../features/auth/authSlice";
import type { ApiErrorBody } from "../types";

type ReflexBaseQueryArgs = {
  url: string;
  method: AxiosRequestConfig["method"];
  data?: unknown;
  params?: unknown;
};

// Typed against just the auth slice, not the whole RootState, so this
// file doesn't have to import app/store.ts — store.ts imports the API
// slices that use this baseQuery, so importing back from here would be
// circular.
type StateWithAuth = { auth: AuthState };

/**
 * Every Reflex endpoint returns { error: string } on failure
 * (errorHandler.ts), and every route needs `Authorization: Bearer
 * <token>` except POST /api/auth/login. This baseQuery attaches that
 * header from the auth slice on every request, and — since the
 * backend's authenticate() middleware returns a plain 401 for a missing,
 * malformed, or expired token — logs the user out on any 401 response
 * rather than leaving them stuck on a screen that will never load.
 */
export const axiosBaseQuery: BaseQueryFn<
  ReflexBaseQueryArgs,
  unknown,
  { status?: number; message: string }
> = async ({ url, method, data, params }, { getState, dispatch }) => {
  const token = (getState() as StateWithAuth).auth.token;

  try {
    const result = await apiClient({
      url,
      method,
      data,
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return { data: result.data };
  } catch (err) {
    const error = err as AxiosError<ApiErrorBody>;
    const status = error.response?.status;
    const message = error.response?.data?.error ?? error.message ?? "Something went wrong";

    if (status === 401) {
      dispatch(logout());
    }

    return { error: { status, message } };
  }
};
