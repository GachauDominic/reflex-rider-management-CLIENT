import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { createDeliverySchema, type CreateDeliveryFormValues } from "../lib/validation";
import { useCreateDeliveryMutation } from "../api/deliveriesApi";
import { getErrorMessage } from "../components/Feedback";

export default function NewDeliveryPage() {
  const navigate = useNavigate();
  const [createDelivery, { isLoading }] = useCreateDeliveryMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateDeliveryFormValues>({ resolver: yupResolver(createDeliverySchema) });

  const onSubmit = async (values: CreateDeliveryFormValues) => {
    try {
      const created = await createDelivery(values).unwrap();
      toast.success("Delivery created");
      navigate(`/deliveries/${created.id}`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not create this delivery"));
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-xl font-bold">New delivery</h1>
      <p className="mt-1 text-sm text-base-content/60">
        Once created, a dispatcher will assign a rider and you'll see status updates here as they happen.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="card mt-5 border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body gap-3">
          <label className="form-control">
            <span className="label-text mb-1">Customer name</span>
            <input type="text" className="input input-bordered w-full" {...register("customerName")} />
            {errors.customerName && <span className="mt-1 text-sm text-error">{errors.customerName.message}</span>}
          </label>

          <label className="form-control">
            <span className="label-text mb-1">Customer phone</span>
            <input
              type="tel"
              placeholder="0712345678"
              className="input input-bordered w-full font-mono"
              {...register("customerPhone")}
            />
            {errors.customerPhone && <span className="mt-1 text-sm text-error">{errors.customerPhone.message}</span>}
          </label>

          <label className="form-control">
            <span className="label-text mb-1">Delivery address</span>
            <textarea rows={2} className="textarea textarea-bordered w-full" {...register("address")} />
            {errors.address && <span className="mt-1 text-sm text-error">{errors.address.message}</span>}
          </label>

          <label className="form-control">
            <span className="label-text mb-1">Item description</span>
            <textarea rows={2} className="textarea textarea-bordered w-full" {...register("itemDescription")} />
            {errors.itemDescription && (
              <span className="mt-1 text-sm text-error">{errors.itemDescription.message}</span>
            )}
          </label>

          <button type="submit" className="btn btn-primary mt-2" disabled={isLoading}>
            {isLoading ? "Creating…" : "Create delivery"}
          </button>
        </div>
      </form>
    </div>
  );
}
