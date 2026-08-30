import { Link, useParams } from "react-router";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import { useGetRiderDeliveriesQuery } from "../api/ridersApi";
import { DeliveryCard } from "../components/DeliveryCard";
import { DeliveryActions } from "../components/DeliveryActions";
import { LoadingState, ErrorAlert, EmptyState, getErrorMessage } from "../components/Feedback";

export default function RiderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: deliveries, isLoading, error } = useGetRiderDeliveriesQuery(id ?? "", { skip: !id });

  return (
    <div>
      <Link to="/riders" className="mb-4 inline-flex items-center gap-1 text-sm text-base-content/60 hover:underline">
        <HiOutlineArrowLeft className="h-4 w-4" /> Back to riders
      </Link>

      <h1 className="mb-5 font-display text-xl font-bold">Rider's deliveries</h1>

      {isLoading && <LoadingState label="Loading deliveries…" />}
      {error && <ErrorAlert message={getErrorMessage(error, "Could not load this rider's deliveries")} />}
      {deliveries && deliveries.length === 0 && (
        <EmptyState title="Nothing assigned yet" hint="This rider has no deliveries at the moment." />
      )}

      {deliveries && deliveries.length > 0 && (
        <div className="flex flex-col gap-3">
          {deliveries.map((delivery) => (
            <DeliveryCard key={delivery.id} delivery={delivery} actions={<DeliveryActions delivery={delivery} />} />
          ))}
        </div>
      )}
    </div>
  );
}
