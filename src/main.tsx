import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from "sonner";
import { store, persistor } from "./app/store";
import { LoadingState } from "./components/Feedback";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={<LoadingState label="Loading Reflex…" />} persistor={persistor}>
        <Toaster richColors position="top-right" />
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>
);
