import {
  Check,
  ChevronDown,
  CircleDot,
  Info,
} from "lucide-react";
import { useId } from "react";

const formatListLabel = (value) =>
  String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const SectionHeading = ({ title, description }) => (
  <div className="space-y-2">
    <h2 className="tour-detail-section-title text-theme">{title}</h2>
    {description && <p className="max-w-3xl text-xs leading-5 text-muted">{description}</p>}
  </div>
);

export const OverviewSection = ({ description, packageOverview = [] }) => !description && !packageOverview.length ? null : (
  <section className="w-full border-b border-slate-200 py-6">
    <SectionHeading
      eyebrow="Overview"
      title="Tour Overview"
    />

    <div className="mt-3">
      <div className={`rounded-xl border border-theme bg-theme-surface p-4 shadow-[0_4px_16px_rgba(var(--c-brand-rgb),0.035)] md:p-5 ${packageOverview.length ? "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.55fr)] lg:gap-6" : ""}`}>
        <div className="space-y-3 text-[13px] leading-6 text-muted">
          {String(description || "")
            .split(/\n+/)
            .filter(Boolean)
            .map((paragraph, index) => (
              <p key={`${paragraph.slice(0, 20)}-${index}`}>{paragraph}</p>
            ))}
        </div>

        {packageOverview.length ? (
          <div className="mt-4 border-t border-[rgba(15,23,42,0.08)] pt-4 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <h3 className="text-xs font-semibold text-theme">
              Package Details
            </h3>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {packageOverview.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg bg-theme-bg px-3 py-2.5"
                >
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted">
                    {item.label}
                  </p>

                  <p className="mt-1 text-xs font-medium leading-5 text-theme">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  </section>
);

export const InclusionsSection = ({ includedServices = [], beforeYouBook = [] }) => !includedServices.length && !beforeYouBook.length ? null : (
  <section className="w-full border-b border-slate-200 py-6">
    <SectionHeading
      eyebrow="Know Before You Go"
      title="What's Included"
    />

    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      {includedServices.length ? <div className="rounded-xl border border-theme bg-theme-surface p-4 shadow-[0_4px_14px_rgba(var(--c-brand-rgb),0.03)]">
        <h3 className="text-xs font-semibold text-theme">
          Included
        </h3>

        <ul className="mt-3 space-y-2.5">
          {includedServices.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2.5 text-sm leading-6 text-theme"
            >
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgba(var(--c-brand-rgb),0.12)] text-[var(--c-brand)]">
                <Check size={12} />
              </span>

              <span>{formatListLabel(item)}</span>
            </li>
          ))}
        </ul>
      </div> : null}

      {beforeYouBook.length ? <div className="rounded-xl border border-theme bg-theme-surface p-4 shadow-[0_4px_14px_rgba(var(--c-brand-rgb),0.03)]">
        <h3 className="text-xs font-semibold text-theme">
          Before You Book
        </h3>

        <ul className="mt-3 space-y-2.5">
          {beforeYouBook.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2.5 text-sm leading-6 text-theme"
            >
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-theme-bg text-muted">
                <Info size={12} />
              </span>

              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div> : null}
    </div>
  </section>
);

export const ItinerarySection = ({ items = [], openIndex, onToggle }) => {
  const itineraryId = useId();
  return (
    <section className="w-full border-b border-slate-200 py-6">
      <div className="flex items-center justify-between gap-3">
        <SectionHeading title="Itinerary" />
        {items.length > 0 && <span className="text-[11px] text-muted">{items.length} {items.length === 1 ? "day" : "days"}</span>}
      </div>
      {items.length ? (
        <ol className="tour-itinerary mt-5">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            const dayLabel = item.day || index + 1;
            const panelId = `${itineraryId}-day-${index}`;
            const headingId = `${panelId}-heading`;
            return (
              <li key={`${dayLabel}-${index}`} className={`tour-itinerary-step ${isOpen ? "is-open" : ""}`}>
                <span className="tour-itinerary-marker" aria-hidden="true">{dayLabel}</span>
                <div className="tour-itinerary-day">
                  <button id={headingId} type="button" onClick={() => onToggle(index)} aria-expanded={isOpen} aria-controls={panelId} className="tour-itinerary-toggle">
                    <span className="min-w-0">
                      <span className="block text-[10px] font-medium text-[var(--c-brand)]">Day {dayLabel}</span>
                      <span className="mt-1 block text-[13px] font-semibold leading-5 text-theme">{item.title || `Day ${dayLabel}`}</span>
                      {item.placesCovered?.length > 0 && <span className="mt-1 block text-[11px] leading-5 text-muted">{item.placesCovered.join(" / ")}</span>}
                    </span>
                    <ChevronDown size={15} className={`shrink-0 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <div id={panelId} role="region" aria-labelledby={headingId} hidden={!isOpen} className="tour-itinerary-panel">
                    <ul className="space-y-2">
                      {item.bulletPoints?.map((point, pointIndex) => (
                        <li key={`${pointIndex}-${point}`} className="flex items-start gap-2 text-[12px] leading-6 text-muted">
                          <Check size={13} className="mt-1.5 shrink-0 text-[var(--c-brand)]" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      ) : <p className="mt-4 text-xs leading-6 text-muted">Detailed itinerary is shared after booking confirmation.</p>}
    </section>
  );
};

export const RouteSection = ({ placesCovered = [] }) => !placesCovered.length ? null : (
  <section className="w-full border-b border-slate-200 py-6">
    <SectionHeading
      eyebrow="Route"
      title="Places Covered"
    />

    <div className="mt-3 rounded-xl border border-theme bg-theme-surface p-4 shadow-[0_4px_14px_rgba(var(--c-brand-rgb),0.03)]">
      <div className="flex flex-wrap gap-2">
        {placesCovered.map((item) => (
          <span
            key={item}
            className="rounded-full border border-[rgba(15,23,42,0.1)] bg-theme-bg px-2.5 py-1 text-[11px] font-medium text-theme"
          >
            {formatListLabel(item)}
          </span>
        ))}
      </div>
    </div>
  </section>
);

export const FaqSection = ({ items = [], openIndex, onToggle }) => !items.length ? null : (
  <section className="w-full py-6">
    <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
      <SectionHeading
        eyebrow="Support"
        title="Frequently Asked Questions"
      />

      <div className="space-y-2">
        {items.map((faq, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div
              key={faq.q}
              className={`overflow-hidden rounded-xl border bg-theme-surface transition-colors ${isOpen ? "border-[rgba(var(--c-brand-rgb),0.38)]" : "border-theme hover:border-[rgba(var(--c-brand-rgb),0.24)]"}`}
            >
              <button
                type="button"
                onClick={() => onToggle(idx)}
                aria-expanded={isOpen}
                className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <span className="text-[13px] font-medium text-theme">
                  {faq.q}
                </span>

                <ChevronDown
                  size={16}
                  className={`shrink-0 text-muted transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="border-t border-theme px-4 py-3">
                  <p className="text-sm leading-6 text-muted">{faq.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export const BookingNoteList = ({ items = [] }) => (
  <div className="space-y-3">
    {items.map((item) => (
      <div
        key={item}
        className="flex items-start gap-3 text-[14px] leading-6 text-muted"
      >
        <CircleDot size={16} className="mt-1 shrink-0 text-[var(--c-brand)]" />
        <span>{item}</span>
      </div>
    ))}
  </div>
);
