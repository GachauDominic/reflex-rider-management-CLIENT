import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { assignDeliverySchema, type AssignDeliveryFormValues } from "../lib/validation";
import { useAssignDeliveryMutation } from "../api/deliveriesApi";
import { useListRidersQuery } from "../api/ridersApi";
import { getErrorMessage } from "./Feedback";

export function AssignDeliveryModal({
  deliveryId,
  customerName,
  onClose,
}: {
  deliveryId: string;
  customerName: string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { data: riders, isLoading: ridersLoading } = useListRidersQuery();
  const [assignDelivery, { isLoading: assigning }] = useAssignDeliveryMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssignDeliveryFormValues>({ resolver: yupResolver(assignDeliverySchema) });

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const onSubmit = async (values: AssignDeliveryFormValues) => {
    try {
      await assignDelivery({ id: deliveryId, riderId: values.riderId }).unwrap();
      toast.success(`Assigned ${customerName}'s delivery`);
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not assign this delivery"));
    }
  };

  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose}>
      <div className="modal-box">
        <h3 className="font-display text-lg font-semibold">Assign a rider</h3>
        <p className="mt-1 text-sm text-base-content/60">Delivery for {customerName}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-3">
          <label className="form-control">
            <span className="label-text mb-1">Rider</span>
            <select
              className="select select-bordered w-full"
              defaultValue=""
              disabled={ridersLoading}
              {...register("riderId")}
            >
              <option value="" disabled>
                {ridersLoading ? "Loading riders…" : "Choose a rider"}
              </option>
              {riders?.map((rider) => (
                <option key={rider.id} value={rider.id}>
                  {rider.name} — {rider.phone ?? rider.email}
                </option>
              ))}
            </select>
            {errors.riderId && <span className="mt-1 text-sm text-error">{errors.riderId.message}</span>}
          </label>

          {riders && riders.length === 0 && (
            <p className="text-sm text-warning">No riders exist yet — seed or create one before assigning.</p>
          )}

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={assigning || ridersLoading}>
              {assigning ? "Assigning…" : "Assign rider"}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button aria-label="Close">close</button>
      </form>
    </dialog>
  );
}
