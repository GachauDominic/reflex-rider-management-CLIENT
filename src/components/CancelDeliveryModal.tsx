import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { cancelDeliverySchema, type CancelDeliveryFormValues } from "../lib/validation";
import { useCancelDeliveryMutation } from "../api/deliveriesApi";
import { getErrorMessage } from "./Feedback";

export function CancelDeliveryModal({
  deliveryId,
  customerName,
  onClose,
}: {
  deliveryId: string;
  customerName: string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [cancelDelivery, { isLoading }] = useCancelDeliveryMutation();
  const { register, handleSubmit } = useForm<CancelDeliveryFormValues>({
    resolver: yupResolver(cancelDeliverySchema),
  });

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const onSubmit = async (values: CancelDeliveryFormValues) => {
    try {
      await cancelDelivery({ id: deliveryId, note: values.note || undefined }).unwrap();
      toast.success(`Cancelled delivery for ${customerName}`);
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not cancel this delivery"));
    }
  };

  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose}>
      <div className="modal-box">
        <h3 className="font-display text-lg font-semibold">Cancel this delivery?</h3>
        <p className="mt-1 text-sm text-base-content/60">For {customerName}. This can't be undone.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-3">
          <label className="form-control">
            <span className="label-text mb-1">Reason (optional)</span>
            <textarea className="textarea textarea-bordered w-full" rows={2} {...register("note")} />
          </label>
          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Keep delivery
            </button>
            <button type="submit" className="btn btn-error" disabled={isLoading}>
              {isLoading ? "Cancelling…" : "Cancel delivery"}
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
