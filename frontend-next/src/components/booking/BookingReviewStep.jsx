import { Elements } from "@stripe/react-stripe-js";
import { CheckCircle2 } from "lucide-react";
import BookingCardPaymentFields from "./BookingCardPaymentFields";
import { stripePromise } from "../../lib/stripe";
import { displayCurrency, formatCurrencyAmount } from "../../utils/currency";

const Detail = ({ label, value }) => (
  <div className="min-w-0 py-2.5">
    <p className="text-[10px] text-muted">{label}</p>
    <p className="mt-0.5 break-words text-[13px] font-semibold text-theme">{value || "Not provided"}</p>
  </div>
);

const BookingReviewStep = ({
  quoteData,
  selectedTour,
  form,
  selectedPaymentMethod,
  selectedReceivingAccount,
  paymentMethodLabel,
  transactionReferenceLabel,
  isCardPayment,
  submitting,
  canConfirmBooking,
  cardAmountLabel,
  cardClientSecret,
  cardIntentLoading,
  cardIntentError,
  confirmedCardPayment,
  onBack,
  onSubmit,
  onCardPaymentConfirmed,
  onSubmitPaidBooking,
}) => {
  const currency = displayCurrency(selectedTour?.currency);
  const isManualPayment = selectedPaymentMethod?.mode === "manual";
  const dates = form.flexibleDates
    ? "Flexible dates"
    : [form.travelDate, form.endDate].filter(Boolean).join(" to ");
  const planLabel = selectedPaymentMethod?.mode === "arrival"
    ? "Pay on arrival"
    : form.paymentPlan === "full"
      ? "Full payment"
      : "10% advance";
  const dueNow = selectedPaymentMethod?.mode === "arrival"
    ? 0
    : form.paymentPlan === "full"
      ? quoteData?.totalAmount || 0
      : quoteData?.advanceAmount || 0;

  return (
    <div className="min-w-0 space-y-5 p-4 sm:p-5 lg:p-6">
      <div>
        <p className="text-base font-semibold tracking-tight text-theme">Review and confirm</p>
        <p className="mt-1 text-xs text-muted">Check the essentials, then confirm.</p>
      </div>

      <div className="rounded-xl bg-[#f1f7f4] p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--c-brand-dark)]">Total</p>
            <p className="mt-1 text-xl font-bold tracking-tight text-theme sm:text-2xl">
              {formatCurrencyAmount(quoteData?.totalAmount || 0, currency)}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 sm:text-right">
            <Detail label="Due now" value={formatCurrencyAmount(dueNow, currency)} />
            <Detail label="Remaining" value={formatCurrencyAmount(quoteData?.remainingAmount || 0, currency)} />
          </div>
        </div>
      </div>

      <div className="grid gap-x-6 divide-y divide-booking border-y border-booking px-1 sm:grid-cols-2 sm:divide-y-0">
        <Detail label="Tour" value={selectedTour?.title} />
        <Detail label="Travel dates" value={dates} />
        <Detail label="Travelers" value={`${quoteData?.guests || form.adults || 1} traveler(s)`} />
        <Detail label="Payment" value={`${paymentMethodLabel} · ${planLabel}`} />
      </div>

      {isManualPayment ? (
        <div className="border-t border-booking pt-4">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-theme">
            <CheckCircle2 size={15} className="text-[var(--c-brand-dark)]" />
            Transfer details
          </div>
          <div className="mt-2 grid gap-x-6 sm:grid-cols-2">
            <Detail label="Sent by" value={form.manualSenderName} />
            <Detail label="Amount sent" value={formatCurrencyAmount(form.manualSentAmount || 0, currency)} />
            <Detail label={transactionReferenceLabel} value={form.transactionReference} />
            <Detail label="Sent to" value={selectedReceivingAccount?.accountNumber} />
          </div>
        </div>
      ) : null}

      {form.customRequirements ? (
        <div className="rounded-lg bg-[#f7f9fa] px-4 py-3">
          <p className="text-[10px] text-muted">Additional request</p>
          <p className="mt-1 text-[13px] leading-5 text-theme">{form.customRequirements}</p>
        </div>
      ) : null}

      {isCardPayment ? (
        stripePromise ? (
          <Elements stripe={stripePromise}>
            <BookingCardPaymentFields
              customerName={form.customerName}
              email={form.email}
              phone={form.phone}
              amountLabel={cardAmountLabel}
              clientSecret={cardClientSecret}
              intentLoading={cardIntentLoading}
              intentError={cardIntentError}
              confirmedPayment={confirmedCardPayment}
              submitting={submitting}
              canConfirmBooking={canConfirmBooking}
              onBack={onBack}
              onPaymentConfirmed={onCardPaymentConfirmed}
              onSubmitPaidBooking={onSubmitPaidBooking}
            />
          </Elements>
        ) : (
          <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-[12px] text-amber-800">
            <p>{cardIntentError || "Card payment is not available right now."}</p>
            <button type="button" className="ql-btn-secondary w-full sm:w-auto" onClick={onBack}>Back</button>
          </div>
        )
      ) : (
        <div className="flex flex-col-reverse gap-3 border-t border-booking pt-4 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" className="ql-btn-secondary w-full sm:w-auto" onClick={onBack}>Back</button>
          <button type="button" className="ql-btn-primary w-full sm:w-auto" disabled={submitting || !canConfirmBooking} onClick={onSubmit}>
            {submitting ? "Submitting..." : "Confirm booking"}
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingReviewStep;
