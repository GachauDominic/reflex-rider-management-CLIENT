import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { LoginResponse, UserRole } from "../../types";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

const initialState: AuthState = {
  token: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Payload shape matches POST /api/auth/login's response body exactly
    // (LoginResponse), so this can be called directly with whatever the
    // login mutation resolves to.
    credentialsSet(state, action: PayloadAction<LoginResponse>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    logout(state) {
      state.token = null;
      state.user = null;
    },
  },
});

export const { credentialsSet, logout } = authSlice.actions;
export default authSlice.reducer;
