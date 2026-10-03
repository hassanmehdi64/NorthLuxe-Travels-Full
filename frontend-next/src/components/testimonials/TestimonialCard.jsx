import { Quote, Star } from "lucide-react";

const formatReviewDate = (date) => {
  if (!date) return null;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

const TestimonialCard = ({ name, role, avatar, message, rating = 5, date, location }) => {
  const safeRating = Math.max(1, Math.min(5, Number(rating || 5)));
  const reviewDate = formatReviewDate(date);
  const initials = String(name || "NL")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <article className="group flex h-full min-h-[224px] w-full max-w-full overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_3px_12px_rgba(var(--c-brand-rgb),0.055)] transition-[border-color,box-shadow] duration-300 hover:border-[rgba(var(--c-brand-rgb),0.42)] hover:shadow-[0_8px_20px_rgba(var(--c-brand-rgb),0.09)] sm:min-h-[232px] sm:p-5">
      <div className="flex w-full flex-col">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-[rgba(var(--c-brand-rgb),0.2)] bg-[rgba(var(--c-brand-rgb),0.08)] text-[11px] font-bold text-[var(--c-brand-dark)] transition-colors duration-300 group-hover:border-[var(--c-brand)]">
              <span>{initials}</span>
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : null}
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="mb-1 truncate text-sm font-bold leading-tight tracking-tight text-[var(--c-navy)]">
                {name}
              </h4>
              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                <span className="max-w-full truncate text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--c-brand)]">
                  {location || role}
                </span>
                {reviewDate && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-muted/30" />
                    <span className="shrink-0 text-[9px] font-semibold uppercase text-slate-400">
                      {reviewDate}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[rgba(var(--c-brand-rgb),0.07)] text-[var(--c-brand)]">
            <Quote size={13} />
          </span>
        </div>

        <div className="mb-3 flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={`${name}-star-${index}`}
              size={11}
              className={index < safeRating ? "fill-current text-[var(--c-brand)]" : "text-muted/20"}
            />
          ))}
        </div>

        <p className="testimonial-message flex-1 overflow-hidden text-[13px] font-medium leading-[1.65] text-slate-600">
          &quot;{message}&quot;
        </p>

        <div className="mt-auto pt-3.5">
          <span className="block h-px w-8 bg-[var(--c-brand)]" />
        </div>
      </div>
    </article>
  );
};

export default TestimonialCard;
