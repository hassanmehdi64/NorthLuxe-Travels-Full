"use client";

import { Children, useCallback, useEffect, useId, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

/**
 * Shared card carousel (tours, destinations, testimonials, related items).
 * - Swipe with snapping on touch; arrow buttons on desktop (hidden when everything fits).
 * - Keyboard: ←/→ when the carousel has focus; focusing a card scrolls it into view.
 * - Server-rendered as a plain flex row, so there is no layout shift when Embla starts.
 *
 * `slideClassName` sets how many cards show, e.g. "basis-[85%] sm:basis-1/2 lg:basis-1/3".
 */
export default function Carousel({ label, children, slideClassName = "basis-[85%] sm:basis-1/2 lg:basis-1/3", dots = false, className = "" }) {
  const reducedMotion = usePrefersReducedMotion();
  const [viewportRef, embla] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    slidesToScroll: "auto",
    duration: reducedMotion ? 1 : 28,
  });
  const [state, setState] = useState({ prev: false, next: false, selected: 0, snaps: [] });
  const id = useId();
  const slides = Children.toArray(children).filter(Boolean);

  const sync = useCallback((api) => {
    setState({ prev: api.canScrollPrev(), next: api.canScrollNext(), selected: api.selectedScrollSnap(), snaps: api.scrollSnapList() });
  }, []);

  useEffect(() => {
    if (!embla) return undefined;
    sync(embla);
    embla.on("select", sync).on("reInit", sync);
    return () => { embla.off("select", sync).off("reInit", sync); };
  }, [embla, sync]);

  const scrollable = state.prev || state.next;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      className={`relative ${className}`}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") { event.preventDefault(); embla?.scrollPrev(); }
        if (event.key === "ArrowRight") { event.preventDefault(); embla?.scrollNext(); }
      }}
    >
      <div ref={viewportRef} className="carousel-viewport">
        <div className="carousel-track" id={id}>
          {slides.map((child, index) => (
            <div key={child.key ?? index} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${slides.length}`} className={`carousel-slide ${slideClassName}`}>
              {child}
            </div>
          ))}
        </div>
      </div>

      {scrollable && (
        <div className="carousel-arrows">
          <button type="button" className="carousel-arrow" aria-controls={id} aria-label="Previous" disabled={!state.prev} onClick={() => embla?.scrollPrev()}>
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button type="button" className="carousel-arrow" aria-controls={id} aria-label="Next" disabled={!state.next} onClick={() => embla?.scrollNext()}>
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      )}

      {dots && state.snaps.length > 1 && (
        <div className="carousel-dots">
          {state.snaps.map((_, index) => (
            <button
              key={index}
              type="button"
              className="carousel-dot"
              aria-label={`Go to page ${index + 1} of ${state.snaps.length}`}
              aria-current={index === state.selected ? "true" : undefined}
              onClick={() => embla?.scrollTo(index)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
