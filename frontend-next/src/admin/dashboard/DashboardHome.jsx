import { Link } from "@/lib/router";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  Volume2,
  BookOpen,
  Briefcase,
  CalendarCheck,
  FolderOpen,
  Image,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { Badge, Button, Card, EmptyState, ErrorState, PageHeader, Skeleton, SkeletonRows, StatusBadge } from "../ui";
import StatsCard from "./StatsCard";
import {
  useBookings,
  useAdminContentList,
  useDashboardOverview,
  useGallery,
  useNotifications,
  usePublicBlogs,
  usePublicTours,
  useSettings,
  useUsers,
} from "../../hooks/useCms";
import { displayCurrency, formatCurrencyAmount } from "../../utils/currency";

const isManualPaymentMethod = (value = "") => {
  const v = String(value).toLowerCase();
  return ["easypaisa", "jazzcash", "bank_transfer", "manual"].includes(v);
};

const formatNumber = (value) => {
  const num = Number(value || 0);
  return new Intl.NumberFormat("en-US").format(num);
};

const isRecentlyReceived = (value) => {
  if (!value) return false;
  const at = new Date(value).getTime();
  if (Number.isNaN(at)) return false;
  return Date.now() - at <= 2 * 24 * 60 * 60 * 1000;
};


const playTestNotificationSound = async () => {
  if (typeof window === "undefined") return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  const context = new AudioContextClass();
  try {
    if (context.state === "suspended") {
      await context.resume();
    }
    const playTone = (frequency, startTime, duration, gainValue) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(frequency, startTime);
      gainNode.gain.setValueAtTime(0.0001, startTime);
      gainNode.gain.exponentialRampToValueAtTime(gainValue, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      oscillator.start(startTime);
      oscillator.stop(startTime + duration + 0.02);
    };

    const now = context.currentTime;
    playTone(880, now, 0.18, 0.18);
    playTone(1174, now + 0.2, 0.2, 0.16);
  } catch {
    // ignore audio errors
  }
};

const Count = ({ loading, value }) =>
  loading ? <Skeleton className="h-4 w-8" /> : <span className="text-sm font-semibold tabular-nums text-navy-900">{value}</span>;

const DashboardHome = () => {
  const overviewQuery = useDashboardOverview();
  const bookingsQuery = useBookings();
  const notificationsQuery = useNotifications();
  const toursQuery = usePublicTours();
  const blogsQuery = usePublicBlogs();
  const galleryQuery = useGallery();
  const usersQuery = useUsers();
  const { data: settings = {} } = useSettings();
  const activitiesQuery = useAdminContentList("activity");
  const servicesQuery = useAdminContentList("service");

  const overview = overviewQuery.data;
  const bookings = bookingsQuery.data || [];
  const notifications = notificationsQuery.data || [];
  const tours = toursQuery.data || [];
  const blogs = blogsQuery.data || [];
  const gallery = galleryQuery.data || [];
  const users = usersQuery.data || [];
  const activities = activitiesQuery.data || [];
  const services = servicesQuery.data || [];
  const activeCurrency = displayCurrency(settings?.currency || "PKR");

  const stats = overview?.stats || {};
  const latestBookings = [...(overview?.latestBookings || bookings)]
    .sort((a, b) => {
      const aRecent = isRecentlyReceived(a?.createdAt || a?.date);
      const bRecent = isRecentlyReceived(b?.createdAt || b?.date);
      if (aRecent !== bRecent) return Number(bRecent) - Number(aRecent);
      const aTime = new Date(a?.createdAt || a?.date || 0).getTime();
      const bTime = new Date(b?.createdAt || b?.date || 0).getTime();
      return bTime - aTime;
    })
    .slice(0, 6);

  const unreadNotifications = notifications.filter((item) => !item.isRead).length;
  const customPlanRequests = bookings.filter((item) => item.bookingType === "custom" || item.isCustomTour).length;

  const pendingPaymentVerifications = bookings.filter((item) => {
    const status = String(item.status || "").toLowerCase();
    const paymentStatus = String(item.payment || "").toLowerCase();
    if (!isManualPaymentMethod(item.paymentMethod || "")) return false;
    return paymentStatus.includes("pending") || paymentStatus.includes("unverified") || status === "pending";
  }).length;

  const overviewLoading = overviewQuery.isLoading;
  const recentLoading = overviewLoading || (!overview?.latestBookings && bookingsQuery.isLoading);
  const recentError = !recentLoading && !latestBookings.length && overviewQuery.isError && bookingsQuery.isError;

  const cards = [
    { title: "Total bookings", value: formatNumber(stats.totalBookings ?? bookings.length), hint: "Bookings received", loading: overviewLoading },
    { title: "Revenue", value: formatCurrencyAmount(stats.totalRevenue || 0, activeCurrency), hint: "Confirmed collections", loading: overviewLoading },
    { title: "Users", value: formatNumber(stats.totalUsers ?? users.length), hint: "Registered accounts", loading: overviewLoading },
    { title: "Pending payments", value: formatNumber(pendingPaymentVerifications), hint: "Need verification", loading: bookingsQuery.isLoading },
  ];
  const attention = [
    { label: "Unread updates", value: unreadNotifications, to: "/admin/notifications", icon: Bell, loading: notificationsQuery.isLoading },
    { label: "Custom requests", value: customPlanRequests, to: "/admin/bookings", icon: MessageSquare, loading: bookingsQuery.isLoading },
  ];
  // "Notifications" and "Custom requests" are already reachable from the attention links
  // above, so quick actions keep the remaining shortcuts and carry the content counts.
  const quickLinks = [
    { title: "Review payments", to: "/admin/bookings", icon: ShieldCheck },
    { title: "Manage tours", to: "/admin/tours", icon: FolderOpen, count: tours.length, loading: toursQuery.isLoading },
    { title: "Manage activities", to: "/admin/activities", icon: Briefcase, count: activities.length, loading: activitiesQuery.isLoading },
    { title: "Manage services", to: "/admin/services", icon: BookOpen, count: services.length, loading: servicesQuery.isLoading },
    { title: "Blogs", to: "/admin/blogs", icon: BookOpen, count: blogs.length, loading: blogsQuery.isLoading },
    { title: "Media", to: "/admin/gallery", icon: Image, count: gallery.length, loading: galleryQuery.isLoading },
  ];

  const retryRecent = () => {
    overviewQuery.refetch();
    bookingsQuery.refetch();
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Overview"
        description="Bookings, payments and website content."
        actions={
          <>
            <Button variant="ghost" size="sm" icon={Volume2} onClick={playTestNotificationSound}>Test sound</Button>
            <Button variant="secondary" size="sm" to="/" iconRight={ArrowUpRight}>View website</Button>
          </>
        }
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Business metrics">
        {cards.map((card) => <StatsCard key={card.title} {...card} />)}
      </section>

      <section className="grid gap-3 sm:grid-cols-2" aria-label="Needs attention">
        {attention.map(({ label, value, to, icon: Icon, loading }) => (
          <Link
            key={label}
            to={to}
            className="group flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 transition-colors hover:bg-canvas"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
              <Icon size={15} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1 text-sm font-medium text-navy-900">{label}</span>
            <Count loading={loading} value={value} />
            <ArrowRight size={14} aria-hidden="true" className="text-subtle transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card
          flush
          className="lg:col-span-2"
          title="Recent bookings"
          actions={<Button variant="ghost" size="sm" to="/admin/bookings" iconRight={ArrowRight}>View all</Button>}
        >
          {recentLoading ? (
            <SkeletonRows rows={5} className="border-t border-line" />
          ) : recentError ? (
            <ErrorState onRetry={retryRecent} className="border-t border-line" />
          ) : latestBookings.length ? (
            <ul className="divide-y divide-line border-t border-line">
              {latestBookings.map((item) => (
                <li key={item.id || item.bookingCode}>
                  <Link
                    to={item.id ? `/admin/bookings/${item.id}` : "/admin/bookings"}
                    className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-canvas sm:px-5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-sm font-semibold text-navy-900">
                        <span className="truncate">{item.user || item.customer || "Guest"}</span>
                        {isRecentlyReceived(item.createdAt || item.date) && <Badge tone="brand">New</Badge>}
                      </p>
                      <p className="mt-0.5 truncate text-[13px] text-subtle">{item.tour || item.tourTitle || item.bookingCode || "Tour booking"}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
                      <span className="text-sm font-semibold tabular-nums text-navy-900">{formatCurrencyAmount(item.amount || 0, item.currency || "PKR")}</span>
                      <StatusBadge status={item.status || "pending"} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={CalendarCheck} title="No bookings yet" description="New bookings will show up here." className="border-t border-line" />
          )}
        </Card>

        <Card flush title="Quick actions">
          <ul className="divide-y divide-line border-t border-line">
            {quickLinks.map(({ title, to, icon: Icon, count, loading }) => (
              <li key={title}>
                <Link to={to} className="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-canvas sm:px-5">
                  <Icon size={15} aria-hidden="true" className="shrink-0 text-subtle" />
                  <span className="min-w-0 flex-1 text-sm font-medium text-navy-900">{title}</span>
                  {count !== undefined && <Count loading={loading} value={count} />}
                  <ArrowRight size={14} aria-hidden="true" className="text-subtle transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
