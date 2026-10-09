import { useMemo, useState } from "react";
import { Link } from "@/lib/router";
import {
  ArrowLeft,
  Clock3,
  MapPin,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { formatCurrencyAmount } from "../../utils/currency";

const HeroFact = ({ icon: Icon, label, value }) => (
  <div className="rounded-lg border border-[rgba(15,23,42,0.08)] bg-theme-surface px-3 py-2.5 ">
    <div className="flex items-center gap-2 text-[var(--c-brand)]">
      <Icon size={13} />
      <span className="text-[10px] font-medium text-muted">
        {label}
      </span>
    </div>

    <p className="mt-1 text-xs font-semibold leading-5 text-theme">
      {value}
    </p>
  </div>
);

const GalleryImage = ({ src, alt, className = "", onError, loading = "lazy" }) => (
  <img
    src={src}
    alt={alt}
    loading={loading}
    decoding="async"
    onError={onError}
    className={`w-full object-cover object-center ${className}`}
  />
);

const getCustomRequestState = (tour) => ({
  sourceTour: {
    id: tour.id,
    title: tour.title,
    location: tour.location,
    price: tour.price,
    currency: tour.currency,
  },
});

export const TourDetailsBreadcrumbs = ({ tour }) => (
  <nav
    aria-label="Breadcrumb"
    className="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold text-muted">
    <Link to="/tours" className="inline-flex items-center gap-1 transition hover:text-[var(--c-brand)]">
      <ArrowLeft size={13} /> All tours
    </Link>
    <span className="text-slate-300">/</span>
    <span className="truncate text-theme">{tour.title}</span>
  </nav>
);

export const TourDetailsHeader = ({
  tour,
  ratingValue,
  reviewCount,
  planLabel,
}) => {
  const durationText = tour.durationLabel || (tour.durationDays ? `${tour.durationDays} Days` : "");
  const locationText = tour.location || tour.destination || "";

  return (
    <header className="tour-detail-header grid gap-5 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-[0_6px_20px_rgba(var(--c-brand-rgb),0.04)] sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] lg:items-end">
      <div className="min-w-0">
        {locationText ? <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.17em] text-[var(--c-brand)]"><MapPin size={11} />{locationText}</span> : null}
        <h1 className="mt-2 max-w-4xl text-[1.6rem] font-bold leading-[1.1] tracking-[-0.035em] text-theme sm:text-[2rem] lg:text-[2.35rem]">{tour.title}</h1>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted">
          {ratingValue > 0 ? <span className="inline-flex items-center gap-1.5"><span className="flex items-center gap-0.5 text-[var(--c-brand)]">{Array.from({ length: 5 }).map((_, idx) => <Star key={idx} size={11} className={idx < Math.round(ratingValue) ? "fill-current" : "opacity-25"} />)}</span><span className="font-semibold text-theme">{ratingValue.toFixed(1)}</span></span> : null}
          {reviewCount > 0 ? <span>{reviewCount} reviews</span> : null}
        </div>
        {tour.shortDescription ? <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{tour.shortDescription}</p> : null}
      </div>

      {durationText || planLabel ? <div className="grid gap-2 sm:grid-cols-2">
        {durationText ? <HeroFact icon={Clock3} label="Duration" value={durationText} /> : null}
        {planLabel ? <HeroFact icon={Users} label="Group Size" value={planLabel} /> : null}
      </div> : null}
    </header>
  );
};

export const TourDetailsActions = ({
  tour,
  layout = "responsive",
  className = "",
}) => {
  const gridClass =
    layout === "compact"
      ? "grid-cols-2"
      : layout === "stacked"
        ? "grid-cols-1"
        : "grid-cols-1 sm:grid-cols-2";

  const buttonSize =
    layout === "compact"
      ? "h-11 px-2 text-[11px] sm:text-xs"
      : "h-11 px-4 text-xs";

  return (
    <div className={`grid w-full gap-2 ${gridClass} ${className}`}>
      <Link
        to={`/book/${tour.id}`}
        className={`ql-btn-primary inline-flex w-full cursor-pointer items-center justify-center rounded-lg font-semibold whitespace-nowrap ${buttonSize}`}>
        Book Now
      </Link>

      <Link
        to="/custom-plan-request"
        state={getCustomRequestState(tour)}
        className={`ql-btn-secondary inline-flex w-full cursor-pointer items-center justify-center whitespace-nowrap ${buttonSize}`}>
        Custom Request
      </Link>
    </div>
  );
};

export const TourImageGallery = ({ images = [], title }) => {
  const [showAll, setShowAll] = useState(false);
  const [failedImages, setFailedImages] = useState([]);
  const validImages = useMemo(
    () => [...new Set(images.filter(Boolean))].filter((image) => !failedImages.includes(image)),
    [images, failedImages],
  );
  if (!validImages.length) return null;
  const visibleImages = showAll ? validImages : validImages.slice(0, 3);
  const handleImageError = (image) => setFailedImages((current) => current.includes(image) ? current : [...current, image]);
  return (
    <section className="tour-photo-gallery" aria-label={`${title} photos`}>
      <div className="brand-gallery-grid tour-photo-grid" style={{ "--photo-columns": Math.min(visibleImages.length, 3) }}>
        {visibleImages.map((image, index) => (
          <a key={image} href={image} target="_blank" rel="noreferrer" className="brand-gallery-tile tour-photo-tile" aria-label={`Open ${title} photo ${index + 1} at full size`}>
            <GalleryImage src={image} alt={`${title}, photo ${index + 1}`} loading={index === 0 ? "eager" : "lazy"} onError={() => handleImageError(image)} />
          </a>
        ))}
      </div>
      {validImages.length > 3 && <button type="button" onClick={() => setShowAll((current) => !current)} aria-expanded={showAll} className="ql-btn-secondary mt-3">{showAll ? "Show fewer photos" : `Show all ${validImages.length} photos`}</button>}
    </section>
  );
};

export const TourBookingCard = ({ tour }) => (
  <aside className="tour-booking-card overflow-hidden rounded-xl border border-[rgba(15,23,42,0.08)] bg-theme-surface shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
    <div className="h-0.5 bg-[var(--c-brand)]" />
    <div className="flex flex-col gap-5 p-5">
      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">
          Starting from
        </p>

        <div className="mt-2 flex items-end gap-2">
          <span className="text-[1.35rem] font-bold leading-none text-theme">
            {formatCurrencyAmount(tour.price, tour.currency)}
          </span>
        </div>

        <p className="mt-1 text-[11px] text-muted">
          Per trip, based on selected plan
        </p>
      </div>

      <TourDetailsActions tour={tour} layout="stacked" />

      <p className="flex items-center gap-2 border-t border-theme pt-4 text-[11px] text-muted"><ShieldCheck size={14} className="text-[var(--c-brand)]" />Secure booking request</p>
    </div>
  </aside>
);

export const MobileBookingBar = ({ tour }) => (
  <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[rgba(15,23,42,0.08)] bg-white/96 px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
    <div className="mx-auto flex max-w-[1600px] items-center gap-3">
      <Link
        to="/tours"
        className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[rgba(15,23,42,0.12)] text-theme transition hover:border-[rgba(var(--c-brand-rgb),0.4)] hover:text-[var(--c-brand)]"
        aria-label="Back to tours">
        <ArrowLeft size={18} />
      </Link>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-muted">
          Starting from
        </p>

        <p className="truncate text-[15px] font-semibold text-theme">
          {formatCurrencyAmount(tour.price, tour.currency)}
        </p>
      </div>

      <Link
        to={`/book/${tour.id}`}
        className="ql-btn-primary inline-flex h-11 min-w-[132px] shrink-0 cursor-pointer items-center justify-center rounded-xl px-4 text-sm font-semibold whitespace-nowrap">
        Book Now
      </Link>
    </div>
  </div>
);
