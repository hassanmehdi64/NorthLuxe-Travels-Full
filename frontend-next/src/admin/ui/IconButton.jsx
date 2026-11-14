"use client";

import { forwardRef } from "react";
import { Link } from "@/lib/router";
import { cn } from "@/lib/utils";
import { Tooltip } from "./Tooltip";

const VARIANTS = {
  ghost: "border-transparent bg-transparent text-subtle hover:bg-canvas hover:text-navy-900",
  secondary: "border-line-strong bg-surface text-navy-900 hover:bg-canvas",
  danger: "border-transparent bg-transparent text-subtle hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40",
  brand: "border-transparent bg-transparent text-brand-700 hover:bg-brand-50",
};

const SIZES = { sm: "h-8 w-8", md: "h-9 w-9" };

/**
 * Icon-only button. `label` is REQUIRED: it becomes the aria-label and the tooltip.
 * Pass `to` for an internal link.
 */
export const IconButton = forwardRef(function IconButton(
  { label, icon: Icon, variant = "ghost", size = "md", to, tooltip = true, className, badge, iconSize = 17, ...props },
  ref,
) {
  const classes = cn(
    "relative inline-grid shrink-0 place-items-center rounded-control border transition-colors duration-150",
    "disabled:pointer-events-none disabled:opacity-40",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
  const inner = (
    <>
      <Icon size={iconSize} aria-hidden="true" />
      {badge ? (
        <span className="absolute -right-1.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand px-1 text-xs font-bold leading-none text-white ring-2 ring-surface">
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </>
  );
  const element = to ? (
    <Link ref={ref} to={to} aria-label={label} className={classes} {...props}>{inner}</Link>
  ) : (
    <button ref={ref} type="button" aria-label={label} className={classes} {...props}>{inner}</button>
  );
  return tooltip ? <Tooltip content={label}>{element}</Tooltip> : element;
});
