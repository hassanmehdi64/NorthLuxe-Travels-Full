import { formatCurrencyAmount } from "../../utils/currency";

const BookingTourSummary = ({
  selectedTour,
  quoteData,
  quoteLoading,
  paymentPlan,
  paymentCurrency,
  isArrivalPayment = false,
}) => {
  if (!selectedTour) return null;

  const totalAmount = Number(quoteData?.totalAmount || selectedTour.price || 0);
  const advanceAmount = Number(quoteData?.advanceAmount || totalAmount * 0.1 || 0);
  const payableAmount = isArrivalPayment ? 0 : paymentPlan === "full" ? totalAmount : advanceAmount;
  const selectedPlanLabel = isArrivalPayment
    ? "On Arrival"
    : paymentPlan === "full"
      ? "Full Payment"
      : "10% Advance";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[rgba(var(--c-brand-rgb),0.16)] bg-[#f2f8f5] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="min-w-0">
          <p className="line-clamp-1 text-[13px] font-semibold text-theme sm:text-sm">
            {selectedTour.title}
          </p>
          <p className="mt-1 line-clamp-1 text-[11px] text-muted">
            {selectedTour.location} |{" "}
            {selectedTour.durationLabel || `${selectedTour.durationDays} Days`}
          </p>
        </div>
        <div className="shrink-0 border-t border-[rgba(var(--c-brand-rgb),0.12)] pt-2 text-left sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0 sm:text-right">
          <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted">
            {selectedPlanLabel}
          </p>
          <p className="mt-0.5 text-sm font-bold text-theme">
            {quoteLoading && !quoteData
              ? "Calculating..."
              : formatCurrencyAmount(payableAmount, paymentCurrency || selectedTour.currency)}
          </p>
        </div>
    </div>
  );
};

export default BookingTourSummary;
