import { useEffect, useState } from "react";
import { useParams } from "@/lib/router";
import { BadgeCheck, CalendarX2, CheckCheck, ExternalLink, FileText, History, PencilLine, Printer, RotateCcw, Wallet, XCircle } from "lucide-react";
import { useAdminTours, useBooking, useBookingTransition, useConfirmBookingPayment, useUpdateBooking } from "../../hooks/useCms";
import { useToast } from "../../context/ToastContext";
import { html } from "../../lib/html.mjs";
import { formatCurrencyAmount } from "../../utils/currency";
import { Badge, Button, Card, DetailList, EmptyState, ErrorState, PageHeader, Skeleton, StatusBadge, useConfirm } from "../ui";
import { BookingStepper, DetailSection, Fact, TextSection, formatDate, hasValue, humanize } from "./BookingDetailParts";
import ItineraryDrawer from "./ItineraryDrawer";

const prettifyValue = (value, fallback = "-") => {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value).replace(/_/g, " ");
};

const parseCustomRequest = (value = "") =>
  String(value || "")
    .split(/\r?\n/)
    .reduce((acc, line) => {
      const index = line.indexOf(":");
      if (index === -1) return acc;
      const key = line.slice(0, index).trim();
      const fieldValue = line.slice(index + 1).trim();
      if (key) acc[key] = fieldValue;
      return acc;
    }, {});

const getCustomRequestDetails = (booking) => {
  const fallback = parseCustomRequest(booking.customRequirements);
  const custom = booking.customRequest || {};
  const preferredDestinationsList = Array.isArray(custom.preferredDestinations) && custom.preferredDestinations.length
    ? custom.preferredDestinations
    : String(fallback["Preferred Destinations"] || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .filter((item) => item.toLowerCase() !== "flexible");

  return {
    preferredDestinations: preferredDestinationsList.length ? preferredDestinationsList.join(", ") : "Flexible",
    sourceTourTitle: custom.sourceTourTitle || fallback["Source Tour"] || booking.tour || "Not linked",
    startDate: custom.startDate || fallback["Start Date"] || "Flexible",
    endDate: custom.endDate || fallback["End Date"] || "Flexible",
    persons: custom.persons || fallback["Persons"] || booking.groupSize || "-",
    childrenBelowThree: custom.childrenBelowThree ?? fallback["Children below 3 years"] ?? booking.children ?? 0,
    budget: custom.budget || fallback["Budget"] || "Not specified",
    budgetMode: custom.budgetMode || fallback["Budget Mode"] || "Not specified",
    hotelPreference: custom.hotelPreference || fallback["Hotel Preference"] || booking.facilities?.hotelType || "Not selected",
    vehiclePreference: custom.vehiclePreference || fallback["Vehicle Preference"] || booking.facilities?.vehicleType || "Not selected",
    requirements: custom.requirements || fallback["Requirements"] || booking.specialRequirements || "None",
  };
};

const getStandardBookingDetails = (booking, fallbackTour = null) => {
  const tourDetails = booking.tourDetails || fallbackTour || {};
  const fallbackDuration = tourDetails.durationDays
    ? `${tourDetails.durationDays} Day${tourDetails.durationDays > 1 ? "s" : ""}`
    : "";

  return {
    tourTitle: tourDetails.title || booking.tour || "Selected Tour",
    route: tourDetails.location || booking.tour || "Selected Tour",
    travelDate: booking.date ? new Date(booking.date).toLocaleDateString() : "Flexible",
    hotelPreference: booking.facilities?.hotelType || "Not selected",
    vehiclePreference: booking.facilities?.vehicleType || "Not selected",
    requirements: booking.specialRequirements || booking.notes || tourDetails.description || tourDetails.shortDescription || "",
    durationLabel: tourDetails.durationLabel || fallbackDuration,
    finalBudget: Number(booking.amount || booking.totalAmount || tourDetails.price || 0),
    currency: booking.currency || tourDetails.currency || "PKR",
    itinerary: Array.isArray(tourDetails.itinerary) ? tourDetails.itinerary : [],
    description: tourDetails.description || tourDetails.shortDescription || "",
  };
};

const parseLegacyPlanDays = (value = "") => {
  const text = String(value || "").trim();
  if (!text) return [];

  const lines = text.replace(/\r\n/g, "\n").split(/\n/);
  const days = [];
  let currentDay = null;

  lines.forEach((rawLine) => {
    const line = String(rawLine || "").trim();
    if (!line) return;

    const dayMatch = line.match(/^Day\s*(\d+)\s*:\s*(.*)$/i);
    if (dayMatch) {
      if (currentDay) days.push(currentDay);
      currentDay = {
        title: dayMatch[2].trim(),
        planLines: [],
      };
      return;
    }

    if (currentDay) {
      currentDay.planLines.push(line);
    }
  });

  if (currentDay) days.push(currentDay);

  if (days.length) {
    return days.map((item, index) => ({
      title: item.title || `Day ${index + 1}`,
      plan: item.planLines.join("\n").trim(),
    }));
  }

  return [
    {
      title: "",
      plan: text,
    },
  ];
};

const createItineraryDraft = (booking, context, isCustomBooking) => {
  const savedItinerary = booking.customItinerary || {};
  const legacyPlanDays = parseLegacyPlanDays(savedItinerary.planDetails || "");
  const savedPlanDays = Array.isArray(savedItinerary.planDays)
    ? savedItinerary.planDays
        .map((item) => ({
          title: item?.title || "",
          plan: item?.plan || "",
        }))
        .filter((item) => item.title || item.plan)
    : [];
  const standardTourPlanDays = !isCustomBooking && Array.isArray(context.itinerary) && context.itinerary.length
    ? context.itinerary.map((item, index) => ({
        title: item?.title || `Day ${item?.day || index + 1}`,
        plan: item?.description || "",
      }))
    : [];
  const preferredRoute = isCustomBooking
    ? (context.preferredDestinations !== "Flexible" ? context.preferredDestinations : context.sourceTourTitle)
    : context.route;
  const fallbackDuration = isCustomBooking
    ? [context.startDate, context.endDate].filter(Boolean).filter((item) => item !== "Flexible").join(" - ") || "Custom Duration"
    : context.durationLabel || context.travelDate || booking.travelTime || "Scheduled Tour";
  const fallbackBudget = isCustomBooking
    ? Number(String(context.budget || "0").replace(/[^\d.]/g, "")) || 0
    : Number(context.finalBudget || booking.amount || booking.totalAmount || 0);
  const hasMeaningfulSavedItinerary = Boolean(
    String(savedItinerary.title || "").trim() ||
    String(savedItinerary.route || "").trim() ||
    String(savedItinerary.durationLabel || "").trim() ||
    Number(savedItinerary.finalBudget || 0) > 0 ||
    String(savedItinerary.hotelPlan || "").trim() ||
    String(savedItinerary.vehiclePlan || "").trim() ||
    String(savedItinerary.planDetails || "").trim() ||
    savedPlanDays.length ||
    legacyPlanDays.length
  );

  return {
    planDays: savedPlanDays.length
      ? savedPlanDays
      : legacyPlanDays.length
        ? legacyPlanDays
        : standardTourPlanDays.length
          ? standardTourPlanDays
          : [
              {
                title: "",
                plan: context.requirements && context.requirements !== "None" ? context.requirements : "",
              },
            ],
    title: hasMeaningfulSavedItinerary && savedItinerary.title
      ? savedItinerary.title
      : `${isCustomBooking ? booking.customer : context.tourTitle || booking.tour || booking.customer} Itinerary`,
    route: hasMeaningfulSavedItinerary && savedItinerary.route ? savedItinerary.route : preferredRoute || booking.tour || "",
    durationLabel: hasMeaningfulSavedItinerary && savedItinerary.durationLabel ? savedItinerary.durationLabel : fallbackDuration,
    finalBudget: hasMeaningfulSavedItinerary && Number(savedItinerary.finalBudget || 0) > 0 ? savedItinerary.finalBudget : fallbackBudget,
    currency: (hasMeaningfulSavedItinerary && savedItinerary.currency) || context.currency || booking.currency || "PKR",
    hotelPlan: hasMeaningfulSavedItinerary && savedItinerary.hotelPlan ? savedItinerary.hotelPlan : prettifyValue(context.hotelPreference, "Not selected"),
    vehiclePlan: hasMeaningfulSavedItinerary && savedItinerary.vehiclePlan ? savedItinerary.vehiclePlan : prettifyValue(context.vehiclePreference, "Not selected"),
    planDetails: legacyPlanDays.length ? "" : savedItinerary.planDetails || "",
    status: savedItinerary.status || "draft",
  };
};


const errorMessage = (error, fallback) => error?.response?.data?.message || fallback;

const DetailsSkeleton = () => (
  <div aria-busy="true" aria-label="Loading booking" className="space-y-5">
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-7 w-64" />
    <div className="rounded-card border border-line bg-surface p-5">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-24" />
          </div>
        ))}
      </div>
    </div>
    <div className="grid gap-5 xl:grid-cols-3">
      <Skeleton className="h-48 rounded-card xl:col-span-2" />
      <Skeleton className="h-48 rounded-card" />
    </div>
  </div>
);

const BookingDetails = () => {
  const { id } = useParams();
  const toast = useToast();
  const confirm = useConfirm();
  const { data: booking, refetch: refetchBooking, isLoading, isError, error } = useBooking(id);
  const { data: tours = [] } = useAdminTours();
  const updateBooking = useUpdateBooking();
  const confirmBookingPayment = useConfirmBookingPayment();
  const [isItineraryFormOpen, setIsItineraryFormOpen] = useState(false);
  const [openPlanDay, setOpenPlanDay] = useState(0);
  const [pendingAction, setPendingAction] = useState("");
  const [titleError, setTitleError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [itineraryForm, setItineraryForm] = useState({
    planDays: [{ title: "", plan: "" }],
    title: "",
    route: "",
    durationLabel: "",
    finalBudget: 0,
    currency: "PKR",
    hotelPlan: "",
    vehiclePlan: "",
    planDetails: "",
    status: "draft",
  });

  const linkedTour = !booking || booking.bookingType === "custom" || booking.isCustomTour
    ? null
    : tours.find((item) => String(item.id || item._id || "") === String(booking.tourId || "")) || null;

  useEffect(() => {
    if (!booking) return;
    const isCustomBooking = booking.bookingType === "custom" || booking.isCustomTour;
    const context = isCustomBooking ? getCustomRequestDetails(booking) : getStandardBookingDetails(booking, linkedTour);
    setItineraryForm(createItineraryDraft(booking, context, isCustomBooking));
    setOpenPlanDay(0);
  }, [booking, linkedTour]);

  const transition = useBookingTransition();
  const runTransition = async (action) => {
    await transition.mutateAsync({ id, action });
  };

  const verifyAdvancePayment = async () => {
    const suggestedAdvance = booking.advanceAmount || Math.round(Number(booking.amount || 0) * 0.1);
    await confirmBookingPayment.mutateAsync({
      bookingId: id,
      paidAmount: suggestedAdvance,
      paymentMethod: booking.paymentMethod || "bank_transfer",
      transactionReference: booking.transactionReference || `admin_verify_${Date.now()}`,
    });
  };

  if (!booking) {
    if (isLoading) return <DetailsSkeleton />;
    const notFound = !isError || error?.response?.status === 404;
    if (notFound) {
      return (
        <Card>
          <EmptyState
            icon={CalendarX2}
            title="Booking not found"
            description="It may have been deleted, or the link is wrong."
            action={<Button to="/admin/bookings">Back to bookings</Button>}
          />
        </Card>
      );
    }
    return (
      <Card>
        <ErrorState description={errorMessage(error, "The booking could not be loaded.")} onRetry={() => refetchBooking()} />
      </Card>
    );
  }

  const isCustomBooking = booking.bookingType === "custom" || booking.isCustomTour;
  const request = getCustomRequestDetails(booking);
  const standardDetails = getStandardBookingDetails(booking, linkedTour);
  const travelWindow = [request.startDate, request.endDate]
    .filter(Boolean)
    .filter((item) => item !== "Flexible")
    .join(" - ");
  const savedItinerary = booking.customItinerary || {};
  const hasSavedItinerary = Boolean(savedItinerary.title);
  const legacySavedDays = parseLegacyPlanDays(savedItinerary.planDetails || "");
  const itineraryDays = Array.isArray(savedItinerary.planDays) && savedItinerary.planDays.length
    ? savedItinerary.planDays.filter((item) => item?.title || item?.plan)
    : legacySavedDays;
  const extraNotes = Array.isArray(savedItinerary.planDays) && savedItinerary.planDays.length
    ? savedItinerary.planDetails || ""
    : "";
  const totalAmount = Number(booking.totalAmount || booking.amount || standardDetails.finalBudget || 0);
  const paidAmount = Number(booking.paidAmount || booking.advanceAmount || 0);
  const paymentPercent = totalAmount > 0 ? Math.min(100, Math.round((paidAmount / totalAmount) * 100)) : 0;
  // Stepper follows the booking lifecycle (Requested → Confirmed → Completed),
  // or ends at Cancelled / Expired.
  const bookingStages = ["cancelled", "expired"].includes(booking.status)
    ? [
        { key: "created", title: "Requested", done: true },
        { key: booking.status, title: booking.status === "expired" ? "Expired (unpaid 48h)" : "Cancelled", done: true, active: true },
      ]
    : [
        { key: "created", title: "Requested", done: true, active: booking.status === "pending" },
        { key: "confirmed", title: "Confirmed", done: ["confirmed", "completed"].includes(booking.status), active: booking.status === "confirmed" },
        { key: "completed", title: "Completed", done: booking.status === "completed", active: booking.status === "completed" },
      ];

  const handleOpenItineraryEditor = () => {
    if (!booking) return;
    const context = isCustomBooking ? getCustomRequestDetails(booking) : getStandardBookingDetails(booking, linkedTour);
    setItineraryForm(createItineraryDraft(booking, context, isCustomBooking));
    setOpenPlanDay(0);
    setTitleError("");
    setSaveError("");
    setIsItineraryFormOpen(true);
  };


  const handleSaveItinerary = async (event) => {
    event.preventDefault();
    setSaveError("");
    if (!itineraryForm.title.trim()) {
      setTitleError("Add an itinerary title before saving.");
      return;
    }
    setTitleError("");

    try {
      await updateBooking.mutateAsync({
        id,
        customItinerary: {
          ...itineraryForm,
          planDays: itineraryForm.planDays
            .map((item) => ({
              title: item.title.trim(),
              plan: item.plan.trim(),
            }))
            .filter((item) => item.title || item.plan),
          title: itineraryForm.title.trim(),
          route: itineraryForm.route.trim(),
          hotelPlan: itineraryForm.hotelPlan.trim(),
          vehiclePlan: itineraryForm.vehiclePlan.trim(),
          planDetails: itineraryForm.planDetails.trim(),
          savedAt: new Date().toISOString(),
        },
      });
      await refetchBooking();
      toast.success("Itinerary saved", "The tour plan is saved to this booking.");
      setIsItineraryFormOpen(false);
    } catch (error) {
      setSaveError(errorMessage(error, "Could not save the itinerary right now."));
    }
  };

  const handlePrintTourPlan = () => {
    const draftItinerary = {
      ...itineraryForm,
      title: itineraryForm.title?.trim(),
      route: itineraryForm.route?.trim(),
      hotelPlan: itineraryForm.hotelPlan?.trim(),
      vehiclePlan: itineraryForm.vehiclePlan?.trim(),
      planDetails: itineraryForm.planDetails?.trim(),
      planDays: Array.isArray(itineraryForm.planDays)
        ? itineraryForm.planDays
            .map((item) => ({
              title: String(item?.title || "").trim(),
              plan: String(item?.plan || "").trim(),
            }))
            .filter((item) => item.title || item.plan)
        : [],
    };
    const itinerary = booking.customItinerary?.title ? booking.customItinerary : draftItinerary;
    if (!itinerary.title) return;

    const printDays = Array.isArray(itinerary.planDays) && itinerary.planDays.length
      ? itinerary.planDays
      : parseLegacyPlanDays(itinerary.planDetails || "");

    const summaryRows = isCustomBooking
      ? [
          ["Requested Destinations", request.preferredDestinations || "Flexible"],
          ["Route", itinerary.route || request.sourceTourTitle || "-"],
          ["Duration", itinerary.durationLabel || travelWindow || "Custom Duration"],
          ["Final Budget", `${itinerary.currency || booking.currency || "PKR"} ${itinerary.finalBudget || 0}`],
          ["Hotel Plan", itinerary.hotelPlan || prettifyValue(request.hotelPreference, "Not selected")],
          ["Vehicle Plan", itinerary.vehiclePlan || prettifyValue(request.vehiclePreference, "Not selected")],
        ]
      : [
          ["Tour", booking.tour || "Selected Tour"],
          ["Route", itinerary.route || standardDetails.route || "-"],
          ["Travel Date", standardDetails.travelDate || "Scheduled Tour"],
          ["Final Budget", `${itinerary.currency || booking.currency || "PKR"} ${itinerary.finalBudget || booking.amount || 0}`],
          ["Hotel Plan", itinerary.hotelPlan || prettifyValue(standardDetails.hotelPreference, "Not selected")],
          ["Vehicle Plan", itinerary.vehiclePlan || prettifyValue(standardDetails.vehiclePreference, "Not selected")],
        ];

    const extraNotes = itinerary.planDays?.length ? itinerary.planDetails || "" : "";
    const brandColor = "#20b77a";
    const win = window.open("", "_blank", "width=960,height=760");
    if (!win) return;

    win.document.write(String(html`
      <html>
        <head>
          <title>${itinerary.title || "Tour Plan"} - Print</title>
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              font-family: Arial, sans-serif;
              color: #111827;
              background: #ffffff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .sheet {
              max-width: 860px;
              margin: 0 auto;
              background: #ffffff;
              padding: 28px 30px 32px;
            }
            .header {
              padding-bottom: 18px;
              border-bottom: 1px solid #e5e7eb;
            }
            .header-grid {
              display: grid;
              grid-template-columns: minmax(0, 1.35fr) minmax(260px, 0.85fr);
              gap: 18px;
              align-items: start;
            }
            .eyebrow {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              font-size: 10px;
              font-weight: 700;
              letter-spacing: 0.18em;
              text-transform: uppercase;
              color: #4b5563;
              margin: 0 0 8px;
            }
            .eyebrow::before {
              content: "";
              width: 20px;
              height: 1px;
              border-radius: 999px;
              background: #9ca3af;
            }
            .title {
              margin: 0;
              font-size: 28px;
              line-height: 1.15;
              letter-spacing: -0.02em;
              font-weight: 700;
              color: #111827;
            }
            .subtitle {
              margin: 10px 0 0;
              max-width: 100%;
              font-size: 13px;
              line-height: 1.7;
              color: #4b5563;
            }
            .meta-panel {
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              background: #ffffff;
              padding: 12px;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 8px;
            }
            .meta-card {
              border-radius: 8px;
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              padding: 10px 11px;
            }
            .meta-card .label {
              font-size: 9px;
              letter-spacing: 0.12em;
              text-transform: uppercase;
              color: #6b7280;
              font-weight: 700;
            }
            .meta-card .value {
              margin-top: 5px;
              font-size: 13px;
              line-height: 1.4;
              color: #111827;
              font-weight: 700;
            }
            .body {
              padding-top: 22px;
            }
            .section {
              margin-top: 22px;
            }
            .section-title {
              margin: 0 0 10px;
              font-size: 10px;
              letter-spacing: 0.14em;
              text-transform: uppercase;
              color: #6b7280;
              font-weight: 700;
            }
            .intro-grid {
              display: grid;
              grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr);
              gap: 12px;
            }
            .intro-card,
            .summary-card {
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              background: #ffffff;
              break-inside: avoid;
              page-break-inside: avoid;
            }
            .intro-card {
              padding: 14px 16px;
            }
            .intro-title {
              margin: 0;
              font-size: 10px;
              font-weight: 700;
              letter-spacing: 0.12em;
              text-transform: uppercase;
              color: #6b7280;
            }
            .intro-value {
              margin: 8px 0 0;
              font-size: 13px;
              line-height: 1.7;
              color: #374151;
              font-weight: 400;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              padding: 12px 14px;
              border-bottom: 1px solid #e5e7eb;
              text-align: left;
              vertical-align: top;
            }
            tr:last-child th, tr:last-child td {
              border-bottom: none;
            }
            th {
              width: 28%;
              font-size: 9px;
              letter-spacing: 0.12em;
              text-transform: uppercase;
              color: #6b7280;
              font-weight: 700;
              background: #f9fafb;
            }
            td {
              font-size: 13px;
              line-height: 1.7;
              color: #111827;
              font-weight: 500;
            }
            .day-card {
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              padding: 14px 16px;
              margin-bottom: 12px;
              background: #ffffff;
              break-inside: avoid;
              page-break-inside: avoid;
            }
            .day-kicker {
              margin: 0;
              font-size: 9px;
              font-weight: 700;
              letter-spacing: 0.14em;
              text-transform: uppercase;
              color: #6b7280;
            }
            .day-title {
              margin: 8px 0 0;
              font-size: 16px;
              line-height: 1.35;
              letter-spacing: -0.01em;
              color: #111827;
              font-weight: 700;
            }
            .day-plan {
              margin: 8px 0 0;
              font-size: 13px;
              line-height: 1.75;
              color: #4b5563;
              white-space: pre-line;
              font-weight: 400;
            }
            .notes-card {
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              padding: 14px 16px;
              background: #ffffff;
              break-inside: avoid;
              page-break-inside: avoid;
            }
            .notes-text {
              margin: 0;
              font-size: 13px;
              line-height: 1.75;
              color: #4b5563;
              white-space: pre-line;
              font-weight: 400;
            }
            .footer-note {
              margin-top: 18px;
              padding-top: 12px;
              border-top: 1px solid #e5e7eb;
              font-size: 9px;
              letter-spacing: 0.12em;
              text-transform: uppercase;
              color: #9ca3af;
              font-weight: 600;
            }
            @media print {
              body {
                background: #ffffff;
              }
              .sheet {
                margin: 0 auto;
                padding: 0;
              }
              .day-card,
              .intro-card,
              .summary-card,
              .notes-card,
              table,
              tr,
              td,
              th {
                break-inside: avoid;
                page-break-inside: avoid;
              }
            }
            @page {
              margin: 10mm;
            }
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="header">
              <div class="header-grid">
                <div>
                  <p class="eyebrow">${isCustomBooking ? "Custom Tour Plan" : "Standard Tour Plan"}</p>
                  <h1 class="title">${itinerary.title || "Created Tour Plan"}</h1>
                  <p class="subtitle">Prepared for ${booking.customer || "Customer"} from ${isCustomBooking ? html`custom request ${booking.bookingCode || ""}` : html`booking ${booking.bookingCode || ""}`}. This print view summarizes the approved route, travel setup, and day-wise itinerary in one clean document.</p>
                </div>
                <div class="meta-panel">
                  <div class="meta-grid">
                    <div class="meta-card">
                      <div class="label">Booking Code</div>
                      <div class="value">${booking.bookingCode || "-"}</div>
                    </div>
                    <div class="meta-card">
                      <div class="label">Plan Status</div>
                      <div class="value">${prettifyValue(itinerary.status || "draft", "Draft")}</div>
                    </div>
                    <div class="meta-card">
                      <div class="label">Saved At</div>
                      <div class="value">${itinerary.savedAt ? new Date(itinerary.savedAt).toLocaleDateString() : "Just now"}</div>
                    </div>
                    <div class="meta-card">
                      <div class="label">Budget</div>
                      <div class="value">${itinerary.currency || booking.currency || "PKR"} ${itinerary.finalBudget || booking.amount || 0}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="body">
              <section class="section" style="margin-top:0;">
                <h2 class="section-title">Overview</h2>
                <div class="intro-grid">
                  <div class="intro-card">
                    <p class="intro-title">Prepared For</p>
                    <p class="intro-value">${booking.customer || "Customer"}<br />${booking.email || "-"}<br />${booking.phone || "-"}</p>
                  </div>
                  <div class="intro-card">
                    <p class="intro-title">${isCustomBooking ? "Trip Context" : "Booking Context"}</p>
                    <p class="intro-value">${isCustomBooking ? html`Requested destinations: ${request.preferredDestinations || "Flexible"}<br />Travel window: ${travelWindow || "Flexible"}` : html`Tour: ${booking.tour || "Selected Tour"}<br />Travel date: ${standardDetails.travelDate || "Scheduled Tour"}`}</p>
                  </div>
                </div>
              </section>

              <section class="section">
                <h2 class="section-title">Plan Summary</h2>
                <div class="summary-card">
                  <table>
                    <tbody>
                      ${summaryRows
                        .map(
                          ([label, value]) => html`
                            <tr>
                              <th>${label}</th>
                              <td>${value || "-"}</td>
                            </tr>
                          `,
                        )}
                    </tbody>
                  </table>
                </div>
              </section>

              <section class="section">
                <h2 class="section-title">Day Wise Itinerary</h2>
                ${printDays.length
                  ? printDays
                      .map(
                        (item, index) => html`
                          <article class="day-card">
                            <p class="day-kicker">Day ${index + 1}</p>
                            <h3 class="day-title">${item.title || html`Plan ${index + 1}`}</h3>
                            <p class="day-plan">${item.plan || "No day plan added yet."}</p>
                          </article>
                        `,
                      )
                  : html`
                      <article class="day-card">
                        <p class="day-kicker">Itinerary</p>
                        <h3 class="day-title">Custom Plan</h3>
                        <p class="day-plan">${(isCustomBooking ? request.requirements : standardDetails.requirements) || "No itinerary details added yet."}</p>
                      </article>
                    `}
              </section>

              ${extraNotes
                ? html`
                  <section class="section">
                    <h2 class="section-title">Extra Notes</h2>
                    <div class="notes-card">
                      <p class="notes-text">${extraNotes}</p>
                    </div>
                  </section>
                `
                : ""}

              <div class="footer-note">North Luxe Travel Plan Document</div>
            </div>
          </div>
        </body>
      </html>
    `));
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 350);
  };

  // ---------- presentation ----------
  const currency = booking.currency || "PKR";
  const money = (value) => formatCurrencyAmount(value, currency);
  const actualPaid = Number(booking.paidAmount || 0);
  const balance = booking.remainingAmount || Math.max(totalAmount - paidAmount, 0);
  const paidPercent = totalAmount > 0 ? Math.min(100, Math.round((actualPaid / totalAmount) * 100)) : 0;
  const guests = booking.groupSize || booking.adults || request.persons;
  const travelDateLabel = isCustomBooking ? travelWindow || "Flexible" : formatDate(booking.date);
  const tripTitle = isCustomBooking ? request.preferredDestinations : booking.tour;
  const paymentHistory = Array.isArray(booking.paymentHistory) ? booking.paymentHistory : [];
  const manual = booking.manualPayment || {};
  const addOns = booking.facilities?.addOns?.length ? booking.facilities.addOns.map((item) => humanize(item)).join(", ") : "";
  const stageLabels = {};

  const allowed = Array.isArray(booking.allowedActions) ? booking.allowedActions : [];
  const canConfirm = allowed.includes("confirm");
  const canComplete = allowed.includes("complete");
  const canReopen = allowed.includes("reopen");
  const canCancel = allowed.includes("cancel");
  const canVerifyAdvance = !isCustomBooking && !booking.paymentVerified && booking.paymentMethod !== "pay_on_arrival" && ["pending", "confirmed"].includes(booking.status);
  const holdUntil = booking.seatState === "held" && booking.holdExpiresAt ? new Date(booking.holdExpiresAt) : null;
  const history = Array.isArray(booking.history) ? [...booking.history].reverse() : [];
  const busy = Boolean(pendingAction);

  const runAction = async (key, action, failureTitle) => {
    setPendingAction(key);
    try {
      await action();
    } catch (actionError) {
      toast.error(failureTitle, errorMessage(actionError, "Please try again."));
    } finally {
      setPendingAction("");
    }
  };

  const handleConfirmBooking = async () => {
    const ok = await confirm({
      title: "Confirm booking?",
      description:
        actualPaid > 0
          ? `${booking.customer || "This customer"}'s booking will be confirmed and its seats kept.`
          : `Nothing has been paid yet. The booking will be confirmed, its seats kept, and it will show as "Unpaid · pay on arrival".`,
      confirmLabel: "Confirm booking",
      cancelLabel: "Not now",
      tone: "primary",
    });
    if (ok) runAction("confirm", () => runTransition("confirm"), "Could not confirm booking");
  };

  const handleCompleteBooking = async () => {
    const ok = await confirm({
      title: "Mark trip as completed?",
      description: balance > 0 ? `A balance of ${money(balance)} is still outstanding.` : "The trip will be marked as completed.",
      confirmLabel: "Mark completed",
      cancelLabel: "Not now",
      tone: "primary",
    });
    if (ok) runAction("complete", () => runTransition("complete"), "Could not complete booking");
  };

  const handleReopenBooking = async () => {
    const ok = await confirm({
      title: "Reopen this booking?",
      description: "It returns to Pending and its seats are held again for 48 hours, if the date still has space.",
      confirmLabel: "Reopen booking",
      cancelLabel: "Not now",
      tone: "primary",
    });
    if (ok) runAction("reopen", () => runTransition("reopen"), "Could not reopen booking");
  };

  const handleVerifyAdvance = async () => {
    const suggestedAdvance = booking.advanceAmount || Math.round(Number(booking.amount || 0) * 0.1);
    const ok = await confirm({
      title: "Verify advance payment?",
      description: `Records an advance of ${money(suggestedAdvance)} (${humanize(booking.paymentMethod || "bank_transfer")}) as verified for ${booking.customer || "this customer"}'s booking.`,
      confirmLabel: "Verify advance",
      cancelLabel: "Not now",
      tone: "primary",
    });
    if (ok) runAction("verify", verifyAdvancePayment, "Could not verify payment");
  };

  const handleCancelBooking = async () => {
    const ok = await confirm({
      title: "Cancel this booking?",
      description: `${booking.customer || "This customer"}'s booking will be cancelled and its seats released.`,
      confirmLabel: "Cancel booking",
      cancelLabel: "Keep booking",
    });
    if (ok) runAction("cancel", () => runTransition("cancel"), "Could not cancel booking");
  };

  const itineraryItems = hasSavedItinerary
    ? [
        ["Route", savedItinerary.route || request.preferredDestinations],
        ["Duration", savedItinerary.durationLabel || travelWindow || "Custom duration"],
        ["Final budget", formatCurrencyAmount(savedItinerary.finalBudget, savedItinerary.currency || currency)],
        ["Hotel plan", savedItinerary.hotelPlan || humanize(request.hotelPreference)],
        ["Vehicle plan", savedItinerary.vehiclePlan || humanize(request.vehiclePreference)],
        ["Saved", savedItinerary.savedAt ? formatDate(savedItinerary.savedAt, true) : "Just now"],
      ]
    : [];

  return (
    <div className="space-y-5">
      <PageHeader
        back={{ to: "/admin/bookings", label: "Bookings" }}
        documentTitle={`Booking ${booking.bookingCode || ""}`.trim()}
        title={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span>Booking {booking.bookingCode ? `#${booking.bookingCode}` : ""}</span>
            <span className="flex flex-wrap items-center gap-1.5">
              <StatusBadge status={booking.status || "pending"} />
              {!isCustomBooking ? <StatusBadge status={booking.paymentLabel || booking.payment || "Unpaid"} /> : null}
              {isCustomBooking ? <Badge tone="brand">Custom request</Badge> : null}
            </span>
          </span>
        }
        description={[booking.customer, tripTitle].filter(Boolean).join(" · ")}
      />

      {/* Primary actions: stay in reach while scrolling on larger screens. */}
      <div className="z-20 -mx-2 flex flex-wrap items-center gap-2 bg-canvas/95 px-2 py-2 backdrop-blur md:sticky md:top-16">
        {canConfirm ? (
          <Button variant="primary" icon={BadgeCheck} onClick={handleConfirmBooking} loading={pendingAction === "confirm"} disabled={busy}>
            Confirm booking
          </Button>
        ) : null}
        {canComplete ? (
          <Button variant="primary" icon={CheckCheck} onClick={handleCompleteBooking} loading={pendingAction === "complete"} disabled={busy}>
            Mark completed
          </Button>
        ) : null}
        {canReopen ? (
          <Button icon={RotateCcw} onClick={handleReopenBooking} loading={pendingAction === "reopen"} disabled={busy}>
            Reopen booking
          </Button>
        ) : null}
        {canVerifyAdvance ? (
          <Button variant={canConfirm ? "secondary" : "primary"} icon={Wallet} onClick={handleVerifyAdvance} loading={pendingAction === "verify"} disabled={busy}>
            Verify advance
          </Button>
        ) : null}
        <Button icon={PencilLine} onClick={handleOpenItineraryEditor} disabled={busy}>
          {hasSavedItinerary ? "Edit itinerary" : "Create itinerary"}
        </Button>
        {hasSavedItinerary ? (
          <Button icon={Printer} onClick={handlePrintTourPlan}>
            Print itinerary
          </Button>
        ) : null}
        {canCancel ? (
          <Button variant="danger" icon={XCircle} onClick={handleCancelBooking} loading={pendingAction === "cancel"} disabled={busy} className="sm:ml-auto">
            Cancel booking
          </Button>
        ) : null}
      </div>

      <Card>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-5">
          <Fact label={isCustomBooking ? "Travel window" : "Travel date"} value={travelDateLabel} />
          <Fact label="Guests" value={guests} />
          <Fact label="Total" value={money(totalAmount)} />
          <Fact label="Paid" value={money(actualPaid)} emphasis={actualPaid > 0} />
          <Fact label="Balance" value={money(balance)} />
        </dl>
        {holdUntil ? (
          <p className="mt-3 text-[13px] text-subtle">
            Seats held until <strong className="font-semibold text-navy-900">{formatDate(holdUntil.toISOString(), true)}</strong>.
            {" "}If nothing is paid by then, the booking expires and the seats are released.
          </p>
        ) : null}
        <div className="mt-4 flex items-center gap-3" title={`${paidPercent}% paid`}>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line" role="progressbar" aria-label="Amount paid" aria-valuemin={0} aria-valuemax={100} aria-valuenow={paidPercent}>
            <div className="h-full rounded-full bg-brand" style={{ width: `${paidPercent}%` }} />
          </div>
          <span className="text-xs font-semibold tabular-nums text-subtle">{paidPercent}% paid</span>
        </div>
        <div className="mt-4 border-t border-line pt-4">
          <BookingStepper stages={bookingStages.map((stage) => ({ ...stage, title: stageLabels[stage.key] || stage.title }))} />
        </div>
      </Card>

      <div className="grid items-start gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          {isCustomBooking ? (
            <DetailSection
              title="Trip & travellers"
              keep={["Requested destinations", "Travel window"]}
              items={[
                ["Requested destinations", request.preferredDestinations],
                ["Source tour", request.sourceTourTitle],
                ["Travel window", travelWindow || "Flexible"],
                ["Persons", request.persons],
                ["Children below 3", request.childrenBelowThree],
                ["Budget", request.budget],
                ["Budget mode", humanize(request.budgetMode)],
              ]}
            />
          ) : (
            <DetailSection
              title="Trip & travellers"
              items={[
                ["Tour", booking.tour],
                ["Travel date", formatDate(booking.date)],
                ["Group size", guests],
              ]}
            />
          )}

          <DetailSection
            title="Pricing & payments"
            keep={["Payment verified"]}
            items={[
              ["Advance due", booking.advanceAmount ? money(booking.advanceAmount) : ""],
              ["Payment method", humanize(booking.paymentMethod)],
              ["Payment verified", booking.paymentVerified ? "Yes" : "No"],
              ["Reference", booking.transactionReference],
            ]}
          >
            {paymentHistory.length ? (
              <div>
                <h3 className="mb-2 text-[13px] font-semibold text-navy-900">Payment history</h3>
                <ul className="divide-y divide-line">
                  {paymentHistory.map((entry, index) => (
                    <li key={`${entry.reference || "payment"}-${index}`} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="font-semibold tabular-nums text-navy-900">{money(entry.amount)}</p>
                        <p className="mt-0.5 break-words text-xs text-subtle">
                          {[humanize(entry.method), humanize(entry.provider), entry.reference, entry.recordedByName ? `by ${entry.recordedByName}` : ""]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </p>
                      </div>
                      <span className="text-xs text-subtle">{formatDate(entry.paidAt, true)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </DetailSection>

          {!isCustomBooking ? (
            <DetailSection
              title="Payment proof"
              description="Details the customer submitted with their transfer."
              items={[
                ["Sender name", manual.senderName],
                ["Sender number / account", manual.senderNumber],
                ["Amount sent", manual.sentAmount ? money(manual.sentAmount) : ""],
                ["Sent on", formatDate(manual.sentAt, true)],
              ]}
            >
              {manual.slip ? (
                <Button href={manual.slip} target="_blank" rel="noreferrer" icon={FileText} iconRight={ExternalLink} size="sm">
                  {manual.slipName || "View payment slip"}
                </Button>
              ) : null}
            </DetailSection>
          ) : null}

          {hasSavedItinerary ? (
            <Card
              title={savedItinerary.title}
              description={`Custom itinerary · ${humanize(savedItinerary.status || "draft")}`}
              actions={
                <>
                  <Button size="sm" icon={PencilLine} onClick={handleOpenItineraryEditor}>Edit</Button>
                  <Button size="sm" icon={Printer} onClick={handlePrintTourPlan}>Print</Button>
                </>
              }
            >
              <DetailList items={itineraryItems.filter(([, value]) => hasValue(value))} />
              {itineraryDays.length ? (
                <ol className="mt-4 space-y-3 border-t border-line pt-4">
                  {itineraryDays.map((item, index) => (
                    <li key={`saved-day-${index}`} className="flex gap-3">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">{index + 1}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-navy-900">{item.title || `Day ${index + 1}`}</p>
                        {item.plan ? <p className="mt-0.5 whitespace-pre-line break-words text-sm leading-relaxed text-body">{item.plan}</p> : null}
                      </div>
                    </li>
                  ))}
                </ol>
              ) : null}
              {extraNotes ? (
                <div className="mt-4 border-t border-line pt-4">
                  <h3 className="text-[13px] font-semibold text-navy-900">Extra notes</h3>
                  <p className="mt-1 whitespace-pre-line break-words text-sm leading-relaxed text-body">{extraNotes}</p>
                </div>
              ) : null}
            </Card>
          ) : isCustomBooking ? (
            <Card title="Custom itinerary">
              <EmptyState
                className="py-6"
                title="No itinerary yet"
                description="Create a day-wise plan for this request. It can be printed and shared once saved."
                action={<Button variant="primary" icon={PencilLine} onClick={handleOpenItineraryEditor}>Create itinerary</Button>}
              />
            </Card>
          ) : null}
        </div>

        <div className="space-y-5">
          <DetailSection
            title="Customer"
            className="xl:[&_dl]:grid-cols-1"
            keep={["Name"]}
            items={[
              ["Name", booking.customer],
              ["Email", booking.email ? <a href={`mailto:${booking.email}`} className="text-brand-700 hover:underline">{booking.email}</a> : ""],
              ["Phone", booking.phone ? <a href={`tel:${booking.phone}`} className="text-brand-700 hover:underline">{booking.phone}</a> : ""],
            ]}
          />

          {!isCustomBooking ? (
            <DetailSection
              title="Identity"
              className="xl:[&_dl]:grid-cols-1"
              items={[
                ["Traveller type", humanize(booking.identity?.travelerType)],
                ["Local ID", [humanize(booking.identity?.local?.type), booking.identity?.local?.value].filter(Boolean).join(" / ")],
                ["Country", booking.identity?.international?.country],
                ["Passport", booking.identity?.international?.passportNumber],
              ]}
            />
          ) : null}

          <DetailSection
            title="Facilities & add-ons"
            className="xl:[&_dl]:grid-cols-1"
            items={[
              ["Hotel", humanize(isCustomBooking ? request.hotelPreference : booking.facilities?.hotelType)],
              ["Vehicle", humanize(isCustomBooking ? request.vehiclePreference : booking.facilities?.vehicleType)],
              !isCustomBooking ? ["Meals", humanize(booking.facilities?.meals)] : null,
              !isCustomBooking ? ["Add-ons", addOns] : null,
            ]}
          />

          <TextSection title="Special requests" text={isCustomBooking ? request.requirements : booking.specialRequirements} />
          <TextSection title="Admin notes" text={booking.notes} />

          {history.length ? (
            <Card title="Activity" description="Status changes, payments and seat events, newest first.">
              <ol className="space-y-3">
                {history.map((entry, index) => (
                  <li key={`${entry.at}-${index}`} className="flex gap-3">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-canvas text-subtle">
                      <History size={13} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 text-[13px] leading-relaxed">
                      <p className="font-semibold text-navy-900">
                        {humanize(entry.action)}
                        {entry.byName ? <span className="font-normal text-subtle"> · {entry.byName}</span> : null}
                      </p>
                      {entry.note ? <p className="text-body">{entry.note}</p> : null}
                      <p className="text-xs text-subtle">{formatDate(entry.at, true)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          ) : null}
        </div>
      </div>

      <ItineraryDrawer
        open={isItineraryFormOpen}
        onOpenChange={setIsItineraryFormOpen}
        isEditing={hasSavedItinerary}
        form={itineraryForm}
        setForm={setItineraryForm}
        openPlanDay={openPlanDay}
        setOpenPlanDay={setOpenPlanDay}
        onSubmit={handleSaveItinerary}
        onPrint={handlePrintTourPlan}
        saving={updateBooking.isPending}
        titleError={titleError}
        saveError={saveError}
      />
    </div>
  );
};

export default BookingDetails;
