import { ShieldCheck } from "lucide-react";

const BookingHeader = ({ isCustomBooking, action }) => (
  <header className="overflow-hidden border-b border-booking bg-white px-4 py-5 sm:px-6 sm:py-6 lg:px-7">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--c-brand-dark)]">
          {isCustomBooking ? "Tailored journey" : "Trip reservation"}
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-theme sm:text-2xl">
          {isCustomBooking ? "Plan your custom trip" : "Complete your booking"}
          {action === "waitlist" ? " (Waitlist)" : ""}
        </h1>
        <p className="mt-1.5 max-w-xl text-[13px] leading-5 text-muted">
          {isCustomBooking ? "Tell us what you need and we’ll tailor the journey." : "A few details are all we need to reserve your trip."}
        </p>
      </div>
      <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#eef8f4] px-3 py-1.5 text-[10px] font-semibold text-[var(--c-brand-dark)]">
        <ShieldCheck size={13} strokeWidth={1.8} />
        Secure checkout
      </div>
    </div>
  </header>
);

export default BookingHeader;
