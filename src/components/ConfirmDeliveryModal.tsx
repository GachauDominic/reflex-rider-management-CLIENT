import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { confirmDeliverySchema, type ConfirmDeliveryFormValues } from "../lib/validation";
import { useConfirmDeliveryMutation } from "../api/deliveriesApi";
import { QrScanner } from "./QrScanner";
import { getErrorMessage } from "./Feedback";

export function ConfirmDeliveryModal({
  deliveryId,
  customerName,
  onClose,
}: {
  deliveryId: string;
  customerName: string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [useCamera, setUseCamera] = useState(true);
  const [confirmDelivery, { isLoading: confirming }] = useConfirmDeliveryMutation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ConfirmDeliveryFormValues>({ resolver: yupResolver(confirmDeliverySchema) });

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const submitCode = async (code: string) => {
    try {
      await confirmDelivery({ id: deliveryId, confirmationCode: code }).unwrap();
      toast.success(`Delivery to ${customerName} confirmed`);
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error, "That code didn't confirm this delivery"));
    }
  };

  const onManualSubmit = (values: ConfirmDeliveryFormValues) => submitCode(values.confirmationCode);

  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose}>
      <div className="modal-box">
        <h3 className="font-display text-lg font-semibold">Confirm delivery</h3>
        <p className="mt-1 text-sm text-base-content/60">To {customerName}</p>

        {useCamera ? (
          <div className="mt-4">
            <QrScanner
              onScan={(code) => {
                setValue("confirmationCode", code);
                submitCode(code);
              }}
              onError={() => setUseCamera(false)}
            />
            <button
              type="button"
              className="btn btn-ghost btn-sm mt-3 w-full"
              onClick={() => setUseCamera(false)}
            >
              Enter code manually instead
            </button>
          </div>
        ) : (
          <form id="confirm-delivery-form" onSubmit={handleSubmit(onManualSubmit)} className="mt-4 flex flex-col gap-3">
            <label className="form-control">
              <span className="label-text mb-1">Confirmation code</span>
              <input
                type="text"
                placeholder="REF-DEL-XXXXXXXX-XXXX"
                className="input input-bordered w-full font-mono uppercase"
                {...register("confirmationCode")}
              />
              {errors.confirmationCode && (
                <span className="mt-1 text-sm text-error">{errors.confirmationCode.message}</span>
              )}
            </label>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setUseCamera(true)}>
              Use camera instead
            </button>
          </form>
        )}

        <div className="modal-action">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          {!useCamera && (
            <button type="submit" form="confirm-delivery-form" className="btn btn-primary" disabled={confirming}>
              {confirming ? "Confirming…" : "Confirm delivery"}
            </button>
          )}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button aria-label="Close">close</button>
      </form>
    </dialog>
  );
}
