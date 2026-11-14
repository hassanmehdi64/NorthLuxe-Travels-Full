"use client";

import { Children, cloneElement, forwardRef, isValidElement, useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Label + control + hint/error. The single child control receives id,
 * aria-invalid and aria-describedby automatically.
 */
export const Field = ({ label, hint, error, required = false, children, className, labelAction }) => {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const child = Children.only(children);
  const control = isValidElement(child)
    ? cloneElement(child, {
        id: child.props.id || id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": [errorId, hintId, child.props["aria-describedby"]].filter(Boolean).join(" ") || undefined,
        required: child.props.required ?? required,
      })
    : child;

  return (
    <div className={cn("min-w-0", className)}>
      {label && (
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <label htmlFor={child?.props?.id || id} className="text-[13px] font-semibold text-navy-900">
            {label}
            {required && <span className="ml-0.5 text-red-600" aria-hidden="true">*</span>}
          </label>
          {labelAction}
        </div>
      )}
      {control}
      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-red-700 dark:text-red-400">{error}</p>
      ) : hint ? (
        <p id={hintId} className="mt-1.5 text-xs leading-relaxed text-subtle">{hint}</p>
      ) : null}
    </div>
  );
};

const control = "input h-9 bg-surface text-navy-900 border-line-strong";

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(control, className)} {...props} />;
});

export const Select = forwardRef(function Select({ className, children, ...props }, ref) {
  return (
    <select ref={ref} className={cn("select h-9 bg-surface text-navy-900 border-line-strong", className)} {...props}>
      {children}
    </select>
  );
});

export const Textarea = forwardRef(function Textarea({ className, rows = 4, ...props }, ref) {
  return <textarea ref={ref} rows={rows} className={cn("textarea bg-surface text-navy-900 border-line-strong", className)} {...props} />;
});

/** Checkbox with an inline label. */
export const Checkbox = ({ label, description, className, ...props }) => (
  <label className={cn("flex cursor-pointer items-start gap-2.5 text-sm text-navy-900", className)}>
    <input type="checkbox" className="checkbox mt-0.5" {...props} />
    <span>
      <span className="font-medium">{label}</span>
      {description && <span className="mt-0.5 block text-xs text-subtle">{description}</span>}
    </span>
  </label>
);
