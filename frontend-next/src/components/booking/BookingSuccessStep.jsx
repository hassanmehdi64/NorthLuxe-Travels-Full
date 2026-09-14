import { useEffect } from "react";
import { ReceiptText, RotateCcw, ShieldCheck } from "lucide-react";
import { displayCurrency } from "../../utils/currency";

const BookingSuccessStep = ({
  bookingResult,
  onBackToTours,
  onReset,
}) => {
  const currency = displayCurrency(bookingResult?.currency);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    scrollToTop();
    const timer = window.setTimeout(scrollToTop, 120);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-5 p-4 sm:p-6 lg:p-7 animate-in fade-in duration-300">
      <div className="rounded-xl border border-[rgba(var(--c-brand-rgb),0.2)] bg-[#f2f8f5] p-5 text-center sm:p-7">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-emerald-700">
          <ShieldCheck size={21} />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-emerald-900 sm:text-xl">
          Booking submitted
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-[13px] leading-6 text-emerald-700 sm:text-sm">
          Your booking request has been submitted successfully. We have sent a
          confirmation email to your inbox, and our team will review the details
          within 2 hours.
        </p>

        <div className="mx-auto mt-5 grid max-w-3xl gap-2 text-left sm:grid-cols-3">
          <div className="rounded-lg border border-[rgba(34,197,94,0.14)] bg-white px-3.5 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700/80">
              Booking Code
            </p>
            <p className="mt-1 text-sm font-semibold text-heading">
              {bookingResult?.bookingCode || "Pending"}
            </p>
          </div>
          <div className="rounded-lg border border-[rgba(34,197,94,0.14)] bg-white px-3.5 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700/80">
              Payment Status
            </p>
            <p className="mt-1 text-sm font-semibold text-heading">
              {bookingResult?.payment || "Submitted"}
            </p>
          </div>
          <div className="rounded-lg border border-[rgba(34,197,94,0.14)] bg-white px-3.5 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700/80">
              Email Status
            </p>
            <p className="mt-1 text-sm font-semibold text-heading">
              Sent to Inbox
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-booking bg-white p-4 text-sm">
        <p className="flex items-center gap-2 font-semibold text-heading">
          <ReceiptText size={16} className="ql-icon" /> Booking Summary
        </p>
        <p>
          Total: {currency} {bookingResult?.amount || 0}
        </p>
        <p>
          Advance: {currency}{" "}
          {bookingResult?.advanceAmount || 0}
        </p>
        <p>
          Remaining: {currency}{" "}
          {bookingResult?.remainingAmount || 0}
        </p>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-booking pt-5 sm:flex-row sm:justify-between">
        <button
          type="button"
          className="ql-btn-secondary w-full sm:w-auto"
          onClick={onBackToTours}
        >
          Back to Tours
        </button>
        <button
          type="button"
          className="ql-btn-primary w-full sm:w-auto"
          onClick={onReset}
        >
          <RotateCcw size={16} />
          Make another booking
        </button>
      </div>
    </div>
  );
};

export default BookingSuccessStep;
