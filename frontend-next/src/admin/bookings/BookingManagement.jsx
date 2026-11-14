import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "@/lib/router";
import { CalendarCheck, Eye, FileText, Printer, Search, Trash2 } from "lucide-react";
import { useBookings, useDeleteBooking } from "../../hooks/useCms";
import { useNotifications, useUpdateNotification } from "../../hooks/useCms";
import { useToast } from "../../context/ToastContext";
import { html } from "../../lib/html.mjs";
import { formatCurrencyAmount } from "../../utils/currency";
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  RowActions,
  SkeletonRows,
  StatusBadge,
  TabPanel,
  Tabs,
  useConfirm,
} from "../ui";

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

const prettifyValue = (value, fallback = "-") => {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value).replace(/_/g, " ");
};

const isRecentlyReceived = (value) => {
  if (!value) return false;
  const at = new Date(value).getTime();
  if (Number.isNaN(at)) return false;
  return Date.now() - at <= 2 * 24 * 60 * 60 * 1000;
};

const getSavedItinerary = (booking) => {
  const itinerary = booking.customItinerary || {};
  if (itinerary.title || itinerary.planDetails || itinerary.finalBudget || (Array.isArray(itinerary.planDays) && itinerary.planDays.length)) return itinerary;
  return {};
};

const getCustomRequestDetails = (booking) => {
  const fallback = parseCustomRequest(booking.customRequirements);
  const custom = booking.customRequest || {};
  const preferredDestinations = Array.isArray(custom.preferredDestinations) && custom.preferredDestinations.length
    ? custom.preferredDestinations.join(", ")
    : fallback["Preferred Destinations"] || "Flexible destination";

  return {
    preferredDestinations,
    sourceTourTitle: custom.sourceTourTitle || fallback["Source Tour"] || booking.tour || "Not linked",
    startDate: custom.startDate || fallback["Start Date"] || "Flexible",
    endDate: custom.endDate || fallback["End Date"] || "Flexible",
    persons: custom.persons || fallback["Persons"] || booking.groupSize || 0,
    childrenBelowThree: custom.childrenBelowThree ?? fallback["Children below 3 years"] ?? booking.children ?? 0,
    budget: custom.budget || fallback["Budget"] || "Not specified",
    budgetMode: custom.budgetMode || fallback["Budget Mode"] || "",
    hotelPreference: custom.hotelPreference || fallback["Hotel Preference"] || booking.facilities?.hotelType || "",
    vehiclePreference: custom.vehiclePreference || fallback["Vehicle Preference"] || booking.facilities?.vehicleType || "",
    requirements: custom.requirements || fallback["Requirements"] || booking.specialRequirements || "None",
  };
};

const openTourPlanPrint = (booking) => {
  const isCustomBooking = booking.bookingType === "custom" || booking.isCustomTour;
  const request = getCustomRequestDetails(booking);
  const itinerary = booking.customItinerary || {};
  if (!itinerary?.title) return;

  const win = window.open("", "_blank", "width=960,height=760");
  if (!win) return;

  win.document.write(String(html`
    <html>
      <head>
        <title>${itinerary.title || "Tour Plan"} - Print</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 28px; color: #2B2B2B; }
          h1 { margin-bottom: 6px; }
          p { line-height: 1.65; }
          .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-top: 18px; }
          .card { border: 1px solid #e2e8f0; border-radius: 16px; padding: 14px; }
          .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; }
          .value { margin-top: 6px; font-size: 15px; font-weight: 700; }
        </style>
      </head>
      <body>
        <h1>${itinerary.title || "Created Tour Plan"}</h1>
        <p>Prepared for ${booking.customer || "Customer"} from ${isCustomBooking ? html`custom booking request ${booking.bookingCode || ""}` : html`booking ${booking.bookingCode || ""}` }.</p>
        <div class="grid">
          <div class="card"><div class="label">${isCustomBooking ? "Requested Destinations" : "Tour"}</div><div class="value">${isCustomBooking ? request.preferredDestinations : booking.tour || "Selected Tour"}</div></div>
          <div class="card"><div class="label">${isCustomBooking ? "Travel Window" : "Travel Date"}</div><div class="value">${isCustomBooking ? html`${request.startDate}${request.endDate && request.endDate !== "Flexible" ? html` - ${request.endDate}` : ""}` : new Date(booking.date || booking.createdAt).toLocaleDateString()}</div></div>
          <div class="card"><div class="label">Final Budget</div><div class="value">${itinerary.currency || booking.currency || "PKR"} ${itinerary.finalBudget || booking.amount || 0}</div></div>
          <div class="card"><div class="label">Duration</div><div class="value">${itinerary.durationLabel || (isCustomBooking ? "Custom Duration" : "Scheduled Tour")}</div></div>
        </div>
        <div class="card" style="margin-top: 16px;"><div class="label">Itinerary Details</div><div class="value">${itinerary.planDetails || request.requirements || booking.specialRequirements || "No itinerary details added yet."}</div></div>
      </body>
    </html>
  `));
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 350);
};


const humanizeValue = (value) => {
  const text = prettifyValue(value, "").trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
};

const isCustom = (booking) => booking.bookingType === "custom" || booking.isCustomTour;

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};

/** Amount shown for a row: saved itinerary budget for custom requests, booking total otherwise. */
const getRowAmount = (booking, request) => {
  if (!isCustom(booking)) return formatCurrencyAmount(booking.amount, booking.currency);
  const itinerary = getSavedItinerary(booking);
  return itinerary?.title || itinerary?.finalBudget
    ? formatCurrencyAmount(itinerary.finalBudget, itinerary.currency || "PKR")
    : request.budget;
};

const getRowTrip = (booking, request) => {
  if (!isCustom(booking)) {
    return { title: booking.tour || "—", meta: formatDate(booking.date || booking.createdAt) };
  }
  const requestedDates = [request.startDate, request.endDate]
    .filter(Boolean)
    .filter((item) => item !== "Flexible")
    .join(" – ");
  return { title: request.preferredDestinations, meta: requestedDates || "Flexible dates" };
};

const BookingManagement = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const { data: bookings = [], isLoading, isError, refetch } = useBookings();
  const deleteBooking = useDeleteBooking();
  const { data: notifications = [] } = useNotifications();
  const updateNotification = useUpdateNotification();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(() => searchParams.get("search") || "");
  const [activeTab, setActiveTab] = useState("standard");
  const customTab = activeTab === "custom";

  useEffect(() => {
    const unreadBookingAlerts = notifications.filter(
      (n) => !n?.isRead && String(n?.type || "") === "Bookings",
    );
    if (!unreadBookingAlerts.length) return;

    unreadBookingAlerts.forEach((n) => {
      updateNotification.mutate({ id: n.id, isRead: true });
    });
  }, [notifications, updateNotification]);

  useEffect(() => {
    const next = searchParams.get("search") || "";
    setSearchTerm((current) => (current === next ? current : next));
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (searchTerm.trim()) params.set("search", searchTerm.trim());
    else params.delete("search");
    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [searchParams, searchTerm, setSearchParams]);

  const filteredBookings = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return bookings.filter((booking) => {
      const isCustomBooking = booking.bookingType === "custom" || booking.isCustomTour;
      const matchesTab = customTab ? isCustomBooking : !isCustomBooking;
      if (!matchesTab) return false;

      const request = getCustomRequestDetails(booking);
      if (!query) return true;

      const haystack = [
        booking.customer,
        booking.email,
        booking.phone,
        booking.bookingCode,
        booking.tour,
        booking.status,
        booking.payment,
        booking.paymentMethod,
        booking.currency,
        booking.customRequirements,
        request.preferredDestinations,
        request.sourceTourTitle,
        request.budget,
        request.budgetMode,
        request.vehiclePreference,
        request.hotelPreference,
        request.requirements,
        getSavedItinerary(booking)?.title,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    }).sort((a, b) => {
      const aRecent = isRecentlyReceived(a?.createdAt || a?.date);
      const bRecent = isRecentlyReceived(b?.createdAt || b?.date);
      if (aRecent !== bRecent) return Number(bRecent) - Number(aRecent);
      const aTime = new Date(a?.createdAt || a?.date || 0).getTime();
      const bTime = new Date(b?.createdAt || b?.date || 0).getTime();
      return bTime - aTime;
    });
  }, [bookings, customTab, searchTerm]);

  const createdPlans = useMemo(
    () => filteredBookings.filter((booking) => {
      const itinerary = getSavedItinerary(booking);
      return itinerary.title || itinerary.planDetails || itinerary.finalBudget || (Array.isArray(itinerary.planDays) && itinerary.planDays.length);
    }),
    [filteredBookings],
  );

  const tabCounts = useMemo(() => {
    const custom = bookings.filter(isCustom).length;
    return { standard: bookings.length - custom, custom };
  }, [bookings]);

  const handleDeleteBooking = async (booking) => {
    const ok = await confirm({
      title: "Delete booking?",
      description: `This permanently removes the booking for ${booking.customer || "this customer"}. This cannot be undone.`,
      confirmLabel: "Delete booking",
      cancelLabel: "Keep booking",
    });
    if (!ok) return;
    try {
      await deleteBooking.mutateAsync(booking.id);
      toast.success("Deleted", "Booking removed successfully.");
    } catch (error) {
      toast.error("Delete failed", error?.response?.data?.message || "Could not delete the booking right now.");
    }
  };

  const bookingActions = (booking) => [
    { label: "View booking", icon: Eye, to: `/admin/bookings/${booking.id}` },
    { label: "Print itinerary", icon: Printer, onClick: () => openTourPlanPrint(booking), hidden: !getSavedItinerary(booking)?.title },
    { label: "Delete booking", icon: Trash2, onClick: () => handleDeleteBooking(booking), danger: true },
  ];

  const planActions = (booking) => [
    { label: "Print itinerary", icon: Printer, onClick: () => openTourPlanPrint(booking) },
    { label: "View booking", icon: Eye, to: `/admin/bookings/${booking.id}` },
  ];

  const emptyTitle = customTab ? "No custom booking requests found" : "No standard tour bookings found";
  const emptyDescription = searchTerm.trim()
    ? "Try a different search term to find the booking you need."
    : customTab
      ? "New custom requests will appear here with their form data and created plans."
      : "Standard tour bookings will appear here once customers submit them.";

  const renderBookings = () => {
    if (isLoading) return <SkeletonRows rows={6} />;
    if (isError) return <ErrorState description="The bookings list could not be loaded." onRetry={() => refetch()} />;
    if (!filteredBookings.length) return <EmptyState icon={CalendarCheck} title={emptyTitle} description={emptyDescription} />;

    const rows = filteredBookings.map((booking) => {
      const request = getCustomRequestDetails(booking);
      return {
        booking,
        request,
        trip: getRowTrip(booking, request),
        amount: getRowAmount(booking, request),
        isLatest: isRecentlyReceived(booking?.createdAt || booking?.date),
        persons: request.persons ? `${request.persons} ${Number(request.persons) === 1 ? "person" : "people"}` : "",
      };
    });

    return (
      <>
        {/* Phones: stacked list */}
        <ul className="divide-y divide-line md:hidden">
          {rows.map(({ booking, trip, amount, isLatest, persons }) => (
            <li key={booking.id} className="flex items-start gap-3 px-4 py-3.5">
              <Link to={`/admin/bookings/${booking.id}`} className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="truncate font-semibold text-navy-900">{booking.customer || "—"}</span>
                  {isLatest ? <Badge tone="brand">New</Badge> : null}
                </span>
                <span className="mt-0.5 block truncate text-[13px] text-body">{trip.title}</span>
                <span className="mt-0.5 block text-xs text-subtle">
                  {[booking.bookingCode, trip.meta].filter(Boolean).join(" · ")}
                </span>
                <span className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 text-[13px] font-semibold text-navy-900">{amount}</span>
                  <StatusBadge status={booking.status} />
                  {!customTab ? <StatusBadge status={booking.paymentLabel || booking.payment} /> : null}
                  {customTab && persons ? <span className="text-xs text-subtle">{persons}</span> : null}
                </span>
              </Link>
              <RowActions actions={bookingActions(booking)} />
            </li>
          ))}
        </ul>

        {/* Tablet and up: table */}
        <div className="admin-table-wrap hidden md:block">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>{customTab ? "Request" : "Tour"}</th>
                <th className="text-right">{customTab ? "Budget" : "Amount"}</th>
                <th>Status</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ booking, trip, amount, isLatest, persons }) => (
                <tr key={booking.id}>
                  <td className="max-w-64">
                    <div className="flex items-center gap-2">
                      <Link to={`/admin/bookings/${booking.id}`} className="cell-primary truncate hover:text-brand-700">
                        {booking.customer || "—"}
                      </Link>
                      {isLatest ? <Badge tone="brand">New</Badge> : null}
                    </div>
                    <div className="mt-0.5 text-xs text-subtle">{booking.bookingCode}</div>
                  </td>
                  <td className="max-w-72">
                    <div className="truncate text-navy-900">{trip.title}</div>
                    <div className="mt-0.5 text-xs text-subtle">{trip.meta}</div>
                  </td>
                  <td className="whitespace-nowrap text-right">
                    <div className="font-semibold text-navy-900 tabular-nums">{amount}</div>
                    <div className="mt-0.5 text-xs text-subtle">
                      {customTab ? persons : humanizeValue(booking.paymentMethod)}
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <StatusBadge status={booking.status} />
                      {!customTab ? <StatusBadge status={booking.paymentLabel || booking.payment} /> : null}
                    </div>
                  </td>
                  <td className="w-px whitespace-nowrap">
                    <RowActions actions={bookingActions(booking)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  const renderPlans = () => {
    if (isLoading) return <SkeletonRows rows={2} />;
    if (!createdPlans.length) {
      return (
        <EmptyState
          icon={FileText}
          title="No itineraries created yet"
          description={`Open a ${customTab ? "custom request" : "standard booking"} and use Edit itinerary. The saved plan appears here automatically.`}
        />
      );
    }

    const rows = createdPlans.map((booking) => {
      const itinerary = getSavedItinerary(booking);
      return {
        booking,
        title: itinerary?.title || "Created tour plan",
        meta: `${humanizeValue(itinerary?.status || "draft")} · ${formatCurrencyAmount(itinerary?.finalBudget, itinerary?.currency || "PKR")}`,
        destination: customTab ? getCustomRequestDetails(booking).preferredDestinations : booking.tour || "Selected tour",
      };
    });

    return (
      <>
        <ul className="divide-y divide-line md:hidden">
          {rows.map(({ booking, title, meta, destination }) => (
            <li key={`plan-${booking.id}`} className="flex items-start gap-3 px-4 py-3.5">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-navy-900">{title}</p>
                <p className="mt-0.5 truncate text-[13px] text-body">{booking.customer} · {destination}</p>
                <p className="mt-0.5 text-xs text-subtle">{meta}</p>
              </div>
              <RowActions actions={planActions(booking)} />
            </li>
          ))}
        </ul>
        <div className="admin-table-wrap hidden md:block">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Itinerary</th>
                <th>{customTab ? "Requested destinations" : "Tour"}</th>
                <th>Status</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ booking, title, meta, destination }) => (
                <tr key={`plan-${booking.id}`}>
                  <td className="max-w-56">
                    <div className="cell-primary truncate">{booking.customer}</div>
                    <div className="mt-0.5 text-xs text-subtle">{booking.bookingCode}</div>
                  </td>
                  <td className="max-w-72">
                    <div className="truncate text-navy-900">{title}</div>
                    <div className="mt-0.5 text-xs text-subtle">{meta}</div>
                  </td>
                  <td className="max-w-64 truncate">{destination}</td>
                  <td><StatusBadge status={booking.status} /></td>
                  <td className="w-px whitespace-nowrap">
                    <RowActions actions={planActions(booking)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  const tabContent = (
    <div className="space-y-5">
      <Card flush>{renderBookings()}</Card>
      <Card
        flush
        title="Saved itineraries"
        description={`Itineraries created for ${customTab ? "custom requests" : "standard bookings"}. Reopen or print them any time.`}
      >
        <div className="border-t border-line">{renderPlans()}</div>
      </Card>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Bookings"
        description="Monitor, confirm and manage customer reservations."
        actions={
          <div className="relative w-[calc(100vw-2rem)] sm:w-72">
            <Search size={15} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
            <Input
              type="search"
              aria-label="Search bookings"
              placeholder={customTab ? "Search name, destination, itinerary…" : "Search name, code, email, tour…"}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9"
            />
          </div>
        }
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        ariaLabel="Booking type"
        items={[
          { value: "standard", label: "Standard bookings", count: tabCounts.standard },
          { value: "custom", label: "Custom requests", count: tabCounts.custom },
        ]}
      >
        <TabPanel value="standard">{!customTab ? tabContent : null}</TabPanel>
        <TabPanel value="custom">{customTab ? tabContent : null}</TabPanel>
      </Tabs>
    </div>
  );
};

export default BookingManagement;
