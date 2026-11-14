"use client";

import { Minus, Plus } from "lucide-react";

/** − n + counter with accessible labels (e.g. adults / children). */
export default function GuestStepper({ label, hint, value, onChange, min = 0, max = 20, boxed = false }) {
  const number = Number(value || 0);
  const set = (next) => onChange(Math.max(min, Math.min(max, next)));
  const buttonClass =
    "grid h-8 w-8 place-items-center rounded-full border border-line-strong text-navy-900 transition-colors hover:border-brand hover:text-brand-700 disabled:pointer-events-none disabled:opacity-35";
  if (boxed) {
    // Same height/border as the dropdowns, for form grids. The visible label sits outside.
    return (
      <div className="select-trigger cursor-default justify-between hover:border-line-strong" role="group" aria-label={label}>
        <button type="button" className={buttonClass} onClick={() => set(number - 1)} disabled={number <= min} aria-label={`Fewer ${label.toLowerCase()}`}>
          <Minus size={14} aria-hidden="true" />
        </button>
        <span className="text-[15px] font-semibold tabular-nums text-navy-900" aria-live="polite">{number}</span>
        <button type="button" className={buttonClass} onClick={() => set(number + 1)} disabled={number >= max} aria-label={`More ${label.toLowerCase()}`}>
          <Plus size={14} aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <p className="text-sm font-semibold text-navy-900">{label}</p>
        {hint && <p className="text-xs text-subtle">{hint}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button type="button" className={buttonClass} onClick={() => set(number - 1)} disabled={number <= min} aria-label={`Fewer ${label.toLowerCase()}`}>
          <Minus size={14} aria-hidden="true" />
        </button>
        <span className="w-5 text-center text-sm font-semibold tabular-nums text-navy-900" aria-live="polite" aria-label={`${number} ${label.toLowerCase()}`}>
          {number}
        </span>
        <button type="button" className={buttonClass} onClick={() => set(number + 1)} disabled={number >= max} aria-label={`More ${label.toLowerCase()}`}>
          <Plus size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
