import { useMemo } from "react";
import { BellRing, Briefcase, History, MessageSquare, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge, Card, EmptyState, ErrorState, PageHeader, SkeletonRows } from "../ui";
import { useBookings, useContacts, useNotifications } from "../../hooks/useCms";
import { useAuth } from "../../context/useAuth";

const formatTime = (value) => {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  const diff = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.round(diff / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
};

const toIso = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const ActivityLog = () => {
  const { user } = useAuth();
  const notificationsQuery = useNotifications();
  const bookingsQuery = useBookings(user?.role === "Admin");
  const contactsQuery = useContacts(user?.role === "Admin");
  const notifications = useMemo(() => notificationsQuery.data || [], [notificationsQuery.data]);
  const bookings = useMemo(() => bookingsQuery.data || [], [bookingsQuery.data]);
  const contacts = useMemo(() => contactsQuery.data || [], [contactsQuery.data]);

  const activityItems = useMemo(() => {
    const items = [];

    if (user?.lastLoginAt) {
      items.push({
        id: `login-${user.id || "current"}`,
        title: "Successful admin sign in",
        detail: `${user.name || "You"} accessed the admin dashboard.`,
        time: user.lastLoginAt,
        tone: "success",
        icon: ShieldCheck,
      });
    }

    notifications.slice(0, 6).forEach((item) => {
      items.push({
        id: `notification-${item.id}`,
        title: item.title || "System notification",
        detail: item.message || "A new admin update was recorded.",
        time: item.time || item.createdAt,
        tone: item.isRead ? "info" : "alert",
        icon: BellRing,
      });
    });

    bookings.slice(0, 5).forEach((booking) => {
      items.push({
        id: `booking-${booking.id}`,
        title: `Booking ${booking.bookingCode || booking.id || ""}`.trim(),
        detail: `${booking.customer || booking.user || "Guest"} booked ${booking.tour || booking.tourTitle || "a tour"}.`,
        time: booking.createdAt || booking.date,
        tone: String(booking.status || "").toLowerCase() === "confirmed" ? "success" : "info",
        icon: Briefcase,
      });
    });

    contacts.slice(0, 4).forEach((contact) => {
      items.push({
        id: `contact-${contact.id}`,
        title: `Inquiry from ${contact.sender || "Guest"}`,
        detail: contact.subject || "New contact message received.",
        time: contact.createdAt || contact.date,
        tone: String(contact.status || "").toLowerCase() === "read" ? "info" : "alert",
        icon: MessageSquare,
      });
    });

    return items
      .filter((item) => item.time)
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 12);
  }, [bookings, contacts, notifications, user]);

  const queries = [notificationsQuery, bookingsQuery, contactsQuery];
  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);
  const retry = () => queries.forEach((q) => q.isError && q.refetch());

  const toneIcon = {
    success: "bg-brand-50 text-brand-700",
    alert: "bg-canvas text-navy-900",
    info: "bg-canvas text-subtle",
  };

  let content;
  if (isLoading && !activityItems.length) {
    content = <SkeletonRows rows={6} />;
  } else if (isError && !activityItems.length) {
    content = <ErrorState onRetry={retry} />;
  } else if (!activityItems.length) {
    content = (
      <EmptyState
        icon={History}
        title="No recent activity"
        description="New admin events will appear here automatically."
      />
    );
  } else {
    content = (
      <ul className="divide-y divide-line">
        {activityItems.map((log) => {
          const Icon = log.icon;
          return (
            <li key={log.id} className="flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-canvas sm:gap-4 sm:px-5">
              <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full", toneIcon[log.tone] || toneIcon.info)}>
                <Icon size={16} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="text-sm font-semibold text-navy-900">{log.title}</p>
                  {log.tone === "alert" && <Badge tone="warning">Needs attention</Badge>}
                </div>
                <p className="mt-0.5 text-[13px] text-subtle">{log.detail}</p>
              </div>
              <time
                dateTime={toIso(log.time)}
                title={toIso(log.time) ? new Date(log.time).toLocaleString() : undefined}
                className="shrink-0 whitespace-nowrap pt-0.5 text-xs text-subtle"
              >
                {formatTime(log.time)}
              </time>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Activity log"
        description="Recent sign-ins, bookings, inquiries and notifications."
      />
      <Card flush>{content}</Card>
    </div>
  );
};

export default ActivityLog;
