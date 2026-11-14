"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog } from "radix-ui";
import { Loader2, MessageCircle, Route, ShieldCheck, X } from "lucide-react";
import { Link, useNavigate } from "@/lib/router";
import { usePublicBookingQuote, useSettings, useTourAvailability } from "../../hooks/useCms";
import { useStickyBottomBar } from "../../hooks/useStickyBottomBar";
import { getTourPricing } from "../../lib/pricing";
import { getWhatsAppHref } from "../../lib/whatsapp";
import { formatCurrencyAmount } from "../../utils/currency";
import DatePickerField, { formatDateLabel } from "../forms/DatePickerField";
import GuestStepper from "../forms/GuestStepper";

const money = (amount, currency) => formatCurrencyAmount(Math.round(Number(amount || 0)), currency);

/** Shared state for the desktop panel and the mobile sheet. */
const useBookingDraft = (tour) => {
  const [date, setDate] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [dateError, setDateError] = useState("");
  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState("");
  const quoteMutation = usePublicBookingQuote();
  const availability = useTourAvailability(tour.slug, date);
  const { mutateAsync } = quoteMutation;

  // Live total from the server (same formula as checkout), debounced.
  useEffect(() => {
    let ignore = false;
    const timer = window.setTimeout(async () => {
      try {
        const result = await mutateAsync({ tourId: tour.id, travelDate: date || undefined, adults, children });
        if (!ignore) {
          setQuote(result.quote);
          setQuoteError("");
        }
      } catch (error) {
        if (!ignore) {
          setQuote(null);
          setQuoteError(error?.response?.data?.message || "Price could not be calculated right now.");
        }
      }
    }, 250);
    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, [tour.id, date, adults, children, mutateAsync]);

  const seatsLeft = availability.data?.available;
  const guests = adults + children;
  const fullyBooked = Boolean(date) && seatsLeft === 0;
  const tooMany = Boolean(date) && Number.isFinite(seatsLeft) && seatsLeft > 0 && guests > seatsLeft;

  return {
    date,
    setDate: (value) => {
      setDate(value);
      setDateError("");
    },
    adults,
    setAdults,
    children,
    setChildren,
    dateError,
    setDateError,
    quote,
    quoteError,
    quoteLoading: quoteMutation.isPending && !quote,
    availability,
    seatsLeft,
    fullyBooked,
    tooMany,
  };
};

const PanelBody = ({ tour, draft, onBook, idPrefix }) => {
  const { data: settings } = useSettings(true);
  const pricing = getTourPricing(tour);
  const currency = pricing.currency;
  const days = Number(draft.quote?.days || tour.durationDays || 0);
  const breakdown = draft.quote?.breakdown || {};
  const whatsapp = getWhatsAppHref(
    settings,
    `Hi, I'm interested in "${tour.title}"${draft.date ? ` on ${formatDateLabel(draft.date)}` : ""} for ${draft.adults + draft.children} guest(s).`,
  );
  const capacity = Number(tour.capacity || 0) || 20;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-subtle">From</p>
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-2xl font-bold text-navy-900">{pricing.hasPrice ? pricing.formattedFinal : "On request"}</span>
          {pricing.hasPrice && <span className="text-sm text-subtle">{pricing.unitLabel}</span>}
          {pricing.hasDiscount && <del className="text-sm text-subtle">{pricing.formattedBase}</del>}
          {pricing.hasDiscount && <span className="badge badge-soft">{pricing.discountPercent}% off</span>}
        </p>
      </div>

      <div>
        <label className="field-label" htmlFor={`${idPrefix}-travel-date`}>Travel date</label>
        <DatePickerField
          id={`${idPrefix}-travel-date`}
          value={draft.date}
          onChange={draft.setDate}
          invalid={Boolean(draft.dateError)}
          aria-describedby={`${idPrefix}-travel-date-help`}
        />
        <p id={`${idPrefix}-travel-date-help`} className={`mt-1.5 text-xs ${draft.dateError || draft.fullyBooked ? "font-medium text-red-700" : "text-subtle"}`} role={draft.dateError ? "alert" : undefined}>
          {draft.dateError
            || (!draft.date
              ? "Seats are held for 48 hours after you book."
              : draft.availability.isLoading
                ? "Checking seats…"
                : draft.fullyBooked
                  ? "Fully booked on this date. Please choose another."
                  : draft.tooMany
                    ? `Only ${draft.seatsLeft} seat${draft.seatsLeft === 1 ? "" : "s"} left on this date.`
                    : Number.isFinite(draft.seatsLeft)
                      ? `${draft.seatsLeft} seat${draft.seatsLeft === 1 ? "" : "s"} left on this date.`
                      : "")}
        </p>
      </div>

      <div className="divide-y divide-line border-y border-line">
        <GuestStepper label="Adults" value={draft.adults} onChange={draft.setAdults} min={1} max={capacity} />
        <GuestStepper label="Children" hint="Under 12" value={draft.children} onChange={draft.setChildren} min={0} max={capacity} />
      </div>

      <div className="text-sm" aria-live="polite">
        {draft.quoteLoading ? (
          <p className="flex items-center gap-2 text-subtle"><Loader2 size={14} className="animate-spin" aria-hidden="true" />Calculating price…</p>
        ) : draft.quoteError ? (
          <p className="text-xs text-red-700">{draft.quoteError}</p>
        ) : draft.quote ? (
          <dl className="space-y-1.5">
            <div className="flex justify-between gap-3 text-subtle">
              <dt>Tour · {days} day{days === 1 ? "" : "s"}</dt>
              <dd className="tabular-nums">{money(breakdown.baseTourTotal, currency)}</dd>
            </div>
            {breakdown.vehicleTotal > 0 && (
              <div className="flex justify-between gap-3 text-subtle"><dt>Vehicle</dt><dd className="tabular-nums">{money(breakdown.vehicleTotal, currency)}</dd></div>
            )}
            {breakdown.guestDailyCharges > 0 && (
              <div className="flex justify-between gap-3 text-subtle"><dt>Guest charges</dt><dd className="tabular-nums">{money(breakdown.guestDailyCharges, currency)}</dd></div>
            )}
            <div className="flex justify-between gap-3 border-t border-line pt-2 font-semibold text-navy-900">
              <dt>Estimated total</dt>
              <dd className="tabular-nums">{money(draft.quote.totalAmount, currency)}</dd>
            </div>
            {draft.quote.advanceAmount > 0 && (
              <div className="flex justify-between gap-3 text-xs text-subtle"><dt>Advance to confirm (10%)</dt><dd className="tabular-nums">{money(draft.quote.advanceAmount, currency)}</dd></div>
            )}
            <p className="pt-1 text-xs text-subtle">Hotel, meals and vehicle choice can be changed in the next step.</p>
          </dl>
        ) : null}
      </div>

      <button type="button" onClick={onBook} disabled={draft.fullyBooked || draft.tooMany} className="btn btn-primary btn-lg w-full">
        Book now
      </button>

      <div className="grid gap-2 text-sm">
        {whatsapp && (
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-secondary w-full">
            <MessageCircle size={16} aria-hidden="true" /> Ask on WhatsApp
          </a>
        )}
        <Link
          to="/custom-plan-request"
          state={{ sourceTour: { id: tour.id, title: tour.title, location: tour.location, currency: tour.currency } }}
          className="inline-flex items-center justify-center gap-2 py-1 text-[13px] font-semibold text-brand-700 hover:text-brand"
        >
          <Route size={15} aria-hidden="true" /> Plan a custom version of this trip
        </Link>
      </div>

      <p className="flex items-center gap-2 text-xs text-subtle">
        <ShieldCheck size={14} className="shrink-0 text-brand" aria-hidden="true" />
        No payment is taken until you review your booking.
      </p>
    </div>
  );
};

/**
 * Booking widget: sticky card on desktop; a sticky "Book" bar that opens the
 * same panel as a bottom sheet on phones/tablets.
 */
export default function TourBookingPanel({ tour }) {
  const navigate = useNavigate();
  const draft = useBookingDraft(tour);
  const [sheetOpen, setSheetOpen] = useState(false);
  const pricing = getTourPricing(tour);
  useStickyBottomBar(true);

  const bookHref = useMemo(() => {
    const params = new URLSearchParams({ adults: String(draft.adults), children: String(draft.children) });
    if (draft.date) params.set("date", draft.date);
    return `/book/${tour.id}?${params.toString()}`;
  }, [tour.id, draft.date, draft.adults, draft.children]);

  const book = () => {
    if (!draft.date) {
      draft.setDateError("Choose a travel date to continue.");
      setSheetOpen(true);
      return;
    }
    navigate(bookHref);
  };

  return (
    <>
      <aside aria-label="Book this tour" className="card card-pad hidden lg:sticky lg:top-24 lg:block">
        <PanelBody tour={tour} draft={draft} onBook={book} idPrefix="panel" />
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1 leading-tight">
            <p className="text-xs text-subtle">From</p>
            <p className="truncate text-base font-bold text-navy-900">
              {pricing.hasPrice ? pricing.formattedFinal : "On request"}
              {pricing.hasPrice && <span className="ml-1 text-xs font-normal text-subtle">{pricing.unitLabel}</span>}
            </p>
          </div>
          <button type="button" onClick={() => setSheetOpen(true)} className="btn btn-primary">
            Check dates &amp; book
          </button>
        </div>
      </div>

      <Dialog.Root open={sheetOpen} onOpenChange={setSheetOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="sheet-overlay fixed inset-0 z-[70] bg-navy-950/40 lg:hidden" />
          <Dialog.Content className="sheet-content fixed inset-x-0 bottom-0 z-[71] max-h-[90dvh] overflow-y-auto rounded-t-panel bg-surface px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-3 shadow-pop outline-none lg:hidden">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line-strong" aria-hidden="true" />
            <div className="mb-3 flex items-center justify-between gap-3">
              <Dialog.Title className="text-base font-semibold text-navy-900">Book {tour.title}</Dialog.Title>
              <Dialog.Close className="grid h-9 w-9 place-items-center rounded-control text-subtle hover:bg-canvas" aria-label="Close">
                <X size={18} />
              </Dialog.Close>
            </div>
            <Dialog.Description className="sr-only">Choose a date and guests to see the price and book.</Dialog.Description>
            <PanelBody tour={tour} draft={draft} onBook={book} idPrefix="sheet" />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
