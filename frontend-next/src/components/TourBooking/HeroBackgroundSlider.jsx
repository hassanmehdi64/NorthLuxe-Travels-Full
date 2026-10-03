import { useEffect, useMemo, useRef, useState } from "react";
import { useSettings } from "../../hooks/useCms";
import { getHeroColors, getHomeHeroImages } from "../../lib/siteTheme";

const SLIDE_INTERVAL = 7000;

const HeroBackgroundSlider = () => {
  const { data: settings } = useSettings(true);
  const colors = getHeroColors(settings);

  const slides = useMemo(
    () => getHomeHeroImages(settings).map((src, index) => ({
      src,
      alt: `Pakistan landscape ${index + 1}`,
      position: "center center",
    })),
    [settings],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const loadedSlidesRef = useRef(new Set());

  useEffect(() => {
    if (!slides.length) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => {
        const nextIndex = (current + 1) % slides.length;
        return loadedSlidesRef.current.has(nextIndex) ? nextIndex : current;
      });
    }, SLIDE_INTERVAL);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    if (activeIndex >= slides.length) {
      setActiveIndex(0);
    }
  }, [slides.length, activeIndex]);

  useEffect(() => {
    if (slides.length < 2 || typeof window === "undefined") return;
    const nextIndex = (activeIndex + 1) % slides.length;
    const preload = new window.Image();
    preload.onload = () => loadedSlidesRef.current.add(nextIndex);
    preload.src = slides[nextIndex].src;
  }, [activeIndex, slides]);

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden bg-[var(--c-navy)] bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/gb.jpg")' }}>
      {slides.map((slide, index) => (
        <div
          key={`${slide.src}-${index}`}
          className={`absolute inset-0 will-change-opacity transition-opacity duration-[2000ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.src}
            alt={slide.alt}
            loading={index < 2 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
            decoding="async"
            onLoad={() => loadedSlidesRef.current.add(index)}
            onError={(event) => {
              if (event.currentTarget.dataset.fallbackApplied) return;
              event.currentTarget.dataset.fallbackApplied = "true";
              event.currentTarget.src = "/gb.jpg";
            }}
            className={`absolute inset-0 h-full w-full object-cover ${
              index === activeIndex
                ? index % 2 === 0
                  ? "animate-[hero-pan_20s_ease-in-out_infinite]"
                  : "animate-[hero-pan-reverse_20s_ease-in-out_infinite]"
                : "scale-[1.04]"
            }`}
            style={{ objectPosition: slide.position }}
          />
        </div>
      ))}

      <div className="absolute inset-0 z-[5] bg-[radial-gradient(circle_at_top_right,rgba(32,183,122,0.1),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.09),transparent_36%)]" />

      <div
        className="absolute inset-0 z-10"
        style={{
          background: `linear-gradient(180deg, ${colors.homeStart}12 0%, ${colors.homeStart}18 42%, ${colors.homeEnd}48 100%)`,
        }}
      />

      <div className="absolute inset-0 z-[11] bg-[linear-gradient(90deg,rgba(var(--c-brand-rgb),0.12)_0%,rgba(var(--c-brand-rgb),0.025)_58%,rgba(var(--c-brand-rgb),0.18)_100%)]" />

      <div className="absolute inset-x-0 bottom-0 z-[12] h-32 bg-[linear-gradient(180deg,transparent_0%,rgba(var(--c-brand-rgb),0.18)_48%,rgba(var(--c-brand-rgb),0.48)_100%)]" />
    </div>
  );
};

export default HeroBackgroundSlider;
