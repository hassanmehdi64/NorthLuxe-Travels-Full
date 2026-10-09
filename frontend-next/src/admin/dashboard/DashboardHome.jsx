import { Link } from "@/lib/router";
import {
  ArrowRight,
  Bell,
  Volume2,
  BookOpen,
  Briefcase,
  FolderOpen,
  Image,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
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

const DashboardHome = () => {
  const { data: overview } = useDashboardOverview();
  const { data: bookings = [] } = useBookings();

  const { data: notifications = [] } = useNotifications();
  const { data: tours = [] } = usePublicTours();
  const { data: blogs = [] } = usePublicBlogs();
  const { data: gallery = [] } = useGallery();
  const { data: users = [] } = useUsers();
  const { data: settings = {} } = useSettings();
  const { data: activities = [] } = useAdminContentList("activity");
  const { data: services = [] } = useAdminContentList("service");
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

  const cards = [
    { title: "Total bookings", value: formatNumber(stats.totalBookings ?? bookings.length), hint: "Bookings received" },
    { title: "Revenue", value: formatCurrencyAmount(stats.totalRevenue || 0, activeCurrency), hint: "Confirmed collections" },
    { title: "Users", value: formatNumber(stats.totalUsers ?? users.length), hint: "Registered accounts" },
    { title: "Pending payments", value: formatNumber(pendingPaymentVerifications), hint: "Need verification" },
  ];
  const quickLinks = [
    { title: "Review payments", to: "/admin/bookings", icon: ShieldCheck },
    { title: "Custom requests", to: "/admin/bookings", icon: MessageSquare },
    { title: "Notifications", to: "/admin/notifications", icon: Bell },
    { title: "Manage tours", to: "/admin/tours", icon: FolderOpen },
    { title: "Manage activities", to: "/admin/activities", icon: Briefcase },
    { title: "Manage services", to: "/admin/services", icon: BookOpen },
  ];

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard-heading">
        <div><h1 className="admin-page-title">Overview</h1><p className="admin-page-subtitle">Bookings, payments and website content.</p></div>
        <div className="admin-dashboard-heading-actions"><button type="button" onClick={playTestNotificationSound} className="admin-soft-button-ghost"><Volume2 size={14} />Test sound</button><Link to="/" className="admin-soft-button-ghost">View website<ArrowRight size={13} /></Link></div>
      </header>
      <section className="admin-dashboard-metrics" aria-label="Business metrics">
        {cards.map((card) => <article key={card.title} className="admin-soft-kpi"><p className="admin-metric-label">{card.title}</p><p className="admin-metric-value">{card.value}</p><p className="admin-metric-hint">{card.hint}</p></article>)}
      </section>
      <section className="admin-dashboard-attention" aria-label="Operational updates">
        <Link to="/admin/notifications"><Bell size={15} /><span>Unread updates</span><strong>{unreadNotifications}</strong><ArrowRight size={13} /></Link>
        <Link to="/admin/bookings"><MessageSquare size={15} /><span>Custom requests</span><strong>{customPlanRequests}</strong><ArrowRight size={13} /></Link>
      </section>
      <div className="admin-dashboard-columns">
        <section className="admin-soft-panel admin-recent-bookings">
          <div className="admin-panel-heading"><h2 className="admin-section-title">Recent bookings</h2><Link to="/admin/bookings">View all<ArrowRight size={12} /></Link></div>
          <div className="admin-booking-list">
            {latestBookings.length ? latestBookings.map((item) => <Link key={item.id || item.bookingCode} to={item.id ? `/admin/bookings/${item.id}` : "/admin/bookings"} className="admin-booking-row">
              <div className="min-w-0"><p className="admin-booking-name">{item.user || item.customer || "Guest"}{isRecentlyReceived(item.createdAt || item.date) && <span className="admin-soft-badge admin-soft-badge-primary">New</span>}</p><p className="admin-booking-tour">{item.tour || item.tourTitle || item.bookingCode || "Tour booking"}</p></div>
              <div className="admin-booking-amount"><p>{formatCurrencyAmount(item.amount || 0, item.currency || "PKR")}</p><span className="admin-soft-badge admin-soft-badge-muted">{item.status || "pending"}</span></div>
            </Link>) : <p className="admin-empty-note">No bookings yet.</p>}
          </div>
        </section>
        <section className="admin-soft-panel admin-quick-actions">
          <div className="admin-panel-heading"><h2 className="admin-section-title">Quick actions</h2></div>
          {quickLinks.map(({ title, to, icon: Icon }) => <Link key={title} to={to} className="admin-quick-action"><span className="admin-action-icon"><Icon size={15} /></span><span>{title}</span><ArrowRight size={13} /></Link>)}
        </section>
      </div>
      <section className="admin-soft-panel admin-content-summary">
        <div className="admin-panel-heading"><h2 className="admin-section-title">Website content</h2></div>
        <div className="admin-content-links">
          {[["Tours", tours.length, "/admin/tours", Briefcase], ["Activities", activities.length, "/admin/activities", Briefcase], ["Services", services.length, "/admin/services", BookOpen], ["Blogs", blogs.length, "/admin/blogs", BookOpen], ["Media", gallery.length, "/admin/gallery", Image]].map(([label, count, to, Icon]) => <Link key={label} to={to}><Icon size={15} /><span>{label}</span><strong>{count}</strong></Link>)}
        </div>
      </section>
    </div>
  );
};

export default DashboardHome;
