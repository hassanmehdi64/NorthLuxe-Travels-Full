import { cn } from "@/lib/utils";

/**
 * Surface for grouped content. Optional header (title/description/actions).
 * Use `flush` when the body manages its own padding (tables, lists).
 */
export const Card = ({ title, description, actions, children, className, bodyClassName, flush = false, as: Tag = "section", ...props }) => (
  <Tag className={cn("min-w-0 rounded-card border border-line bg-surface", className)} {...props}>
    {(title || actions) && (
      <header className={cn("flex flex-wrap items-start justify-between gap-x-4 gap-y-2 px-4 pt-4 sm:px-5", flush && "pb-3")}>
        <div className="min-w-0">
          {title && <h2 className="text-[15px] font-semibold leading-snug text-navy-900">{title}</h2>}
          {description && <p className="mt-0.5 text-[13px] leading-relaxed text-subtle">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </header>
    )}
    <div className={cn(flush ? "" : "p-4 sm:p-5", !flush && (title || actions) && "pt-3 sm:pt-3", bodyClassName)}>{children}</div>
  </Tag>
);

/** Label/value pairs in a compact two-column list. */
export const DetailList = ({ items, className }) => (
  <dl className={cn("grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2", className)}>
    {items.filter(Boolean).map(([label, value]) => (
      <div key={label} className="min-w-0">
        <dt className="text-xs font-medium text-subtle">{label}</dt>
        <dd className="mt-0.5 break-words font-medium text-navy-900">{value === undefined || value === null || value === "" ? "—" : value}</dd>
      </div>
    ))}
  </dl>
);
