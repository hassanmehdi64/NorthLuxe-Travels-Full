"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { Link } from "@/lib/router";
import { cn } from "@/lib/utils";

const VARIANTS = {
  primary: "bg-brand text-white border-brand hover:bg-brand-700 hover:border-brand-700",
  secondary: "bg-surface text-navy-900 border-line-strong hover:bg-canvas",
  ghost: "bg-transparent text-navy-900 border-transparent hover:bg-canvas",
  danger: "bg-surface text-red-700 border-line-strong hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-950/40",
  "danger-solid": "bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700",
};

const SIZES = {
  sm: "h-8 px-3 gap-1.5 text-[13px]",
  md: "h-9 px-3.5 gap-2 text-sm",
};

/**
 * Admin button. One radius, two sizes, five variants.
 * Pass `to` for an internal link, `href` for an external link.
 * `loading` disables the button and shows a spinner (use while saving).
 */
export const Button = forwardRef(function Button(
  { variant = "secondary", size = "md", icon: Icon, iconRight: IconRight, loading = false, disabled, className, children, to, href, type = "button", ...props },
  ref,
) {
  const classes = cn(
    "inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-control border font-semibold leading-none",
    "transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
  const content = (
    <>
      {loading ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : Icon ? <Icon size={15} aria-hidden="true" /> : null}
      {children}
      {IconRight && !loading ? <IconRight size={15} aria-hidden="true" /> : null}
    </>
  );

  if (to) return <Link ref={ref} to={to} className={classes} {...props}>{content}</Link>;
  if (href) return <a ref={ref} href={href} className={classes} {...props}>{content}</a>;
  return (
    <button ref={ref} type={type} disabled={disabled || loading} aria-busy={loading || undefined} className={classes} {...props}>
      {content}
    </button>
  );
});
