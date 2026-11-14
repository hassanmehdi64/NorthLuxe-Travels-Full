"use client";

import { useState } from "react";
import { Popover } from "radix-ui";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import SelectMenu from "./SelectMenu";
import { cn } from "@/lib/utils";

const toKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const fromKey = (key) => (key ? new Date(`${key}T00:00:00`) : undefined);

export const formatDateLabel = (key) =>
  key ? fromKey(key).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "";

const MONTHS = Array.from({ length: 12 }, (_, m) => new Date(2026, m, 1).toLocaleDateString("en-GB", { month: "long" }));
const monthStart = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

/**
 * The site's one date picker (Radix Popover + react-day-picker). Value is "YYYY-MM-DD".
 * Header, month/year jump menus (shared SelectMenu), prev/next, and "Clear date".
 * Pass `id`/aria props through so it works inside <Field>.
 */
export default function DatePickerField({
  value,
  onChange,
  placeholder = "Choose a date",
  title = "Choose a date",
  subtitle = "Past dates can't be selected",
  minDate,
  disabledDays,
  invalid = false,
  size = "md",
  yearsAhead = 5,
  className,
  id,
  ...ariaProps
}) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const min = (typeof minDate === "string" ? fromKey(minDate) : minDate) || today;
  const selected = fromKey(value);
  const first = monthStart(min);
  const last = new Date(min.getFullYear() + yearsAhead, 11, 1);
  const [month, setMonth] = useState(() => monthStart(selected || min));
  const goTo = (date) => setMonth(date < first ? first : date > last ? last : date);

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        if (next) setMonth(monthStart(selected && selected >= min ? selected : min));
        setOpen(next);
      }}
    >
      <Popover.Trigger
        id={id}
        type="button"
        aria-invalid={invalid || ariaProps["aria-invalid"] || undefined}
        aria-describedby={ariaProps["aria-describedby"]}
        aria-label={ariaProps["aria-label"]}
        aria-labelledby={ariaProps["aria-labelledby"]}
        className={cn("select-trigger", size === "sm" && "select-trigger-sm", className)}
      >
        <CalendarDays size={16} aria-hidden="true" className="select-trigger-icon" />
        <span className={cn("select-trigger-value", !value && "text-subtle")}>
          {value ? formatDateLabel(value) : placeholder}
        </span>
        <span className="select-trigger-chevron"><ChevronDown size={16} aria-hidden="true" /></span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="brand-search-calendar" align="start" sideOffset={6} collisionPadding={12} aria-label={title}>
          <div className="brand-calendar-heading">
            <span className="brand-calendar-heading-icon"><CalendarDays size={16} aria-hidden="true" /></span>
            <div><strong>{title}</strong>{subtitle && <p>{subtitle}</p>}</div>
          </div>
          <div className="brand-calendar-navigation">
            <button type="button" aria-label="Previous month" disabled={month <= first} onClick={() => goTo(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
              <ChevronLeft size={16} />
            </button>
            <SelectMenu
              aria-label="Month"
              size="sm"
              value={String(month.getMonth())}
              onChange={(m) => goTo(new Date(month.getFullYear(), Number(m), 1))}
              options={MONTHS.map((label, m) => ({
                value: String(m),
                label,
                disabled: new Date(month.getFullYear(), m, 1) < first || new Date(month.getFullYear(), m, 1) > last,
              }))}
            />
            <SelectMenu
              aria-label="Year"
              size="sm"
              value={String(month.getFullYear())}
              onChange={(y) => goTo(new Date(Number(y), month.getMonth(), 1))}
              options={Array.from({ length: yearsAhead + 1 }, (_, i) => String(first.getFullYear() + i)).map((y) => ({ value: y, label: y }))}
            />
            <button type="button" aria-label="Next month" disabled={month >= last} onClick={() => goTo(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
              <ChevronRight size={16} />
            </button>
          </div>
          <DayPicker
            mode="single"
            selected={selected}
            month={month}
            onMonthChange={goTo}
            startMonth={first}
            endMonth={last}
            hideNavigation
            classNames={{ month_caption: "brand-calendar-hidden-caption" }}
            disabled={[{ before: min }, ...(disabledDays ? [disabledDays] : [])]}
            autoFocus
            onSelect={(day) => {
              onChange(day ? toKey(day) : "");
              setOpen(false);
            }}
          />
          {value && (
            <button type="button" className="brand-calendar-clear" onClick={() => { onChange(""); setOpen(false); }}>
              Clear date
            </button>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
