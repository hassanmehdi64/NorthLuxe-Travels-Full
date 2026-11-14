"use client";

import { useState } from "react";
import { Popover } from "radix-ui";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { CalendarDays, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const toKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const fromKey = (key) => (key ? new Date(`${key}T00:00:00`) : undefined);

export const formatDateLabel = (key) =>
  key ? fromKey(key).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "";

/**
 * Styled date picker (Radix Popover + react-day-picker). Value is "YYYY-MM-DD".
 * Pass `id`/aria props through so it works inside <Field>.
 */
export default function DatePickerField({
  value,
  onChange,
  placeholder = "Choose a date",
  minDate,
  disabledDays,
  invalid = false,
  className,
  id,
  ...ariaProps
}) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const min = minDate || today;
  const selected = fromKey(value);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        id={id}
        type="button"
        aria-invalid={invalid || ariaProps["aria-invalid"] || undefined}
        aria-describedby={ariaProps["aria-describedby"]}
        className={cn(
          "brand-search-control h-10",
          (invalid || ariaProps["aria-invalid"]) && "border-red-500 shadow-[0_0_0_3px_rgb(217_45_32/0.1)]",
          className,
        )}
      >
        <span className={cn("inline-flex items-center gap-2", !value && "text-subtle")}>
          <CalendarDays size={16} aria-hidden="true" className="text-brand" />
          {value ? formatDateLabel(value) : placeholder}
        </span>
        <ChevronDown size={15} aria-hidden="true" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="brand-search-calendar" align="start" sideOffset={6} collisionPadding={12} aria-label="Choose a date">
          <DayPicker
            mode="single"
            selected={selected}
            defaultMonth={selected || min}
            startMonth={new Date(min.getFullYear(), min.getMonth(), 1)}
            disabled={[{ before: min }, ...(disabledDays ? [disabledDays] : [])]}
            autoFocus
            onSelect={(day) => {
              onChange(day ? toKey(day) : "");
              setOpen(false);
            }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
