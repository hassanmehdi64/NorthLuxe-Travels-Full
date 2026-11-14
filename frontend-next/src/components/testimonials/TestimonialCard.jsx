import { Star } from "lucide-react";

const formatReviewDate = (date) => {
  if (!date) return null;
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

export default function TestimonialCard({ name, role, avatar, message, rating = 5, date, location }) {
  const value = Number(rating);
  const safeRating = Number.isFinite(value) ? Math.max(1, Math.min(5, value || 5)) : 5;
  const reviewDate = formatReviewDate(date);
  const initials = String(name || "NL").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return (
    <article className="card flex h-full flex-col p-5">
      <div className="flex items-center gap-0.5" aria-label={`${safeRating} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, index) => (
          <Star key={index} size={14} aria-hidden="true" className={index < Math.round(safeRating) ? "fill-sand text-sand" : "text-line-strong"} />
        ))}
      </div>
      <blockquote className="mb-4 mt-3 line-clamp-5 text-[15px] leading-relaxed text-body">“{message}”</blockquote>
      <div className="mt-auto flex items-center gap-3 border-t border-line pt-4">
        <div className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-50 text-xs font-bold text-brand-700" aria-hidden="true">
          <span>{initials}</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {avatar && <img src={avatar} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" onError={(event) => { event.currentTarget.hidden = true; }} />}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-navy-900">{name}</h3>
          {(location || role) && <p className="truncate text-xs text-subtle">{location || role}</p>}
        </div>
        {reviewDate && <span className="shrink-0 text-xs text-subtle">{reviewDate}</span>}
      </div>
    </article>
  );
}
