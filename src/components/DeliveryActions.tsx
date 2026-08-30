import { useState } from "react";
import { toast } from "sonner";
import type { Delivery } from "../types";
import { useAppSelector } from "../app/hooks";
import { useUpdateDeliveryStatusMutation } from "../api/deliveriesApi";
import { AssignDeliveryModal } from "./AssignDeliveryModal";
import { ConfirmDeliveryModal } from "./ConfirmDeliveryModal";
import { CancelDeliveryModal } from "./CancelDeliveryModal";
import { getErrorMessage } from "./Feedback";

const NON_TERMINAL: Delivery["status"][] = ["OPEN", "ASSIGNED", "PICKED_UP", "IN_TRANSIT"];

export function DeliveryActions({ delivery }: { delivery: Delivery }) {
  const user = useAppSelector((state) => state.auth.user);
  const [modal, setModal] = useState<"assign" | "confirm" | "cancel" | null>(null);
  const [updateStatus, { isLoading: advancing }] = useUpdateDeliveryStatusMutation();

  if (!user) return null;

  const isOwnRetailer = user.role === "RETAILER" && delivery.retailerId === user.id;
  const isAssignedRider = user.role === "RIDER" && delivery.riderId === user.id;
  const isDispatcher = user.role === "DISPATCHER";
  const canCancel = NON_TERMINAL.includes(delivery.status) && (isOwnRetailer || isAssignedRider || isDispatcher);

  const advance = async (status: "PICKED_UP" | "IN_TRANSIT") => {
    try {
      await updateStatus({ id: delivery.id, status }).unwrap();
      toast.success(status === "PICKED_UP" ? "Marked as picked up" : "Marked as in transit");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update this delivery"));
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {isDispatcher && delivery.status === "OPEN" && (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setModal("assign")}>
            Assign rider
          </button>
        )}

        {isAssignedRider && delivery.status === "ASSIGNED" && (
          <button type="button" className="btn btn-primary btn-sm" disabled={advancing} onClick={() => advance("PICKED_UP")}>
            Mark picked up
          </button>
        )}

        {isAssignedRider && delivery.status === "PICKED_UP" && (
          <button type="button" className="btn btn-primary btn-sm" disabled={advancing} onClick={() => advance("IN_TRANSIT")}>
            Start transit
          </button>
        )}

        {isAssignedRider && delivery.status === "IN_TRANSIT" && (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setModal("confirm")}>
            Confirm delivery
          </button>
        )}

        {canCancel && (
          <button type="button" className="btn btn-ghost btn-sm text-error" onClick={() => setModal("cancel")}>
            Cancel
          </button>
        )}
      </div>

      {modal === "assign" && (
        <AssignDeliveryModal deliveryId={delivery.id} customerName={delivery.customerName} onClose={() => setModal(null)} />
      )}
      {modal === "confirm" && (
        <ConfirmDeliveryModal deliveryId={delivery.id} customerName={delivery.customerName} onClose={() => setModal(null)} />
      )}
      {modal === "cancel" && (
        <CancelDeliveryModal deliveryId={delivery.id} customerName={delivery.customerName} onClose={() => setModal(null)} />
      )}
    </>
  );
}
