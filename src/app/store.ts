import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE, persistReducer, persistStore } from "redux-persist";
import authReducer from "../features/auth/authSlice";
import { authApi } from "../api/authApi";
import { deliveriesApi } from "../api/deliveriesApi";
import { ridersApi } from "../api/ridersApi";

const storage = {
  getItem: (key: string) => {
    if (typeof window === "undefined") return Promise.resolve(null);
    return Promise.resolve(window.localStorage.getItem(key));
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== "undefined") window.localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    if (typeof window !== "undefined") window.localStorage.removeItem(key);
    return Promise.resolve();
  },
};

// Only auth is persisted — RTK Query's caches are deliberately left out
// of localStorage. They're re-fetched fresh on load instead, which
// matters here: a rider's delivery list or a dispatcher's rider roster
// going stale in localStorage across sessions is worse than a brief
// loading state on refresh.
const authPersistConfig = {
  key: "reflex-auth",
  storage,
  whitelist: ["token", "user"],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  [authApi.reducerPath]: authApi.reducer,
  [deliveriesApi.reducerPath]: deliveriesApi.reducer,
  [ridersApi.reducerPath]: ridersApi.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // redux-persist dispatches non-serializable action payloads
      // internally by design — these four are the documented,
      // safe-to-ignore set from the redux-persist docs.
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(authApi.middleware, deliveriesApi.middleware, ridersApi.middleware),
});

export const persistor = persistStore(store);

// Enables refetchOnFocus / refetchOnReconnect behavior — a dispatcher
// tabbing back into the app after a minute away gets fresh delivery
// data automatically, on top of the SSE push updates (see
// hooks/useDeliveryEvents.ts) for the moments in between.
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
