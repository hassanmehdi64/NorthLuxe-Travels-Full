import { ShieldCheck } from "lucide-react";

const BookingHeader = ({ isCustomBooking, action }) => (
  <header className="overflow-hidden border-b border-booking bg-white px-4 py-4 sm:px-5 lg:px-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold tracking-[-0.02em] text-theme sm:text-2xl">
          {isCustomBooking ? "Plan your custom trip" : "Complete your booking"}
          {action === "waitlist" ? " (Waitlist)" : ""}
        </h1>
        <p className="mt-1.5 max-w-xl text-[13px] leading-5 text-muted">
          {isCustomBooking ? "Tell us what you need and we’ll tailor the journey." : "A few details are all we need to reserve your trip."}
        </p>
      </div>
      <div className="inline-flex w-fit items-center gap-1.5 text-[10px] font-semibold text-[var(--c-brand-dark)]">
        <ShieldCheck size={13} strokeWidth={1.8} />
        Secure checkout
      </div>
    </div>
  </header>
);

export default BookingHeader;
