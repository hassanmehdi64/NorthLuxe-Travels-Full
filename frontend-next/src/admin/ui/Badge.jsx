import { cn } from "@/lib/utils";

const TONES = {
  neutral: "bg-canvas text-subtle ring-line",
  brand: "bg-brand-50 text-brand-700 ring-brand-100",
  success: "bg-brand-50 text-brand-700 ring-brand-100",
  warning: "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900",
  danger: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900",
  info: "bg-sky-50 text-sky-800 ring-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-900",
};

/**
 * ONE colour map for every status shown in the admin (bookings, payments,
 * inquiries, content). Add new statuses here, never inline.
 */
const STATUS_TONES = {
  // booking status
  pending: "warning",
  confirmed: "success",
  completed: "info",
  cancelled: "danger",
  // payment status
  "verification pending": "warning",
  "partially paid": "info",
  paid: "success",
  failed: "danger",
  refunded: "neutral",
  // inquiries
  new: "brand",
  unread: "warning",
  read: "neutral",
  replied: "success",
  closed: "neutral",
  // content / users
  published: "success",
  draft: "neutral",
  active: "success",
  suspended: "danger",
  featured: "brand",
};

export const statusTone = (status) => STATUS_TONES[String(status || "").trim().toLowerCase()] || "neutral";

const humanize = (value) => {
  const text = String(value || "").replace(/[_-]+/g, " ").trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
};

export const Badge = ({ tone = "neutral", children, className, dot = false }) => (
  <span
    className={cn(
      "inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-xs font-semibold ring-1 ring-inset",
      TONES[tone] || TONES.neutral,
      className,
    )}
  >
    {dot && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />}
    {children}
  </span>
);

/** Badge for a status value, coloured from the shared map. */
export const StatusBadge = ({ status, label, className }) =>
  status ? <Badge tone={statusTone(status)} className={className}>{label || humanize(status)}</Badge> : null;
