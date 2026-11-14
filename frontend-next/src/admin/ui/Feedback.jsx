import { cn } from "@/lib/utils";
import { Button } from "./Button";

/** Shown when a list or section has no data (NOT while loading). */
export const EmptyState = ({ icon: Icon, title, description, action, className }) => (
  <div className={cn("flex flex-col items-center justify-center px-6 py-10 text-center", className)}>
    {Icon && (
      <span className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-canvas text-subtle">
        <Icon size={18} aria-hidden="true" />
      </span>
    )}
    <p className="text-sm font-semibold text-navy-900">{title}</p>
    {description && <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-subtle">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

/** Shown when a request failed, with a retry. */
export const ErrorState = ({ title = "Couldn't load this data", description, onRetry, className }) => (
  <div role="alert" className={cn("flex flex-col items-center px-6 py-10 text-center", className)}>
    <p className="text-sm font-semibold text-navy-900">{title}</p>
    {description && <p className="mt-1 max-w-sm text-[13px] text-subtle">{description}</p>}
    {onRetry && <Button size="sm" className="mt-4" onClick={onRetry}>Try again</Button>}
  </div>
);

export const Skeleton = ({ className }) => <div aria-hidden="true" className={cn("skeleton h-4", className)} />;

/** Placeholder rows for a list/table while loading. */
export const SkeletonRows = ({ rows = 5, className }) => (
  <div aria-busy="true" aria-label="Loading" className={cn("divide-y divide-line", className)}>
    {Array.from({ length: rows }, (_, index) => (
      <div key={index} className="flex items-center gap-4 px-4 py-3.5">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="hidden h-6 w-20 sm:block" />
      </div>
    ))}
  </div>
);
