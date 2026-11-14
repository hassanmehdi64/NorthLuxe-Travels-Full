"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "@/lib/router";
import {
  useCreatePaymentIntent,
  useCreatePublicBooking,
  usePublicBookingQuote,
  usePublicTours,
  useSettings,
  useTourAvailability,
  useVerifyPaymentIntent,
} from "../../hooks/useCms";
import { useToast } from "../../context/ToastContext";
import { stripePublishableKey } from "../../lib/stripe";
import { displayCurrency } from "../../utils/currency";
import { DEFAULT_FORM, FALLBACK_HOTELS, FALLBACK_VEHICLES } from "./bookingConstants";
import { ensurePaymentConfig, getPaymentMethodMeta, getReceivingAccountByKey } from "./paymentConfig";

/**
 * All booking-page state and behaviour (quote, availability, validation, Stripe
 * card intent, submit). The page component only renders.
 *
 * Sections: 1 Trip → 2 Your details → 3 Payment, then Review (step 2) and Done (step 3).
 * Card payment logic is unchanged from the previous page: the intent is created on the
 * review step, verified, then the booking is submitted; the server verifies again.
 */

const EMPTY_CARD_INTENT = { requestKey: "", clientSecret: "", paymentIntentId: "", amount: 0, currency: "", error: "", status: "idle" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const useBookingFlow = () => {
  const { tourId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const { data: tours = [], isLoading: toursLoading } = usePublicTours();
  const { data: settings } = useSettings(true);
  const quoteBooking = usePublicBookingQuote();
  const createBooking = useCreatePublicBooking();
  const createPaymentIntent = useCreatePaymentIntent();
  const verifyPaymentIntent = useVerifyPaymentIntent();

  const [form, setForm] = useState(DEFAULT_FORM);
  const [step, setStep] = useState(1);
  const [section, setSection] = useState(1);
  const [showErrors, setShowErrors] = useState({ 1: false, 2: false, 3: false });
  const [submitting, setSubmitting] = useState(false);
  const [quoteData, setQuoteData] = useState(null);
  const [quoteError, setQuoteError] = useState("");
  const [bookingResult, setBookingResult] = useState(null);
  const [cardIntent, setCardIntent] = useState(EMPTY_CARD_INTENT);
  const [confirmedCardPayment, setConfirmedCardPayment] = useState(null);

  const isCustomBooking = location.pathname.startsWith("/custom-booking") || location.state?.bookingType === "custom";
  const bookingType = isCustomBooking ? "custom" : "standard";
  const hasLockedTour = Boolean(tourId);

  // ---------- payment config ----------
  const paymentConfig = useMemo(() => ensurePaymentConfig(settings || {}), [settings]);
  const paymentMethods = useMemo(() => paymentConfig.methods.filter((item) => item.active !== false), [paymentConfig.methods]);
  const selectedPaymentMethod = useMemo(
    () =>
      paymentMethods.find((item) => item.key === form.paymentMethod) ||
      paymentMethods[0] || {
        key: form.paymentMethod,
        label: getPaymentMethodMeta(form.paymentMethod).label,
        mode: getPaymentMethodMeta(form.paymentMethod).mode,
        supportsPlan: getPaymentMethodMeta(form.paymentMethod).supportsPlan,
        referenceLabel: getPaymentMethodMeta(form.paymentMethod).defaultReferenceLabel,
        accountKey: "",
        instructions: "",
      },
    [paymentMethods, form.paymentMethod],
  );
  const selectedReceivingAccount = useMemo(
    () => getReceivingAccountByKey(paymentConfig.accounts, selectedPaymentMethod?.accountKey),
    [paymentConfig.accounts, selectedPaymentMethod],
  );
  const isCardPayment = selectedPaymentMethod?.mode === "card";
  const isManualPayment = selectedPaymentMethod?.mode === "manual";
  const isPayOnArrival = selectedPaymentMethod?.mode === "arrival";

  useEffect(() => {
    if (paymentMethods.length && !paymentMethods.some((item) => item.key === form.paymentMethod)) {
      setForm((prev) => ({ ...prev, paymentMethod: paymentMethods[0].key, transactionReference: "" }));
    }
  }, [paymentMethods, form.paymentMethod]);

  useEffect(() => {
    if (!selectedPaymentMethod?.supportsPlan && form.paymentPlan !== "advance_10") {
      setForm((prev) => ({ ...prev, paymentPlan: "advance_10" }));
    }
  }, [selectedPaymentMethod, form.paymentPlan]);

  // ---------- tour + prefill ----------
  useEffect(() => {
    if (!tours.length) return;
    if (hasLockedTour) {
      const selected = tours.find((tour) => tour.id === tourId || tour.slug === tourId);
      if (!selected) {
        toast.error("Tour unavailable", "This tour could not be loaded.");
        navigate("/tours");
        return;
      }
      setForm((prev) => ({ ...prev, tourId: selected.id }));
    } else {
      setForm((prev) => ({ ...prev, tourId: prev.tourId || tours[0].id }));
    }
  }, [tours, tourId, hasLockedTour, toast, navigate]);

  // From the tour page (?date=&adults=&children=) or router state.
  useEffect(() => {
    const prefill = location.state?.prefill || {};
    const date = searchParams.get("date") || prefill.travelDate || "";
    const adults = Number(searchParams.get("adults") || prefill.adults || 0);
    const children = Number(searchParams.get("children") || prefill.children || 0);
    setForm((prev) => ({
      ...prev,
      customerName: prefill.customerName || prev.customerName,
      email: prefill.email || prev.email,
      phone: prefill.phone || prev.phone,
      specialRequirements: prefill.specialRequirements || prev.specialRequirements,
      travelDate: /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= todayKey() ? date : prev.travelDate,
      adults: adults >= 1 ? adults : prev.adults,
      children: children >= 0 && searchParams.get("children") !== null ? children : prev.children,
    }));
  }, [location.state, searchParams]);

  const selectedTour = useMemo(() => tours.find((tour) => tour.id === form.tourId), [tours, form.tourId]);
  const availability = useTourAvailability(isCustomBooking ? "" : selectedTour?.slug, form.travelDate);
  const seatsLeft = availability.data?.available;
  const guests = Number(form.adults || 0) + Number(form.children || 0);

  // ---------- options (server-resolved via the quote; settings as fallback) ----------
  const hotelOptions = useMemo(() => {
    const fromQuote = quoteData?.options?.hotelCategories;
    if (fromQuote?.length) return fromQuote;
    return settings?.bookingPricing?.hotelCategories?.filter((x) => x.active !== false) || FALLBACK_HOTELS;
  }, [quoteData, settings]);
  const vehicleOptions = useMemo(() => {
    const fromQuote = quoteData?.options?.vehicleTypes;
    if (fromQuote?.length) return fromQuote;
    return settings?.bookingPricing?.vehicleTypes?.filter((x) => x.active !== false) || FALLBACK_VEHICLES;
  }, [quoteData, settings]);

  useEffect(() => {
    if (!vehicleOptions.length) return;
    if (!vehicleOptions.some((option) => option.key === form.facilities.vehicleType)) {
      setForm((prev) => ({ ...prev, facilities: { ...prev.facilities, vehicleType: vehicleOptions[0].key } }));
    }
  }, [vehicleOptions, form.facilities.vehicleType]);

  // ---------- validation (errors shown next to fields after "Continue") ----------
  const errors = useMemo(() => {
    const trip = {};
    if (!form.tourId) trip.tourId = "Choose a tour.";
    if (!isCustomBooking) {
      if (!form.travelDate) trip.travelDate = "Choose a travel date.";
      else if (form.travelDate < todayKey()) trip.travelDate = "The travel date can't be in the past.";
      else if (seatsLeft === 0) trip.travelDate = "This date is fully booked. Please choose another.";
      else if (Number.isFinite(seatsLeft) && guests > seatsLeft) trip.guests = `Only ${seatsLeft} seat${seatsLeft === 1 ? "" : "s"} left on this date.`;
    }
    if (Number(form.adults) < 1) trip.guests = "At least one adult is required.";
    if (!form.facilities.vehicleType) trip.vehicleType = "Choose a vehicle.";
    if (form.facilities.hotelEnabled && (!form.facilities.hotelType || form.facilities.hotelType === "no_hotel")) trip.hotelType = "Choose a hotel category.";

    const details = {};
    if (!form.customerName.trim()) details.customerName = "Enter the lead traveller's full name.";
    if (!EMAIL_RE.test(form.email.trim())) details.email = "Enter a valid email address.";
    if (form.phone.replace(/\D/g, "").length < 10) details.phone = "Enter a phone number with at least 10 digits.";
    if (form.travelerType === "local" && !form.localIdNumber.trim()) details.localIdNumber = `Enter the ${form.localIdType === "passport" ? "passport" : "CNIC"} number.`;
    if (form.travelerType === "international") {
      if (!form.country.trim()) details.country = "Enter your country of residence.";
      if (!form.passportNumber.trim()) details.passportNumber = "Enter your passport number.";
    }

    const payment = {};
    if (!selectedPaymentMethod) payment.paymentMethod = "Choose a payment method.";
    if (isManualPayment) {
      if (!selectedReceivingAccount) payment.paymentMethod = "This payment method isn't set up yet. Please choose another.";
      if (!form.manualSenderName.trim()) payment.manualSenderName = "Enter the sender's name.";
      if (!(Number(form.manualSentAmount || 0) > 0)) payment.manualSentAmount = "Enter the amount you sent.";
      if (!form.transactionReference.trim()) payment.transactionReference = `Enter the ${selectedPaymentMethod?.referenceLabel || "transaction reference"}.`;
    }
    return { 1: trip, 2: details, 3: payment };
  }, [form, isCustomBooking, seatsLeft, guests, selectedPaymentMethod, selectedReceivingAccount, isManualPayment]);

  const sectionValid = (n) => Object.keys(errors[n]).length === 0;
  const visibleErrors = (n) => (showErrors[n] ? errors[n] : {});

  // ---------- live quote (whenever the trip details are usable) ----------
  const { mutateAsync: quoteMutate } = quoteBooking;
  const buildQuotePayload = () => ({
    ...form,
    facilities: { ...form.facilities, hotelType: form.facilities.hotelEnabled ? form.facilities.hotelType : "no_hotel" },
  });
  useEffect(() => {
    if (!form.tourId || isCustomBooking) return undefined;
    let ignore = false;
    const timer = window.setTimeout(async () => {
      try {
        const response = await quoteMutate(buildQuotePayload());
        if (!ignore) {
          setQuoteData(response.quote);
          setQuoteError("");
        }
      } catch (error) {
        if (!ignore) {
          setQuoteData(null);
          setQuoteError(error?.response?.data?.message || "The price could not be calculated.");
        }
      }
    }, 250);
    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.tourId, form.travelDate, form.adults, form.children, form.facilities.hotelEnabled, form.facilities.hotelType, form.facilities.vehicleType, form.facilities.meals, isCustomBooking, quoteMutate]);

  // ---------- navigation between sections ----------
  const goToSection = (target) => {
    for (let n = 1; n < target; n += 1) {
      if (!sectionValid(n)) {
        setShowErrors((prev) => ({ ...prev, [n]: true }));
        setSection(n);
        return false;
      }
    }
    setSection(target);
    return true;
  };

  const continueFrom = (n) => {
    setShowErrors((prev) => ({ ...prev, [n]: true }));
    if (!sectionValid(n)) {
      // Bring the first problem into view once the errors have rendered.
      window.requestAnimationFrame(() => {
        const target = document.querySelector('[aria-invalid="true"], [role="alert"]');
        target?.scrollIntoView({ behavior: "smooth", block: "center" });
        if (target?.matches?.("input, select, textarea, button")) target.focus({ preventScroll: true });
      });
      return;
    }
    if (n < 3) setSection(n + 1);
    else goToReview();
  };

  const goToReview = async () => {
    if (![1, 2, 3].every(sectionValid)) {
      setShowErrors({ 1: true, 2: true, 3: true });
      return;
    }
    setConfirmedCardPayment(null);
    setCardIntent(EMPTY_CARD_INTENT);
    try {
      const response = await quoteMutate(buildQuotePayload());
      setQuoteData(response.quote);
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setQuoteError(error?.response?.data?.message || "The price could not be calculated.");
      toast.error("Couldn't calculate the price", error?.response?.data?.message || "Please check your trip details.");
    }
  };

  // ---------- card intent (unchanged behaviour) ----------
  const paymentCurrency = displayCurrency(selectedTour?.currency || settings?.currency);
  const cardChargeAmount = useMemo(() => {
    if (!quoteData || !isCardPayment) return 0;
    return form.paymentPlan === "full" ? Number(quoteData.totalAmount || 0) : Number(quoteData.advanceAmount || 0);
  }, [quoteData, isCardPayment, form.paymentPlan]);
  const cardIntentKey = useMemo(
    () => (!quoteData || !isCardPayment ? "" : [form.paymentMethod, form.paymentPlan, paymentCurrency, cardChargeAmount].join(":")),
    [quoteData, isCardPayment, form.paymentMethod, form.paymentPlan, paymentCurrency, cardChargeAmount],
  );

  useEffect(() => {
    setConfirmedCardPayment(null);
    setCardIntent(EMPTY_CARD_INTENT);
  }, [cardIntentKey]);

  const { mutateAsync: createIntent } = createPaymentIntent;
  useEffect(() => {
    if (!isCardPayment || !quoteData || step !== 2) return undefined;
    if (!stripePublishableKey) {
      setCardIntent({ ...EMPTY_CARD_INTENT, requestKey: cardIntentKey, amount: cardChargeAmount, currency: paymentCurrency, error: "Card payments are not available right now. Please choose another payment method.", status: "error" });
      return undefined;
    }
    if (!cardChargeAmount) {
      setCardIntent({ ...EMPTY_CARD_INTENT, requestKey: cardIntentKey, currency: paymentCurrency, error: "Card amount must be greater than zero.", status: "error" });
      return undefined;
    }
    if (cardIntent.requestKey === cardIntentKey && ["loading", "ready"].includes(cardIntent.status)) return undefined;

    let ignore = false;
    (async () => {
      setCardIntent({ ...EMPTY_CARD_INTENT, requestKey: cardIntentKey, amount: cardChargeAmount, currency: paymentCurrency, status: "loading" });
      try {
        const result = await createIntent({
          amount: cardChargeAmount,
          currency: paymentCurrency,
          method: form.paymentMethod,
          customerName: form.customerName,
          email: form.email,
          phone: form.phone,
          paymentPlan: form.paymentPlan,
          bookingType,
          tourId: selectedTour?.id,
          tourTitle: selectedTour?.title,
        });
        if (ignore) return;
        setCardIntent({
          requestKey: cardIntentKey,
          clientSecret: result.clientSecret || "",
          paymentIntentId: result.paymentIntentId || "",
          amount: Number(result.amount || cardChargeAmount),
          currency: displayCurrency(result.currency || paymentCurrency),
          error: result.clientSecret ? "" : "Secure payment session could not be prepared.",
          status: result.clientSecret ? "ready" : "error",
        });
      } catch (error) {
        if (ignore) return;
        setCardIntent({ ...EMPTY_CARD_INTENT, requestKey: cardIntentKey, amount: cardChargeAmount, currency: paymentCurrency, error: error?.response?.data?.message || error?.message || "Unable to prepare secure card payment.", status: "error" });
      }
    })();
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCardPayment, quoteData, step, cardIntentKey, cardChargeAmount, paymentCurrency]);

  // ---------- submit ----------
  const buildBookingPayload = (paymentOverrides = {}) => ({
    ...buildQuotePayload(),
    flexibleDates: isCustomBooking ? form.flexibleDates : false,
    paymentMethod: form.paymentMethod,
    bookingType,
    isCustomTour: bookingType === "custom",
    paymentIntentId: paymentOverrides.paymentIntentId || "",
    transactionReference: paymentOverrides.transactionReference ?? form.transactionReference,
    manualPayment: isManualPayment
      ? {
          senderName: form.manualSenderName.trim(),
          senderNumber: form.manualSenderNumber.trim(),
          sentAmount: Number(form.manualSentAmount || 0),
          sentAt: form.manualSentAt || "",
          slip: form.manualPaymentSlip || "",
          slipName: form.manualPaymentSlipName || "",
        }
      : { senderName: "", senderNumber: "", sentAmount: 0, sentAt: "" },
    notes: [form.notes, selectedPaymentMethod?.instructions].filter(Boolean).join(" "),
  });

  const finishBookingSubmission = async (paymentOverrides = {}) => {
    const booking = await createBooking.mutateAsync(buildBookingPayload(paymentOverrides));
    setBookingResult(booking);
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitBooking = async (existingPayment = confirmedCardPayment) => {
    if (!quoteData) {
      toast.error("Price missing", "Please go back and check your trip details.");
      return;
    }
    setSubmitting(true);
    try {
      if (isCardPayment) {
        if (!existingPayment?.paymentIntentId) {
          toast.error("Payment required", "Complete the card payment first.");
          return;
        }
        await finishBookingSubmission({
          paymentIntentId: existingPayment.paymentIntentId,
          transactionReference: existingPayment.transactionReference || existingPayment.paymentIntentId,
        });
        return;
      }
      await finishBookingSubmission();
    } catch (error) {
      toast.error("Booking failed", error?.response?.data?.message || error?.message || "Unable to submit the booking.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCardPaymentConfirmed = async ({ paymentIntentId, transactionReference }) => {
    setSubmitting(true);
    try {
      const verification = await verifyPaymentIntent.mutateAsync({ paymentIntentId, method: form.paymentMethod, transactionReference });
      if (!verification?.verified) throw new Error("Card payment is not marked as succeeded yet. Please try again in a moment.");
      const paymentRecord = {
        requestKey: cardIntentKey,
        paymentIntentId,
        transactionReference: verification.transactionReference || transactionReference || paymentIntentId,
      };
      setConfirmedCardPayment(paymentRecord);
      try {
        await finishBookingSubmission({ paymentIntentId: paymentRecord.paymentIntentId, transactionReference: paymentRecord.transactionReference });
      } catch {
        toast.error("Booking submit failed", "Payment was confirmed. Press “Submit paid booking” to finish without charging the card again.");
      }
    } catch (error) {
      toast.error("Payment failed", error?.response?.data?.message || error?.message || "Card payment could not be verified.");
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setStep(1);
    setSection(1);
    setShowErrors({ 1: false, 2: false, 3: false });
    setForm({ ...DEFAULT_FORM, tourId: hasLockedTour ? form.tourId : tours[0]?.id || "", paymentMethod: paymentMethods[0]?.key || DEFAULT_FORM.paymentMethod });
    setQuoteData(null);
    setBookingResult(null);
    setCardIntent(EMPTY_CARD_INTENT);
    setConfirmedCardPayment(null);
  };

  return {
    settings,
    tours,
    toursLoading,
    form,
    setForm,
    step,
    setStep,
    section,
    goToSection,
    continueFrom,
    sectionValid,
    visibleErrors,
    isCustomBooking,
    hasLockedTour,
    selectedTour,
    availability,
    seatsLeft,
    hotelOptions,
    vehicleOptions,
    quoteData,
    quoteError,
    quoteLoading: quoteBooking.isPending,
    paymentMethods,
    selectedPaymentMethod,
    selectedReceivingAccount,
    isCardPayment,
    isManualPayment,
    isPayOnArrival,
    paymentCurrency,
    cardChargeAmount,
    cardIntent,
    confirmedCardPayment,
    submitting,
    submitBooking,
    handleCardPaymentConfirmed,
    bookingResult,
    reset,
    navigate,
  };
};
