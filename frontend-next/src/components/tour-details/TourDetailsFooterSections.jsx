import { Star } from "lucide-react";

const SectionHeading = ({ eyebrow, title, description }) => (
  <div className="space-y-1.5">
    <p className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--c-brand)]">
      <span className="h-px w-5 bg-[var(--c-brand)]" />
      {eyebrow}
    </p>
    <h2 className="text-lg font-bold leading-tight tracking-[-0.025em] text-theme">
      {title}
    </h2>
    {description ? (
      <p className="max-w-3xl text-xs leading-5 text-muted sm:text-[13px]">
        {description}
      </p>
    ) : null}
  </div>
);

export const ReviewsSection = ({ reviews }) => {
  if (!reviews.length) return null;

  const displayReviews = reviews.slice(0, 3);

  return (
    <section className="w-full border-b border-slate-200 py-6">
      <div className="flex flex-col gap-4">
        <SectionHeading
          eyebrow="Guest Feedback"
          title="Reviews"
          description="Recent guest impressions around comfort, planning, and overall travel experience."
        />
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        {displayReviews.map((item) => (
          <article
            key={item.id}
            className="rounded-xl border border-theme bg-theme-surface p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-theme">
                  {item.name}
                </p>
                <p className="mt-1 text-[12px] text-muted">
                  {[item.tag, item.date].filter(Boolean).join(" | ")}
                </p>
              </div>

              <div className="inline-flex items-center gap-1 rounded-full bg-[rgba(var(--c-brand-rgb),0.1)] px-2.5 py-1 text-[12px] font-bold text-[var(--c-brand)]">
                <Star size={12} className="fill-current" />
                {item.rating}.0
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-muted">
              {item.comment}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
};
