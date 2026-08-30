import { Navigate, Route, Routes } from "react-router";
import { RequireAuth, RequireRole } from "./components/RouteGuards";
import { AppShell } from "./components/AppShell";
import LoginPage from "./pages/LoginPage";
import DeliveriesPage from "./pages/DeliveriesPage";
import NewDeliveryPage from "./pages/NewDeliveryPage";
import DeliveryDetailPage from "./pages/DeliveryDetailPage";
import RidersPage from "./pages/RidersPage";
import RiderDetailPage from "./pages/RiderDetailPage";
import NotFoundPage from "./pages/NotFoundPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/deliveries" replace />} />
          <Route path="deliveries" element={<DeliveriesPage />} />
          <Route path="deliveries/:id" element={<DeliveryDetailPage />} />

          <Route element={<RequireRole roles={["RETAILER"]} />}>
            <Route path="deliveries/new" element={<NewDeliveryPage />} />
          </Route>

          <Route element={<RequireRole roles={["DISPATCHER"]} />}>
            <Route path="riders" element={<RidersPage />} />
            <Route path="riders/:id" element={<RiderDetailPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
