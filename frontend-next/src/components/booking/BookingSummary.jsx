"use client";

import { useState } from "react";
import { Dialog } from "radix-ui";
import { ChevronUp, Clock3, Loader2, MessageCircle, X } from "lucide-react";
import SafeImage from "../common/SafeImage";
import { formatDateLabel } from "../forms/DatePickerField";
import { getWhatsAppHref } from "../../lib/whatsapp";
import { formatCurrencyAmount } from "../../utils/currency";
import { useStickyBottomBar } from "../../hooks/useStickyBottomBar";

const money = (amount, currency) => formatCurrencyAmount(Math.round(Number(amount || 0)), currency);

const Line = ({ label, value, strong = false, muted = false }) => (
  <div className={`flex justify-between gap-3 ${strong ? "font-semibold text-navy-900" : muted ? "text-xs text-subtle" : "text-subtle"}`}>
    <dt>{label}</dt>
    <dd className="tabular-nums">{value}</dd>
  </div>
);

const SummaryBody = ({ flow }) => {
  const { selectedTour: tour, form, quoteData: quote, quoteLoading, quoteError, paymentCurrency: currency, isPayOnArrival, isCustomBooking, settings } = flow;
  const breakdown = quote?.breakdown || {};
  const guests = Number(form.adults || 0) + Number(form.children || 0);
  const payNow = isPayOnArrival ? 0 : form.paymentPlan === "full" ? quote?.totalAmount : quote?.advanceAmount;
  const whatsapp = getWhatsAppHref(settings, `Hi, I need help booking "${tour?.title || "a tour"}"${form.travelDate ? ` on ${formatDateLabel(form.travelDate)}` : ""}.`);

  return (
    <div className="space-y-4">
      {tour && (
        <div className="flex gap-3">
          <div className="media relative h-16 w-20 shrink-0 rounded-control">
            <SafeImage src={tour.image} alt="" />
          </div>
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm font-semibold text-navy-900">{tour.title}</p>
            <p className="text-xs text-subtle">{[tour.location, tour.durationLabel || (tour.durationDays ? `${tour.durationDays} days` : "")].filter(Boolean).join(" · ")}</p>
          </div>
        </div>
      )}

      <dl className="space-y-1.5 border-t border-line pt-3 text-sm">
        <Line label="Date" value={form.travelDate ? formatDateLabel(form.travelDate) : "Not chosen yet"} />
        <Line label="Guests" value={`${guests} (${form.adults} adult${Number(form.adults) === 1 ? "" : "s"}${Number(form.children) ? `, ${form.children} child${Number(form.children) === 1 ? "" : "ren"}` : ""})`} />
      </dl>

      {!isCustomBooking && (
        <div className="border-t border-line pt-3 text-sm" aria-live="polite">
          {quoteLoading && !quote ? (
            <p className="flex items-center gap-2 text-subtle"><Loader2 size={14} className="animate-spin" aria-hidden="true" />Calculating…</p>
          ) : quoteError && !quote ? (
            <p className="text-xs text-red-700">{quoteError}</p>
          ) : quote ? (
            <dl className="space-y-1.5">
              <Line label={`Tour · ${quote.days} day${quote.days === 1 ? "" : "s"}`} value={money(breakdown.baseTourTotal, currency)} />
              {breakdown.vehicleTotal > 0 && <Line label="Vehicle" value={money(breakdown.vehicleTotal, currency)} />}
              {breakdown.hotelTotal > 0 && <Line label="Hotel" value={money(breakdown.hotelTotal, currency)} />}
              {breakdown.mealsTotal > 0 && <Line label="Meals" value={money(breakdown.mealsTotal, currency)} />}
              {breakdown.guestDailyCharges > 0 && <Line label="Guest charges" value={money(breakdown.guestDailyCharges, currency)} />}
              {breakdown.tourDiscountTotal > 0 && <Line label="Discount" value={`− ${money(breakdown.tourDiscountTotal, currency)}`} />}
              <div className="border-t border-line pt-2">
                <Line label="Total" value={money(quote.totalAmount, currency)} strong />
              </div>
              <Line
                label={isPayOnArrival ? "Pay now" : form.paymentPlan === "full" ? "Pay now (full)" : "Pay now (10% advance)"}
                value={isPayOnArrival ? "Nothing — pay on arrival" : money(payNow, currency)}
                muted
              />
            </dl>
          ) : null}
        </div>
      )}

      {!isCustomBooking && (
        <p className="flex gap-2 rounded-control bg-canvas px-3 py-2.5 text-xs leading-relaxed text-subtle">
          <Clock3 size={14} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
          Your seats are held for 48 hours after you submit. Unpaid bookings are released after that.
        </p>
      )}

      {whatsapp && (
        <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[13px] font-semibold text-brand-700 hover:text-brand">
          <MessageCircle size={16} aria-hidden="true" /> Need help? Chat on WhatsApp
        </a>
      )}
    </div>
  );
};

/** Booking summary: sticky card on desktop, collapsible bottom bar on phones. */
export default function BookingSummary({ flow }) {
  const [open, setOpen] = useState(false);
  const total = flow.quoteData?.totalAmount;
  useStickyBottomBar(true);

  return (
    <>
      <aside aria-label="Booking summary" className="card card-pad hidden lg:sticky lg:top-24 lg:block">
        <h2 className="mb-4 text-base font-semibold text-navy-900">Your trip</h2>
        <SummaryBody flow={flow} />
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 px-4 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2.5 backdrop-blur lg:hidden">
        <button type="button" onClick={() => setOpen(true)} className="mx-auto flex w-full max-w-xl items-center justify-between gap-3 text-left" aria-label="Show booking summary">
          <span className="min-w-0">
            <span className="block truncate text-xs text-subtle">{flow.selectedTour?.title || "Your trip"}</span>
            <span className="block text-base font-bold text-navy-900">
              {total ? money(total, flow.paymentCurrency) : flow.isCustomBooking ? "Custom request" : "—"}
            </span>
          </span>
          <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-700">
            Summary <ChevronUp size={16} aria-hidden="true" />
          </span>
        </button>
      </div>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[70] bg-navy-950/40 lg:hidden" />
          <Dialog.Content className="fixed inset-x-0 bottom-0 z-[71] max-h-[85dvh] overflow-y-auto rounded-t-panel bg-surface px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-3 shadow-pop outline-none lg:hidden">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line-strong" aria-hidden="true" />
            <div className="mb-3 flex items-center justify-between">
              <Dialog.Title className="text-base font-semibold text-navy-900">Your trip</Dialog.Title>
              <Dialog.Close className="grid h-9 w-9 place-items-center rounded-control text-subtle hover:bg-canvas" aria-label="Close summary">
                <X size={18} />
              </Dialog.Close>
            </div>
            <Dialog.Description className="sr-only">Booking summary and price</Dialog.Description>
            <SummaryBody flow={flow} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
