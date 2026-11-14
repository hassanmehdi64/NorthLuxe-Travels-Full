"use client";

import { Elements } from "@stripe/react-stripe-js";
import { ArrowLeft, Check, CheckCircle2, Clock3, CreditCard, Landmark, Loader2, MessageCircle, ShieldCheck, Wallet } from "lucide-react";
import { Field, Input, Textarea, Checkbox } from "../../admin/ui/Field";
import SelectMenu from "../forms/SelectMenu";
import DatePickerField, { formatDateLabel } from "../forms/DatePickerField";
import GuestStepper from "../forms/GuestStepper";
import BookingCardPaymentFields from "./BookingCardPaymentFields";
import { stripePromise } from "../../lib/stripe";
import { getWhatsAppHref } from "../../lib/whatsapp";
import { formatCurrencyAmount } from "../../utils/currency";

const money = (amount, currency) => formatCurrencyAmount(Math.round(Number(amount || 0)), currency);
const big = "h-11 text-[15px]";

const update = (setForm, patch) => setForm((prev) => ({ ...prev, ...patch }));
const updateFacilities = (setForm, patch) => setForm((prev) => ({ ...prev, facilities: { ...prev.facilities, ...patch } }));

/* ---------------- step indicator ---------------- */

const SECTIONS = ["Trip", "Your details", "Payment"];

export const StepIndicator = ({ flow }) => {
  const current = flow.step === 1 ? flow.section : 4;
  return (
    <nav aria-label="Booking steps" className="mb-6">
      <p className="mb-3 text-sm text-subtle">
        {flow.step === 1 ? `Step ${flow.section} of 3 · about 2 minutes` : "Final step · review and confirm"}
      </p>
      <ol className="flex items-center gap-2">
        {SECTIONS.map((label, i) => {
          const n = i + 1;
          const done = current > n;
          const active = current === n;
          return (
            <li key={label} className="flex min-w-0 flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => flow.step === 1 && flow.goToSection(n)}
                disabled={flow.step !== 1}
                aria-current={active ? "step" : undefined}
                className="flex min-w-0 items-center gap-2 text-left disabled:cursor-default"
              >
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${done ? "bg-brand text-white" : active ? "bg-navy-900 text-white" : "bg-line text-subtle"}`}>
                  {done ? <Check size={14} aria-hidden="true" /> : n}
                </span>
                <span className={`truncate text-sm ${active ? "font-semibold text-navy-900" : "hidden text-subtle sm:inline"}`}>{label}</span>
              </button>
              {n < 3 && <span className="h-px min-w-3 flex-1 bg-line" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

const Actions = ({ onBack, backLabel = "Back", children }) => (
  <div className="mt-8 flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
    {onBack ? (
      <button type="button" className="btn btn-ghost" onClick={onBack}>
        <ArrowLeft size={16} aria-hidden="true" /> {backLabel}
      </button>
    ) : <span />}
    {children}
  </div>
);

const SectionTitle = ({ title, text }) => (
  <div className="mb-5">
    <h2 className="heading-3 text-xl">{title}</h2>
    {text && <p className="mt-1 text-sm text-subtle">{text}</p>}
  </div>
);

/* ---------------- 1. Trip ---------------- */

export const TripSection = ({ flow }) => {
  const { form, setForm, tours, hasLockedTour, isCustomBooking, availability, seatsLeft, hotelOptions, vehicleOptions, selectedTour, settings } = flow;
  const err = flow.visibleErrors(1);
  const capacity = Number(selectedTour?.capacity || 0) || 20;
  const realHotels = hotelOptions.filter((o) => o.key !== "no_hotel");
  const mealsRate = Number(settings?.bookingPricing?.mealsDailyRate || 0);

  let dateHint = "";
  if (!isCustomBooking && form.travelDate && !err.travelDate) {
    if (availability.isLoading) dateHint = "Checking seats…";
    else if (Number.isFinite(seatsLeft)) dateHint = `${seatsLeft} seat${seatsLeft === 1 ? "" : "s"} left on this date.`;
  }

  return (
    <section aria-labelledby="trip-title">
      <SectionTitle title="Your trip" text={isCustomBooking ? "Tell us roughly when and how many — we'll plan the rest with you." : "Pick a date and who's coming."} />
      <div className="grid gap-5">
        {!hasLockedTour && (
          <Field label="Tour" required error={err.tourId}>
            <SelectMenu
              value={form.tourId}
              onChange={(value) => update(setForm, { tourId: value })}
              placeholder="Choose a tour"
              options={tours.map((tour) => ({ value: tour.id, label: tour.title }))}
            />
          </Field>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="booking-date" className="mb-1.5 block text-[13px] font-semibold text-navy-900">
              {isCustomBooking ? "Start date" : "Travel date"}{!isCustomBooking && <span className="ml-0.5 text-red-600" aria-hidden="true">*</span>}
            </label>
            <DatePickerField
              id="booking-date"
              value={form.travelDate}
              onChange={(value) => update(setForm, { travelDate: value })}
              invalid={Boolean(err.travelDate)}
              aria-describedby="booking-date-msg"
              placeholder={isCustomBooking && form.flexibleDates ? "Flexible" : "Choose a date"}
            />
            <p id="booking-date-msg" role={err.travelDate ? "alert" : undefined} className={`mt-1.5 text-xs ${err.travelDate ? "font-medium text-red-700" : "text-subtle"}`}>
              {err.travelDate || dateHint}
            </p>
          </div>
          {isCustomBooking && (
            <div>
              <label htmlFor="booking-end-date" className="mb-1.5 block text-[13px] font-semibold text-navy-900">End date</label>
              <DatePickerField id="booking-end-date" value={form.endDate} minDate={form.travelDate || undefined} onChange={(value) => update(setForm, { endDate: value })} />
            </div>
          )}
        </div>
        {isCustomBooking && (
          <Checkbox label="My dates are flexible" checked={form.flexibleDates} onChange={(e) => update(setForm, { flexibleDates: e.target.checked })} />
        )}

        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-navy-900">Guests</p>
          <div className="divide-y divide-line border-y border-line">
            <GuestStepper label="Adults" value={Number(form.adults)} onChange={(v) => update(setForm, { adults: v })} min={1} max={capacity} />
            <GuestStepper label="Children" hint="Under 12" value={Number(form.children)} onChange={(v) => update(setForm, { children: v })} min={0} max={capacity} />
          </div>
          {err.guests && <p role="alert" className="mt-1.5 text-xs font-medium text-red-700">{err.guests}</p>}
        </div>

        <Field label="Vehicle preference" required error={err.vehicleType} className="sm:max-w-md">
          <SelectMenu
            value={form.facilities.vehicleType}
            onChange={(value) => updateFacilities(setForm, { vehicleType: value })}
            placeholder="Choose a vehicle"
            options={vehicleOptions.map((option) => ({
              value: option.key,
              label: option.label,
              hint: Number(option.dailyRate) > 0 ? `+${money(option.dailyRate, flow.paymentCurrency)} per day` : undefined,
            }))}
          />
        </Field>

        {realHotels.length > 0 && (
          <div className="grid gap-3">
            <Checkbox
              label="Add a hotel stay"
              description="We'll book rooms in the category you choose."
              checked={form.facilities.hotelEnabled}
              onChange={(e) => updateFacilities(setForm, { hotelEnabled: e.target.checked, hotelType: e.target.checked ? (form.facilities.hotelType !== "no_hotel" ? form.facilities.hotelType : realHotels[0].key) : "no_hotel" })}
            />
            {form.facilities.hotelEnabled && (
              <Field label="Hotel category" required error={err.hotelType} className="sm:max-w-sm">
                <SelectMenu
                  value={form.facilities.hotelType}
                  onChange={(value) => updateFacilities(setForm, { hotelType: value })}
                  options={realHotels.map((option) => ({ value: option.key, label: option.label }))}
                />
              </Field>
            )}
          </div>
        )}

        {mealsRate > 0 && (
          <Checkbox
            label="Include meals"
            description={`${money(mealsRate, flow.paymentCurrency)} per guest per day`}
            checked={form.facilities.meals === "yes"}
            onChange={(e) => updateFacilities(setForm, { meals: e.target.checked ? "yes" : "no" })}
          />
        )}

        <Field label={isCustomBooking ? "What would you like to do?" : "Special requests"} hint="Optional — dietary needs, accessibility, celebrations.">
          <Textarea
            rows={3}
            value={isCustomBooking ? form.customRequirements : form.specialRequirements}
            onChange={(e) => update(setForm, isCustomBooking ? { customRequirements: e.target.value } : { specialRequirements: e.target.value })}
          />
        </Field>
      </div>

      <Actions>
        <button type="button" className="btn btn-primary btn-lg w-full sm:w-auto" onClick={() => flow.continueFrom(1)}>
          Continue
        </button>
      </Actions>
    </section>
  );
};

/* ---------------- 2. Details ---------------- */

export const DetailsSection = ({ flow }) => {
  const { form, setForm } = flow;
  const err = flow.visibleErrors(2);
  const isLocal = form.travelerType === "local";

  return (
    <section aria-labelledby="details-title">
      <SectionTitle title="Lead traveller" text="We'll send your confirmation here." />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" required error={err.customerName} className="sm:col-span-2">
          <Input className={big} autoComplete="name" value={form.customerName} onChange={(e) => update(setForm, { customerName: e.target.value })} />
        </Field>
        <Field label="Email" required error={err.email}>
          <Input className={big} type="email" autoComplete="email" inputMode="email" value={form.email} onChange={(e) => update(setForm, { email: e.target.value })} />
        </Field>
        <Field label="Phone (WhatsApp)" required error={err.phone} hint="Include the country code, e.g. +92">
          <Input className={big} type="tel" autoComplete="tel" inputMode="tel" value={form.phone} onChange={(e) => update(setForm, { phone: e.target.value })} />
        </Field>
      </div>

      <fieldset className="mt-6 border-t border-line pt-6">
        <legend className="sr-only">Identity</legend>
        <p className="mb-1 text-[13px] font-semibold text-navy-900">ID for permits and hotel check-in</p>
        <p className="mb-3 text-xs text-subtle">Required by checkpoints in the northern areas.</p>
        <div className="mb-4 inline-flex rounded-control bg-canvas p-1" role="radiogroup" aria-label="Traveller type">
          {[{ v: "local", l: "Pakistani resident" }, { v: "international", l: "International" }].map((o) => (
            <button key={o.v} type="button" role="radio" aria-checked={form.travelerType === o.v} onClick={() => update(setForm, { travelerType: o.v })}
              className={`rounded-[6px] px-4 py-2 text-sm font-medium transition ${form.travelerType === o.v ? "bg-surface text-navy-900 shadow-card" : "text-subtle hover:text-navy-900"}`}>
              {o.l}
            </button>
          ))}
        </div>
        {isLocal ? (
          <div className="grid gap-5 sm:grid-cols-[180px_minmax(0,1fr)]">
            <Field label="ID type">
              <SelectMenu
                value={form.localIdType}
                onChange={(value) => update(setForm, { localIdType: value })}
                options={[{ value: "cnic", label: "CNIC" }, { value: "passport", label: "Passport" }]}
              />
            </Field>
            <Field label={form.localIdType === "passport" ? "Passport number" : "CNIC number"} required error={err.localIdNumber}>
              <Input className={big} placeholder={form.localIdType === "passport" ? "AA1234567" : "12345-1234567-1"} value={form.localIdNumber} onChange={(e) => update(setForm, { localIdNumber: e.target.value })} />
            </Field>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Country of residence" required error={err.country}>
              <Input className={big} autoComplete="country-name" value={form.country} onChange={(e) => update(setForm, { country: e.target.value })} />
            </Field>
            <Field label="Passport number" required error={err.passportNumber}>
              <Input className={big} value={form.passportNumber} onChange={(e) => update(setForm, { passportNumber: e.target.value })} />
            </Field>
          </div>
        )}
      </fieldset>

      <Actions onBack={() => flow.goToSection(1)}>
        <button type="button" className="btn btn-primary btn-lg w-full sm:w-auto" onClick={() => flow.continueFrom(2)}>
          Continue
        </button>
      </Actions>
    </section>
  );
};

/* ---------------- 3. Payment ---------------- */

const METHOD_ICON = { card: CreditCard, manual: Landmark, arrival: Wallet };
const MANUAL_KEYS = ["transactionReference", "manualSenderName", "manualSenderNumber", "manualSentAmount", "manualSentAt", "manualPaymentSlip", "manualPaymentSlipName"];

export const PaymentSection = ({ flow }) => {
  const { form, setForm, paymentMethods, selectedPaymentMethod, selectedReceivingAccount, isManualPayment, isCardPayment, isPayOnArrival, quoteData, paymentCurrency } = flow;
  const err = flow.visibleErrors(3);
  const referenceLabel = selectedPaymentMethod?.referenceLabel || "Transaction reference";
  const dueNow = form.paymentPlan === "full" ? quoteData?.totalAmount : quoteData?.advanceAmount;

  const selectMethod = (key) => {
    if (key === form.paymentMethod) return;
    setForm((prev) => ({ ...prev, paymentMethod: key, ...Object.fromEntries(MANUAL_KEYS.map((k) => [k, ""])) }));
  };

  return (
    <section aria-labelledby="payment-title">
      <SectionTitle title="Payment" text="Choose how you'd like to pay. Nothing is charged until you review." />

      <fieldset>
        <legend className="mb-2 text-[13px] font-semibold text-navy-900">Payment method <span className="text-red-600" aria-hidden="true">*</span></legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {paymentMethods.map((method) => {
            const active = method.key === form.paymentMethod;
            const Icon = METHOD_ICON[method.mode] || ShieldCheck;
            return (
              <label key={method.key} className={`flex cursor-pointer items-center gap-3 rounded-control px-3.5 py-3 ring-1 transition ${active ? "bg-brand-50 ring-brand" : "ring-line-strong hover:ring-navy-700"}`}>
                <input type="radio" name="payment-method" className="sr-only" checked={active} onChange={() => selectMethod(method.key)} />
                <Icon size={18} className={active ? "text-brand-700" : "text-subtle"} aria-hidden="true" />
                <span className="text-sm font-medium text-navy-900">{method.label}</span>
              </label>
            );
          })}
        </div>
        {err.paymentMethod && <p role="alert" className="mt-1.5 text-xs font-medium text-red-700">{err.paymentMethod}</p>}
      </fieldset>

      {selectedPaymentMethod?.supportsPlan && (
        <fieldset className="mt-6">
          <legend className="mb-2 text-[13px] font-semibold text-navy-900">How much now?</legend>
          <div className="inline-flex rounded-control bg-canvas p-1" role="radiogroup" aria-label="Payment amount">
            {[{ v: "advance_10", l: "10% advance" }, { v: "full", l: "Full amount" }].map((plan) => (
              <button key={plan.v} type="button" role="radio" aria-checked={form.paymentPlan === plan.v} onClick={() => update(setForm, { paymentPlan: plan.v })}
                className={`rounded-[6px] px-4 py-2 text-sm font-medium transition ${form.paymentPlan === plan.v ? "bg-surface text-navy-900 shadow-card" : "text-subtle hover:text-navy-900"}`}>
                {plan.l}
              </button>
            ))}
          </div>
          {quoteData && <p className="mt-2 text-xs text-subtle">You’ll pay {money(dueNow, paymentCurrency)} now{form.paymentPlan === "full" ? "" : `, ${money(quoteData.remainingAmount, paymentCurrency)} later`}.</p>}
        </fieldset>
      )}

      {isManualPayment && (
        <div className="mt-6 border-t border-line pt-6">
          {selectedReceivingAccount ? (
            <div className="mb-5 rounded-card bg-canvas px-4 py-3.5">
              <p className="text-xs text-subtle">Send {quoteData ? money(dueNow, paymentCurrency) : "the advance"} to</p>
              <p className="mt-1 font-semibold text-navy-900">{selectedReceivingAccount.bankName || selectedReceivingAccount.label}</p>
              <p className="mt-0.5 break-all text-lg font-bold tabular-nums text-navy-900">{selectedReceivingAccount.accountNumber}</p>
              {selectedReceivingAccount.accountTitle && <p className="text-sm text-subtle">{selectedReceivingAccount.accountTitle}</p>}
            </div>
          ) : null}
          <p className="mb-4 text-sm text-subtle">After sending, enter the transfer details so we can match your payment.</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Sender name" required error={err.manualSenderName}>
              <Input className={big} value={form.manualSenderName} onChange={(e) => update(setForm, { manualSenderName: e.target.value })} />
            </Field>
            <Field label="Amount sent" required error={err.manualSentAmount}>
              <Input className={big} type="number" inputMode="decimal" min="0" step="1" value={form.manualSentAmount} onChange={(e) => update(setForm, { manualSentAmount: e.target.value })} />
            </Field>
            <Field label={referenceLabel} required error={err.transactionReference} className="sm:col-span-2">
              <Input className={big} value={form.transactionReference} onChange={(e) => update(setForm, { transactionReference: e.target.value })} />
            </Field>
          </div>
          {selectedPaymentMethod?.instructions && <p className="mt-4 text-xs leading-relaxed text-subtle">{selectedPaymentMethod.instructions}</p>}
        </div>
      )}

      {(isCardPayment || isPayOnArrival) && (
        <p className="mt-6 flex gap-2.5 border-t border-line pt-5 text-sm text-subtle">
          <ShieldCheck size={17} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
          {isCardPayment
            ? "You'll enter your card securely (via Stripe) on the next screen."
            : "Nothing to pay now. Your seats are held for 48 hours while we confirm; you pay the full amount on arrival."}
        </p>
      )}

      <Actions onBack={() => flow.goToSection(2)}>
        <button type="button" className="btn btn-primary btn-lg w-full sm:w-auto" onClick={() => flow.continueFrom(3)} disabled={flow.quoteLoading && !quoteData && !flow.isCustomBooking}>
          Review booking
        </button>
      </Actions>
    </section>
  );
};

/* ---------------- Review ---------------- */

const Row = ({ label, children }) => (
  <div className="grid gap-1 py-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4">
    <dt className="text-sm text-subtle">{label}</dt>
    <dd className="min-w-0 break-words text-sm font-medium text-navy-900">{children}</dd>
  </div>
);

export const ReviewStep = ({ flow }) => {
  const { form, selectedTour, quoteData, selectedPaymentMethod, isCardPayment, isManualPayment, isPayOnArrival, paymentCurrency, cardIntent, confirmedCardPayment, submitting, isCustomBooking } = flow;
  const back = () => flow.setStep(1);
  const guests = Number(form.adults) + Number(form.children);
  const planLabel = isPayOnArrival ? "Pay on arrival" : form.paymentPlan === "full" ? "Full amount now" : "10% advance now";
  const dates = isCustomBooking && form.flexibleDates
    ? "Flexible"
    : [form.travelDate, isCustomBooking ? form.endDate : ""].filter(Boolean).map(formatDateLabel).join(" – ") || "—";

  return (
    <section aria-labelledby="review-title">
      <SectionTitle title="Review and confirm" text="Check everything once. You can go back to change anything." />
      <dl className="divide-y divide-line border-y border-line">
        <Row label="Tour">{selectedTour?.title || "—"}</Row>
        <Row label="Date">{dates}</Row>
        <Row label="Guests">{guests} ({form.adults} adult{Number(form.adults) === 1 ? "" : "s"}{Number(form.children) ? `, ${form.children} child${Number(form.children) === 1 ? "" : "ren"}` : ""})</Row>
        <Row label="Lead traveller">{form.customerName}<span className="block font-normal text-subtle">{form.email} · {form.phone}</span></Row>
        <Row label="Payment">{selectedPaymentMethod?.label} · {planLabel}</Row>
        {isManualPayment && <Row label="Transfer">{money(form.manualSentAmount, paymentCurrency)} from {form.manualSenderName}<span className="block font-normal text-subtle">{selectedPaymentMethod?.referenceLabel || "Reference"}: {form.transactionReference}</span></Row>}
        {quoteData && <Row label="Total">{money(quoteData.totalAmount, paymentCurrency)}</Row>}
        {(form.specialRequirements || form.customRequirements) && <Row label="Requests">{form.specialRequirements || form.customRequirements}</Row>}
      </dl>

      {!isCustomBooking && (
        <p className="mt-5 flex gap-2.5 text-sm text-subtle">
          <Clock3 size={17} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
          {isCardPayment ? "Your seats are confirmed as soon as the card payment succeeds." : "Your seats are held for 48 hours after you confirm. Unpaid bookings are released after that."}
        </p>
      )}

      {isCardPayment ? (
        stripePromise ? (
          <div className="mt-6 border-t border-line pt-6">
            <Elements stripe={stripePromise}>
              <BookingCardPaymentFields
                customerName={form.customerName}
                email={form.email}
                phone={form.phone}
                amountLabel={money(flow.cardChargeAmount, paymentCurrency)}
                clientSecret={cardIntent.clientSecret}
                intentLoading={cardIntent.status === "loading"}
                intentError={cardIntent.error}
                confirmedPayment={confirmedCardPayment}
                submitting={submitting}
                canConfirmBooking={Boolean(quoteData)}
                onBack={back}
                onPaymentConfirmed={flow.handleCardPaymentConfirmed}
                onSubmitPaidBooking={flow.submitBooking}
                backLabel="Edit booking"
              />
            </Elements>
          </div>
        ) : (
          <>
            <p role="alert" className="mt-6 rounded-card bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Card payments aren’t available right now. Please go back and choose another payment method.
            </p>
            <Actions onBack={back} backLabel="Edit booking" />
          </>
        )
      ) : (
        <Actions onBack={back} backLabel="Edit booking">
          <button type="button" className="btn btn-primary btn-lg w-full sm:w-auto" disabled={submitting || (!quoteData && !isCustomBooking)} onClick={() => flow.submitBooking()}>
            {submitting ? <><Loader2 size={16} className="animate-spin" aria-hidden="true" /> Submitting…</> : isCustomBooking ? "Send request" : "Confirm booking"}
          </button>
        </Actions>
      )}
    </section>
  );
};

/* ---------------- Done ---------------- */

const formatDateTime = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
};

export const DoneStep = ({ flow }) => {
  const result = flow.bookingResult || {};
  const currency = flow.paymentCurrency;
  const holdUntil = result.seatState === "held" && result.holdExpiresAt ? formatDateTime(result.holdExpiresAt) : "";
  const whatsapp = getWhatsAppHref(flow.settings, `Hi, my booking code is ${result.bookingCode || ""}.`);

  return (
    <section aria-labelledby="done-title" className="mx-auto max-w-xl py-4 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-700">
        <CheckCircle2 size={28} aria-hidden="true" />
      </span>
      <h1 id="done-title" className="heading-2 mt-4">{flow.isCustomBooking ? "Request received" : "Booking received"}</h1>
      <p className="mt-2 text-subtle">We’ve emailed the details to {result.email || flow.form.email}. Our team will contact you to confirm.</p>

      <dl className="mt-6 divide-y divide-line border-y border-line text-left">
        <Row label="Booking code"><span className="font-mono text-base">{result.bookingCode || "—"}</span></Row>
        <Row label="Payment">{result.paymentLabel || result.payment || "—"}</Row>
        {Number(result.amount) > 0 && <Row label="Total">{money(result.amount, currency)}</Row>}
        {holdUntil && <Row label="Seats held until">{holdUntil}</Row>}
      </dl>

      {result.paymentVerificationNote && (
        <p className="mt-4 rounded-card bg-sand-50 px-4 py-3 text-left text-sm text-body">{result.paymentVerificationNote}</p>
      )}

      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <button type="button" className="btn btn-primary" onClick={() => flow.navigate("/tours")}>Browse more tours</button>
        {whatsapp && (
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            <MessageCircle size={16} aria-hidden="true" /> Questions? WhatsApp us
          </a>
        )}
      </div>
    </section>
  );
};
