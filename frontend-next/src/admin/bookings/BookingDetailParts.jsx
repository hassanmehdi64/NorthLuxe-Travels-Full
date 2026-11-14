import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, DetailList } from "../ui";

const PLACEHOLDERS = new Set(["", "-", "—", "none", "not provided", "not selected", "not specified", "not linked", "0"]);

/** True when a value carries real information (not empty or a "Not provided"-style placeholder). */
export const hasValue = (value) => {
  if (value === undefined || value === null || value === false) return false;
  if (typeof value === "number") return value !== 0;
  if (typeof value !== "string") return true;
  return !PLACEHOLDERS.has(value.trim().toLowerCase());
};

/** Display form of a stored enum-ish value: "visa_card" -> "Visa card". */
export const humanize = (value) => {
  const text = String(value ?? "").replace(/_/g, " ").trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
};

export const formatDate = (value, withTime = false) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return withTime
    ? date.toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })
    : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};

/**
 * Card with a label/value list. Rows without a real value are dropped, and the
 * whole card is hidden when nothing is left (unless `children` adds content).
 */
export const DetailSection = ({ title, description, actions, items = [], children, keep = [], className }) => {
  const visible = items.filter(Boolean).filter(([label, value]) => keep.includes(label) || hasValue(value));
  if (!visible.length && !children) return null;
  return (
    <Card title={title} description={description} actions={actions} className={className}>
      {visible.length ? <DetailList items={visible} /> : null}
      {children ? <div className={visible.length ? "mt-4 border-t border-line pt-4" : ""}>{children}</div> : null}
    </Card>
  );
};

/** Free text block (requests, notes). Hidden when empty. */
export const TextSection = ({ title, text }) =>
  hasValue(text) ? (
    <Card title={title}>
      <p className="whitespace-pre-line break-words text-sm leading-relaxed text-body">{text}</p>
    </Card>
  ) : null;

/** One key figure in the summary row. */
export const Fact = ({ label, value, emphasis = false }) => (
  <div className="min-w-0">
    <dt className="text-xs font-medium text-subtle">{label}</dt>
    <dd className={cn("mt-0.5 truncate text-[15px] font-semibold tabular-nums", emphasis ? "text-brand-700" : "text-navy-900")}>
      {hasValue(value) || value === 0 ? value : "—"}
    </dd>
  </div>
);

/** Compact horizontal progress stepper. stages: [{ key, title, done, active }] */
export const BookingStepper = ({ stages }) => (
  <ol className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:flex sm:items-center sm:gap-0" aria-label="Booking progress">
    {stages.map((stage, index) => {
      const reached = stage.done || stage.active;
      return (
        <li key={stage.key} className="flex min-w-0 items-center gap-2 sm:flex-1">
          <span
            className={cn(
              "grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs font-semibold",
              stage.done
                ? "border-brand bg-brand text-white"
                : reached
                  ? "border-brand bg-brand-50 text-brand-700"
                  : "border-line-strong bg-surface text-subtle",
            )}
          >
            {stage.done ? <Check size={13} aria-hidden="true" /> : index + 1}
          </span>
          <span className={cn("truncate text-[13px] font-medium", reached ? "text-navy-900" : "text-subtle")}>
            {stage.title}
            <span className="sr-only">{stage.done ? " (done)" : stage.active ? " (in progress)" : ""}</span>
          </span>
          {index < stages.length - 1 ? (
            <span aria-hidden="true" className={cn("mx-3 hidden h-px flex-1 sm:block", stage.done ? "bg-brand" : "bg-line-strong")} />
          ) : null}
        </li>
      );
    })}
  </ol>
);
