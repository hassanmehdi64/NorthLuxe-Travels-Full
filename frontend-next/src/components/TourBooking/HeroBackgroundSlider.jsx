import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useSettings } from "../../hooks/useCms";
import { getHeroColors, getHomeHeroImages } from "../../lib/siteTheme";

const SLIDE_INTERVAL = 5000;

const HeroBackgroundSlider = () => {
  const { data: settings } = useSettings(true);
  const colors = getHeroColors(settings);

  const slides = getHomeHeroImages(settings).map((src, index) => ({
    src,
    alt: `Hero slide ${index + 1}`,
    position: "center center",
  }));

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!slides.length) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, SLIDE_INTERVAL);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    if (activeIndex >= slides.length) {
      setActiveIndex(0);
    }
  }, [slides.length, activeIndex]);

  const changeSlide = (direction) => {
    if (slides.length < 2) return;
    setActiveIndex((current) =>
      (current + direction + slides.length) % slides.length,
    );
  };

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden bg-[var(--c-navy)] bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/gb.jpg")' }}>
      {slides.map((slide, index) => (
        <div
          key={`${slide.src}-${index}`}
          className={`absolute inset-0 will-change-opacity transition-opacity duration-1000 ease-in-out ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.src}
            alt={slide.alt}
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
            decoding={index === 0 ? "sync" : "async"}
            onError={(event) => {
              if (event.currentTarget.dataset.fallbackApplied) return;
              event.currentTarget.dataset.fallbackApplied = "true";
              event.currentTarget.src = "/gb.jpg";
            }}
            className={`absolute inset-0 h-full w-full object-cover ${
              index === activeIndex
                ? "animate-[hero-pan_14s_ease-in-out_infinite]"
                : "scale-[1.05]"
            }`}
            style={{ objectPosition: slide.position }}
          />
        </div>
      ))}

      <div className="absolute inset-0 z-[5] bg-[radial-gradient(circle_at_top_right,rgba(36,179,126,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent_32%)]" />

      <div
        className="absolute inset-0 z-10"
        style={{
          background: `linear-gradient(180deg, ${colors.homeStart}16 0%, ${colors.homeStart}20 40%, ${colors.homeEnd}52 100%)`,
        }}
      />

      <div className="absolute inset-0 z-[11] bg-[linear-gradient(90deg,rgba(6,27,58,0.05)_0%,rgba(6,27,58,0.02)_55%,rgba(6,27,58,0.24)_100%)]" />

      <div className="absolute inset-x-0 bottom-0 z-[12] h-32 bg-[linear-gradient(180deg,transparent_0%,rgba(6,27,58,0.22)_45%,rgba(6,27,58,0.52)_100%)]" />

      {slides.length > 1 ? (
        <div className="absolute inset-x-0 bottom-7 z-[13] hidden px-8 sm:block lg:px-[5.5vw]">
          <div className="flex items-center gap-4 text-white">
            <button
              type="button"
              onClick={() => changeSlide(-1)}
              aria-label="Previous hero image"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/70 bg-[#061b3a]/20 backdrop-blur-sm transition hover:bg-white hover:text-[#061b3a]"
            >
              <ArrowLeft size={17} />
            </button>
            <span className="text-xs font-semibold tracking-wider">
              {String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-1.5">
              {slides.map((slide, index) => (
                <span
                  key={`${slide.src}-dot-${index}`}
                  className={`block h-0.5 transition-all duration-500 ${index === activeIndex ? "w-10 bg-[var(--c-brand)]" : "w-5 bg-white/55"}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => changeSlide(1)}
              aria-label="Next hero image"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/70 bg-[#061b3a]/20 backdrop-blur-sm transition hover:bg-white hover:text-[#061b3a]"
            >
              <ArrowRight size={17} />
            </button>
            <span className="ml-2 hidden text-[10px] font-bold uppercase tracking-[0.2em] md:inline">
              Pakistan &nbsp; | &nbsp; Curated escape
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default HeroBackgroundSlider;
