import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, ChevronDown, CreditCard, ReceiptText, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import {
  useCreatePaymentIntent,
  useCreatePublicBooking,
  usePublicBookingQuote,
  usePublicTours,
  useSettings,
  useVerifyPaymentIntent,
} from "../hooks/useCms";
import { useToast } from "../context/ToastContext";

const DEFAULT_FORM = {
  customerName: "",
  email: "",
  phone: "",
  tourId: "",
  travelDate: "",
  endDate: "",
  travelTime: "",
  adults: 2,
  children: 0,
  flexibleDates: false,
  travelerType: "local",
  localIdType: "cnic",
  localIdNumber: "",
  country: "",
  passportNumber: "",
  paymentMethod: "visa_card",
  paymentPlan: "advance_10",
  transactionReference: "",
  facilities: {
    hotelEnabled: false,
    hotelType: "no_hotel",
    meals: "no",
    vehicleType: "",
    addOns: [],
  },
  customRequirements: "",
  specialRequirements: "",
  notes: "",
};

const FALLBACK_HOTELS = [
  { key: "no_hotel", label: "No Hotel" },
  { key: "standard", label: "Standard" },
  { key: "3_star", label: "3-Star" },
  { key: "4_star", label: "4-Star" },
  { key: "5_star", label: "5-Star" },
];

const FALLBACK_VEHICLES = [
  { key: "standard_suv", label: "Standard SUV" },
  { key: "premium_suv", label: "Premium SUV" },
];

const BookingDropdown = ({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const menuRef = useRef(null);
  const selectedOption = options.find((item) => item.value === value);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  useEffect(() => {
    if (!open) return;
    const rect = menuRef.current?.getBoundingClientRect();
    if (!rect) return;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropdownNeed = 270;
    setOpenUpward(spaceBelow < dropdownNeed && spaceAbove > spaceBelow);
  }, [open, options.length]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        className={`w-full rounded-2xl border px-4 py-3 text-left text-sm text-theme shadow-[0_5px_14px_rgba(123,231,196,0.18)] transition ${
          disabled
            ? "cursor-not-allowed border-[#d7e8e2] bg-[#f6faf8] text-muted shadow-none"
            : "border-[#89dfc3] bg-[#f2fff9] hover:border-[#67d7b2] hover:bg-[#e8fbf3]"
        }`}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span className="block truncate">
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {!disabled && open ? (
        <div
          className={`absolute z-[120] w-full overflow-hidden rounded-2xl border border-[#89dfc3] bg-white p-1.5 shadow-[0_16px_32px_rgba(15,23,42,0.16)] ${
            openUpward ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          <div className="max-h-60 overflow-auto space-y-1">
            {options.map((item) => {
              const isActive = item.value === value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${
                    isActive
                      ? "bg-[#7BE7C4] text-[#0F172A] font-semibold"
                      : "bg-[#f8fffc] text-theme hover:bg-[#dcf8ed]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const Booking = () => {
  const { tourId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: tours = [] } = usePublicTours();
  const { data: settings } = useSettings(true);
  const quoteBooking = usePublicBookingQuote();
  const createBooking = useCreatePublicBooking();
  const createPaymentIntent = useCreatePaymentIntent();
  const verifyPaymentIntent = useVerifyPaymentIntent();

  const [form, setForm] = useState(DEFAULT_FORM);
  const [step, setStep] = useState(1);
  const [activeSection, setActiveSection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [quoteData, setQuoteData] = useState(null);
  const [paymentIntentData, setPaymentIntentData] = useState(null);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  const isCustomBooking = location.pathname.startsWith("/custom-booking") || location.state?.bookingType === "custom";
  const isStandardBooking = !isCustomBooking;
  const hasLockedTour = Boolean(tourId);
  const bookingType = isCustomBooking ? "custom" : "standard";
  const allowManualVerification = settings?.paymentConfig?.allowManualVerification !== false;
  const action = location.state?.action || "book";

  useEffect(() => {
    if (!tours.length) return;
    if (hasLockedTour) {
      const selected = tours.find((tour) => tour.id === tourId);
      if (!selected) {
        toast.error("Tour unavailable", "Selected tour could not be loaded.");
        navigate("/tours");
        return;
      }
      setForm((prev) => ({ ...prev, tourId: selected.id }));
    } else {
      setForm((prev) => ({ ...prev, tourId: prev.tourId || tours[0].id }));
    }
  }, [tours, tourId, hasLockedTour, toast, navigate]);

  useEffect(() => {
    const prefill = location.state?.prefill;
    if (!prefill) return;
    setForm((prev) => ({
      ...prev,
      customerName: prefill.customerName || prev.customerName,
      email: prefill.email || prev.email,
      phone: prefill.phone || prev.phone,
      travelDate: prefill.travelDate || prev.travelDate,
      adults: Number(prefill.adults || prev.adults || 1),
      specialRequirements: prefill.specialRequirements || prev.specialRequirements,
    }));
  }, [location.state]);

  const selectedTour = useMemo(
    () => tours.find((tour) => tour.id === form.tourId),
    [tours, form.tourId],
  );
  const popularPlans = useMemo(
    () =>
      [...tours]
        .sort((a, b) => {
          const scoreA = Number(Boolean(a.featured)) * 2 + Number(a.availableSeats || 0);
          const scoreB = Number(Boolean(b.featured)) * 2 + Number(b.availableSeats || 0);
          return scoreB - scoreA;
        })
        .slice(0, 3),
    [tours],
  );

  const hotelOptions = useMemo(
    () =>
      settings?.bookingPricing?.hotelCategories?.filter((x) => x.active !== false) || FALLBACK_HOTELS,
    [settings],
  );
  const vehicleOptions = useMemo(
    () =>
      settings?.bookingPricing?.vehicleTypes?.filter((x) => x.active !== false) || FALLBACK_VEHICLES,
    [settings],
  );

  const visibleHotelOptions = useMemo(() => {
    if (!hasLockedTour || !selectedTour?.availableOptions?.hotelCategories?.length) {
      return hotelOptions;
    }
    const allowed = new Set(selectedTour.availableOptions.hotelCategories);
    return hotelOptions.filter((option) => option.key === "no_hotel" || allowed.has(option.key));
  }, [hasLockedTour, selectedTour, hotelOptions]);

  const visibleVehicleOptions = useMemo(() => {
    if (!hasLockedTour || !selectedTour?.availableOptions?.vehicleTypes?.length) {
      return vehicleOptions;
    }
    const allowed = new Set(selectedTour.availableOptions.vehicleTypes);
    return vehicleOptions.filter((option) => allowed.has(option.key));
  }, [hasLockedTour, selectedTour, vehicleOptions]);

  useEffect(() => {
    if (!form.facilities.vehicleType && visibleVehicleOptions.length) {
      setForm((prev) => ({
        ...prev,
        facilities: { ...prev.facilities, vehicleType: visibleVehicleOptions[0].key },
      }));
    }
  }, [visibleVehicleOptions, form.facilities.vehicleType]);

  const validateForm = () => {
    if (!form.customerName.trim()) return "Full name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!form.phone.trim()) return "Phone number is required.";
    if (!form.tourId) return "Please select a tour.";
    if (!form.flexibleDates && !form.travelDate) return "Please provide a travel date.";
    if (form.travelDate && form.endDate && form.endDate < form.travelDate) return "End date cannot be before travel date.";
    if (Number(form.adults) < 1) return "At least one adult is required.";
    if (form.travelerType === "local" && !form.localIdNumber.trim()) return "CNIC/Passport is required.";
    if (form.travelerType === "international" && (!form.country.trim() || !form.passportNumber.trim())) {
      return "Country and passport number are required.";
    }
    if (!form.facilities.vehicleType) return "Please select a vehicle type.";
    return "";
  };

  const isTravelerSectionValid = useMemo(
    () =>
      Boolean(
        form.customerName.trim() &&
          form.email.trim() &&
          form.phone.trim() &&
          form.tourId,
      ),
    [form.customerName, form.email, form.phone, form.tourId],
  );

  const isTravelSectionValid = useMemo(() => {
    const dateValid = form.flexibleDates || Boolean(form.travelDate);
    const endDateValid = !form.travelDate || !form.endDate || form.endDate >= form.travelDate;
    const guestValid = Number(form.adults) >= 1;
    const identityValid =
      form.travelerType === "local"
        ? Boolean(form.localIdNumber.trim())
        : Boolean(form.country.trim() && form.passportNumber.trim());
    return dateValid && endDateValid && guestValid && identityValid;
  }, [
    form.flexibleDates,
    form.travelDate,
    form.endDate,
    form.adults,
    form.travelerType,
    form.localIdNumber,
    form.country,
    form.passportNumber,
  ]);

  const isPreferencesSectionValid = useMemo(
    () => Boolean(form.facilities.vehicleType),
    [form.facilities.vehicleType],
  );

  const requestQuote = async () => {
    const validationError = validateForm();
    if (validationError) {
      toast.error("Validation failed", validationError);
      return;
    }

    try {
      const payload = {
        ...form,
        facilities: {
          ...form.facilities,
          hotelType: form.facilities.hotelEnabled ? form.facilities.hotelType : "no_hotel",
        },
      };
      const response = await quoteBooking.mutateAsync(payload);
      setQuoteData(response.quote);
      setStep(2);
      setPaymentVerified(form.paymentMethod === "pay_on_arrival");
    } catch (error) {
      toast.error("Quote failed", error?.response?.data?.message || "Could not calculate quote.");
    }
  };

  const verifyPayment = async () => {
    if (!quoteData) {
      toast.error("Quote required", "Please calculate quote first.");
      return;
    }

    if (form.paymentMethod === "pay_on_arrival") {
      setPaymentVerified(true);
      toast.success("Payment status", "Pay-on-arrival selected.");
      return;
    }

    if (form.paymentMethod === "visa_card") {
      setVerifyingPayment(true);
      try {
        const intent = await createPaymentIntent.mutateAsync({
          amount: quoteData.advanceAmount,
          currency: selectedTour?.currency || settings?.currency || "USD",
          method: form.paymentMethod,
        });
        setPaymentIntentData(intent);

        const verify = await verifyPaymentIntent.mutateAsync({
          paymentIntentId: intent.paymentIntentId,
          method: form.paymentMethod,
        });
        if (!verify.verified) {
          toast.error("Payment not verified", "Card payment is not verified yet.");
          setPaymentVerified(false);
          return;
        }
        setForm((prev) => ({
          ...prev,
          transactionReference: verify.transactionReference || prev.transactionReference,
        }));
        setPaymentVerified(true);
        toast.success("Payment verified", "Card payment has been verified.");
      } catch (error) {
        toast.error("Payment verification failed", error?.response?.data?.message || "Try again.");
      } finally {
        setVerifyingPayment(false);
      }
      return;
    }

    if (!form.transactionReference.trim()) {
      toast.error("Reference required", "Enter transaction reference for manual verification.");
      return;
    }

    if (!allowManualVerification) {
      toast.error("Verification required", "Manual payment verification is disabled.");
      return;
    }

    setPaymentVerified(false);
    toast.info("Pending admin verification", "Booking can proceed and admin will verify payment.");
  };

  const canConfirmBooking = useMemo(() => {
    if (!quoteData) return false;
    if (form.paymentMethod === "pay_on_arrival") return true;
    if (form.paymentMethod === "visa_card") return paymentVerified;
    return paymentVerified || (allowManualVerification && Boolean(form.transactionReference.trim()));
  }, [quoteData, form.paymentMethod, form.transactionReference, paymentVerified, allowManualVerification]);

  useEffect(() => {
    if (form.paymentMethod !== "visa_card") {
      setPaymentVerified(form.paymentMethod === "pay_on_arrival" ? true : false);
      setPaymentIntentData(null);
    }
  }, [form.paymentMethod]);

  const submitBooking = async () => {
    if (!quoteData) {
      toast.error("Quote missing", "Please calculate quote first.");
      return;
    }
    if (!canConfirmBooking) {
      toast.error("Payment not ready", "Complete payment verification before confirming booking.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        bookingType,
        isCustomTour: bookingType === "custom",
        paymentVerified: form.paymentMethod === "visa_card" ? paymentVerified : false,
        paymentIntentId: paymentIntentData?.paymentIntentId || "",
        facilities: {
          ...form.facilities,
          hotelType: form.facilities.hotelEnabled ? form.facilities.hotelType : "no_hotel",
        },
      };

      const booking = await createBooking.mutateAsync(payload);
      setBookingResult(booking);
      setStep(3);
      toast.success("Booking confirmed", "Confirmation workflow has been triggered.");
    } catch (error) {
      toast.error("Booking failed", error?.response?.data?.message || "Unable to confirm booking.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-theme-bg py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="ql-form-shell booking-form-shell">
          <div className="ql-form-header">
            <p className="ql-form-subtitle">
              {isCustomBooking ? "Custom Booking Route" : "Standard Booking Route"}
            </p>
            <h1 className="ql-form-title mt-1 !text-white">
              {isCustomBooking ? "Custom Tour Booking" : "Standard Tour Booking"}
              {action === "waitlist" ? " (Waitlist)" : ""}
            </h1>
          </div>

          {step === 1 ? (
            <div className="p-7">
              <div className="grid xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
                <div className="space-y-5">
                  {isStandardBooking && selectedTour ? (
                    <div className="rounded-2xl border border-theme bg-theme-surface p-4 shadow-[0_8px_16px_rgba(15,23,42,0.06)]">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-subheading">
                        Booking Summary
                      </p>
                      <div className="mt-3 grid md:grid-cols-3 gap-3 md:gap-4 items-center">
                        <p className="text-base font-semibold text-heading leading-tight">{selectedTour.title}</p>
                        <p className="text-sm text-subheading">
                          {selectedTour.location} | {selectedTour.durationLabel || `${selectedTour.durationDays} Days`}
                        </p>
                        <p className="justify-self-start md:justify-self-end inline-flex items-center rounded-full border border-[var(--c-brand)]/35 bg-[var(--c-brand)]/12 px-3 py-1 text-sm font-bold text-accent">
                          {selectedTour.currency} {Number(selectedTour.price || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  <div className="rounded-2xl border border-theme bg-theme-surface p-3.5 shadow-[0_10px_20px_rgba(15,23,42,0.06)]">
                    <div className="grid sm:grid-cols-3 gap-2">
                      {[
                        { id: 1, label: "Traveler" },
                        { id: 2, label: "Travel" },
                        { id: 3, label: "Preferences" },
                      ].map((item) => {
                        const canOpen =
                          item.id === 1 ||
                          (item.id === 2 && isTravelerSectionValid) ||
                          (item.id === 3 && isTravelerSectionValid && isTravelSectionValid);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              if (canOpen) setActiveSection(item.id);
                              else toast.info("Complete previous section", "Please fill previous section first.");
                            }}
                            className={`rounded-xl border px-3 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] transition ${
                              activeSection === item.id
                                ? "border-[var(--c-brand)]/65 bg-[var(--c-brand)]/15 text-theme shadow-[0_8px_18px_rgba(123,231,196,0.28)]"
                                : canOpen
                                  ? "border-theme bg-theme-bg text-heading hover:border-[var(--c-brand)]/35 hover:bg-white"
                                  : "border-theme bg-theme-bg text-muted opacity-60 cursor-not-allowed"
                            }`}
                          >
                            {item.id}. {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {activeSection === 1 ? (
                    <div className="rounded-2xl border border-theme bg-theme-surface p-4 md:p-5 shadow-[0_8px_16px_rgba(15,23,42,0.06)]">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-subheading mb-4">
                      Traveler Details
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <label>
                        <span className="ql-label">Full Name</span>
                        <input
                          className="ql-input"
                          placeholder="e.g. Ali Khan"
                          value={form.customerName}
                          onChange={(e) => setForm((p) => ({ ...p, customerName: e.target.value }))}
                        />
                      </label>
                      <label>
                        <span className="ql-label">Email</span>
                        <input
                          type="email"
                          className="ql-input"
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                        />
                      </label>
                      <label>
                        <span className="ql-label">Phone</span>
                        <input
                          type="tel"
                          className="ql-input"
                          placeholder="+92 3XX XXX XXXX"
                          value={form.phone}
                          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                        />
                      </label>
                      <label>
                        <span className="ql-label">
                          {hasLockedTour ? "Selected Tour" : isCustomBooking ? "Preferred Tour" : "Tour"}
                        </span>
                        <BookingDropdown
                          value={form.tourId}
                          disabled={hasLockedTour}
                          placeholder="Select a tour"
                          onChange={(nextValue) => setForm((p) => ({ ...p, tourId: nextValue }))}
                          options={tours.map((tour) => ({
                            value: tour.id,
                            label: `${tour.title} - ${tour.location}`,
                          }))}
                        />
                      </label>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        className="ql-btn-primary"
                        disabled={!isTravelerSectionValid}
                        onClick={() => setActiveSection(2)}
                      >
                        Next: Travel
                      </button>
                    </div>
                  </div>
                  ) : null}

                  {activeSection === 2 ? (
                    <div className="rounded-2xl border border-theme bg-theme-surface p-4 md:p-5 shadow-[0_8px_16px_rgba(15,23,42,0.06)]">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-subheading mb-4">
                      Travel Preferences
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <label>
                        <span className="ql-label">Travel Date</span>
                        <input
                          type="date"
                          className="ql-input"
                          disabled={form.flexibleDates}
                          value={form.travelDate}
                          onChange={(e) => setForm((p) => ({ ...p, travelDate: e.target.value }))}
                        />
                      </label>
                      <label>
                        <span className="ql-label">End Date</span>
                        <input
                          type="date"
                          className="ql-input"
                          value={form.endDate}
                          onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                        />
                        {form.travelDate && form.endDate && form.endDate < form.travelDate ? (
                          <span className="mt-1 block text-xs text-red-500">End date cannot be before travel date.</span>
                        ) : null}
                      </label>
                      <label className="md:col-span-2 inline-flex items-center gap-2 text-sm text-textMuted">
                        <input
                          type="checkbox"
                          className="ql-check"
                          checked={form.flexibleDates}
                          onChange={(e) => setForm((p) => ({ ...p, flexibleDates: e.target.checked }))}
                        />
                        My dates are flexible
                      </label>

                      <label>
                        <span className="ql-label">Preferred Departure Time</span>
                        <BookingDropdown
                          value={form.travelTime}
                          placeholder="No Preference"
                          onChange={(nextValue) => setForm((p) => ({ ...p, travelTime: nextValue }))}
                          options={[
                            { value: "", label: "No Preference" },
                            { value: "early_morning", label: "Early Morning (6am - 9am)" },
                            { value: "morning", label: "Morning (9am - 12pm)" },
                            { value: "afternoon", label: "Afternoon (12pm - 4pm)" },
                            { value: "evening", label: "Evening (4pm - 8pm)" },
                          ]}
                        />
                      </label>
                      <label>
                        <span className="ql-label">Traveler Type</span>
                        <BookingDropdown
                          value={form.travelerType}
                          onChange={(nextValue) => setForm((p) => ({ ...p, travelerType: nextValue }))}
                          options={[
                            { value: "local", label: "Pakistani Resident" },
                            { value: "international", label: "International Visitor" },
                          ]}
                        />
                      </label>

                      <label>
                        <span className="ql-label">Adults</span>
                        <input
                          type="number"
                          min={1}
                          className="ql-input"
                          value={form.adults}
                          onChange={(e) => setForm((p) => ({ ...p, adults: Number(e.target.value || 1) }))}
                        />
                      </label>
                      <label>
                        <span className="ql-label">Children</span>
                        <input
                          type="number"
                          min={0}
                          className="ql-input"
                          value={form.children}
                          onChange={(e) => setForm((p) => ({ ...p, children: Number(e.target.value || 0) }))}
                        />
                      </label>

                      {form.travelerType === "local" ? (
                        <>
                          <label>
                            <span className="ql-label">Local ID Type</span>
                            <BookingDropdown
                              value={form.localIdType}
                              onChange={(nextValue) => setForm((p) => ({ ...p, localIdType: nextValue }))}
                              options={[
                                { value: "cnic", label: "CNIC" },
                                { value: "passport", label: "Passport" },
                              ]}
                            />
                          </label>
                          <label>
                            <span className="ql-label">{form.localIdType === "passport" ? "Passport Number" : "CNIC Number"}</span>
                            <input
                              className="ql-input"
                              placeholder={form.localIdType === "passport" ? "AA1234567" : "12345-1234567-1"}
                              value={form.localIdNumber}
                              onChange={(e) => setForm((p) => ({ ...p, localIdNumber: e.target.value }))}
                            />
                          </label>
                        </>
                      ) : (
                        <>
                          <label>
                            <span className="ql-label">Passport Number</span>
                            <input
                              className="ql-input"
                              placeholder="Passport Number"
                              value={form.passportNumber}
                              onChange={(e) => setForm((p) => ({ ...p, passportNumber: e.target.value }))}
                            />
                          </label>
                          <label>
                            <span className="ql-label">Country</span>
                            <input
                              className="ql-input"
                              placeholder="Country of Residence"
                              value={form.country}
                              onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                            />
                          </label>
                        </>
                      )}
                    </div>
                    <div className="mt-4 flex justify-between gap-3">
                      <button type="button" className="ql-btn-secondary" onClick={() => setActiveSection(1)}>
                        Back
                      </button>
                      <button
                        type="button"
                        className="ql-btn-primary"
                        disabled={!isTravelSectionValid}
                        onClick={() => setActiveSection(3)}
                      >
                        Next: Preferences
                      </button>
                    </div>
                  </div>
                  ) : null}

                  {activeSection === 3 ? (
                    <div className="rounded-2xl border border-theme bg-theme-surface p-4 md:p-5 space-y-4 shadow-[0_8px_16px_rgba(15,23,42,0.06)]">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-subheading mb-1">
                        Preferences
                      </p>
                      <label>
                        <span className="ql-label">Special Requirements</span>
                        <textarea
                          className="ql-textarea"
                          rows={3}
                          placeholder="Dietary preferences, accessibility needs, or trip notes."
                          value={form.specialRequirements}
                          onChange={(e) => setForm((p) => ({ ...p, specialRequirements: e.target.value }))}
                        />
                      </label>

                      {bookingType === "custom" ? (
                        <label>
                          <span className="ql-label">Custom Requirements</span>
                          <textarea
                            className="ql-textarea"
                            rows={3}
                            placeholder="Share route changes, stops, comfort preferences, or special requests."
                            value={form.customRequirements}
                            onChange={(e) => setForm((p) => ({ ...p, customRequirements: e.target.value }))}
                          />
                        </label>
                      ) : null}

                      <label className="inline-flex items-center gap-2 text-sm text-textMain">
                        <input
                          type="checkbox"
                          className="ql-check"
                          checked={form.facilities.hotelEnabled}
                          onChange={(e) => setForm((p) => ({ ...p, facilities: { ...p.facilities, hotelEnabled: e.target.checked } }))}
                        />
                        Include Hotel Stay
                      </label>

                      <div className="grid md:grid-cols-2 gap-4">
                        <label>
                          <span className="ql-label">Hotel Category</span>
                          <BookingDropdown
                            value={form.facilities.hotelType}
                            disabled={!form.facilities.hotelEnabled}
                            onChange={(nextValue) =>
                              setForm((p) => ({ ...p, facilities: { ...p.facilities, hotelType: nextValue } }))
                            }
                            options={visibleHotelOptions.map((item) => ({
                              value: item.key,
                              label: item.label,
                            }))}
                          />
                        </label>
                        <label>
                          <span className="ql-label">Meals</span>
                          <BookingDropdown
                            value={form.facilities.meals}
                            onChange={(nextValue) =>
                              setForm((p) => ({ ...p, facilities: { ...p.facilities, meals: nextValue } }))
                            }
                            options={[
                              { value: "no", label: "No Meals" },
                              { value: "yes", label: "Include Meals" },
                            ]}
                          />
                        </label>
                        <label className="md:col-span-2">
                          <span className="ql-label">Vehicle Type</span>
                          <BookingDropdown
                            value={form.facilities.vehicleType}
                            onChange={(nextValue) =>
                              setForm((p) => ({ ...p, facilities: { ...p.facilities, vehicleType: nextValue } }))
                            }
                            options={visibleVehicleOptions.map((item) => ({
                              value: item.key,
                              label: item.label,
                            }))}
                          />
                        </label>
                      </div>

                      <div className="flex justify-between gap-3 mt-2">
                        <button type="button" className="ql-btn-secondary" onClick={() => setActiveSection(2)}>
                          Back
                        </button>
                        <div className="flex gap-2">
                          <button type="button" className="ql-btn-secondary" onClick={() => navigate("/tours")}>
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="ql-btn-primary"
                            disabled={!isTravelerSectionValid || !isTravelSectionValid || !isPreferencesSectionValid}
                            onClick={requestQuote}
                          >
                            <CheckCircle2 size={16} /> Continue to Review
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                <aside className="space-y-4 xl:sticky xl:top-24">
                  <div className="rounded-3xl border border-[#cfe9de] bg-[linear-gradient(180deg,#f8fffc_0%,#f1faf6_100%)] p-4 shadow-[0_14px_28px_rgba(15,23,42,0.10)]">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#4f6574]">
                        Most Popular Tour Plans
                      </p>
                      <span className="inline-flex items-center rounded-full border border-[#9fe7cf] bg-[#e9fbf4] px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.14em] text-[#2b7d63]">
                        Updated
                      </span>
                    </div>
                    <div className="mt-3.5 space-y-3">
                      {popularPlans.map((plan) => (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, tourId: plan.id }))}
                          className={`w-full text-left rounded-2xl border px-4 py-3.5 transition-all duration-300 ${
                            form.tourId === plan.id
                              ? "border-[#56c9a8] bg-[linear-gradient(180deg,#dff8ee_0%,#cff3e5_100%)] shadow-[0_12px_22px_rgba(83,191,158,0.28)]"
                              : "border-[#d7e6df] bg-[#fbfffd] hover:-translate-y-0.5 hover:border-[#8cdbc1] hover:bg-[#f1fcf7] hover:shadow-[0_10px_18px_rgba(15,23,42,0.10)]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[0.98rem] font-semibold text-[#2e4352] leading-tight line-clamp-2">{plan.title}</p>
                            {plan.featured ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-[#9fe7cf] bg-[#e7fbf3] px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.16em] text-[#2b7d63]">
                                <Sparkles size={10} />
                                Hot
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-2 text-[12px] text-[#647a8a]">
                            {plan.location} | {plan.durationLabel || `${plan.durationDays} Days`}
                          </p>
                          <p className="mt-2.5 text-lg font-bold text-[#345060]">
                            {plan.currency} {Number(plan.price || 0).toLocaleString()}
                          </p>
                        </button>
                      ))}
                    </div>
                    <Link
                      to="/tours"
                      className="mt-3.5 inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#cfe9de] bg-white px-3.5 py-2.5 text-[11px] font-semibold text-[#4b6271] hover:border-[#8cdbc1] hover:bg-[#effcf6] hover:text-[#2b7d63] transition"
                    >
                      View all tours
                      <Sparkles size={12} />
                    </Link>
                  </div>

                </aside>
              </div>

            </div>
          ) : null}

          {step === 2 ? (
            <div className="p-7 space-y-4">
              <div className="ql-soft-card space-y-1 text-sm">
                <p className="font-semibold text-heading">Backend Quote (Daily-Based)</p>
                <p>Duration: {quoteData?.days} day(s)</p>
                <p>Guests: {quoteData?.guests}</p>
                <p>Total: {selectedTour?.currency || "USD"} {quoteData?.totalAmount}</p>
                <p>Advance due now: {selectedTour?.currency || "USD"} {quoteData?.advanceAmount}</p>
                <p>Remaining: {selectedTour?.currency || "USD"} {quoteData?.remainingAmount}</p>
              </div>

              <label>
                <span className="ql-label">Payment Method</span>
                <BookingDropdown
                  value={form.paymentMethod}
                  onChange={(nextValue) => setForm((p) => ({ ...p, paymentMethod: nextValue }))}
                  options={[
                    { value: "visa_card", label: "Visa / Card" },
                    { value: "easypaisa", label: "EasyPaisa" },
                    { value: "jazzcash", label: "JazzCash" },
                    { value: "pay_on_arrival", label: "Pay on Arrival" },
                  ]}
                />
              </label>
              <label>
                <span className="ql-label">Payment Plan</span>
                <BookingDropdown
                  value={form.paymentPlan}
                  disabled={form.paymentMethod === "pay_on_arrival"}
                  onChange={(nextValue) => setForm((p) => ({ ...p, paymentPlan: nextValue }))}
                  options={[
                    { value: "advance_10", label: "10% Advance" },
                    { value: "full", label: "Full Payment" },
                  ]}
                />
              </label>
              <label>
                <span className="ql-label">Transaction Reference (manual methods)</span>
                <input className="ql-input" value={form.transactionReference} onChange={(e) => setForm((p) => ({ ...p, transactionReference: e.target.value }))} />
              </label>

              <div className="rounded-xl border border-light bg-bgSection p-4 text-sm">
                <p className="flex items-center gap-2 font-semibold text-heading">
                  <ShieldCheck size={16} className="ql-icon" />
                  Payment Verification
                </p>
                <p className="mt-1 text-textMuted">
                  {paymentVerified
                    ? "Payment verified. You can confirm booking."
                    : "Verification is required for card payments. Manual methods can proceed with admin verification."}
                </p>
              </div>

              <div className="flex flex-wrap justify-between gap-2">
                <button type="button" className="ql-btn-secondary" onClick={() => setStep(1)}>Back</button>
                <div className="flex gap-2">
                  <button type="button" className="ql-btn-secondary" onClick={verifyPayment} disabled={verifyingPayment}>
                    {verifyingPayment ? "Verifying..." : "Verify Payment"}
                  </button>
                  <button type="button" className="ql-btn-primary" disabled={submitting || !canConfirmBooking} onClick={submitBooking}>
                    <CreditCard size={16} />
                    {submitting ? "Confirming..." : "Confirm Booking"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="p-7 space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                <h2 className="text-lg font-semibold text-emerald-800">Booking Confirmed</h2>
                <p className="text-sm text-emerald-700 mt-2">Booking code: <span className="font-semibold">{bookingResult?.bookingCode}</span></p>
                <p className="text-sm text-emerald-700 mt-1">Status: {bookingResult?.payment}</p>
              </div>
              <div className="ql-soft-card text-sm space-y-1">
                <p className="font-semibold flex items-center gap-2 text-heading"><ReceiptText size={16} className="ql-icon" /> Summary</p>
                <p>Total: {bookingResult?.currency || "USD"} {bookingResult?.amount || 0}</p>
                <p>Advance: {bookingResult?.currency || "USD"} {bookingResult?.advanceAmount || 0}</p>
                <p>Remaining: {bookingResult?.currency || "USD"} {bookingResult?.remainingAmount || 0}</p>
              </div>
              <div className="flex justify-between gap-3">
                <button type="button" className="ql-btn-secondary" onClick={() => navigate("/tours")}>Back to Tours</button>
                <button type="button" className="ql-btn-primary" onClick={() => {
                  setStep(1);
                  setActiveSection(1);
                  setForm({
                    ...DEFAULT_FORM,
                    tourId: isStandardBooking ? tourId : tours[0]?.id || "",
                  });
                  setQuoteData(null);
                  setPaymentIntentData(null);
                  setPaymentVerified(false);
                  setBookingResult(null);
                }}>
                  <RotateCcw size={16} />
                  Revert Back to Form
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default Booking;
