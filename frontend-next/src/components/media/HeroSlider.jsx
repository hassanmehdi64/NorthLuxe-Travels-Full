"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Fade from "embla-carousel-fade";
import Autoplay from "embla-carousel-autoplay";
import { Pause, Play } from "lucide-react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

const DELAY = 6500;

/**
 * Full-bleed background slider for page heroes. Fades between photos, auto-plays and
 * pauses while the hero is hovered or focused, swipes on phones, and has a pause button plus dots that
 * double as a progress bar. Reduced motion: no auto-play, instant changes.
 * Photos that fail to load are dropped. Sits behind the hero content (absolute inset-0).
 */
export default function HeroSlider({ images = [], alt = "", label = "Featured photos" }) {
  const reducedMotion = usePrefersReducedMotion();
  const [failed, setFailed] = useState(() => new Set());
  const photos = [...new Set(images.filter(Boolean))].filter((src) => !failed.has(src));
  const multiple = photos.length > 1;

  const [viewportRef, embla] = useEmblaCarousel(
    { loop: true, duration: reducedMotion ? 1 : 32, watchDrag: multiple },
    multiple ? [Fade(), ...(reducedMotion ? [] : [Autoplay({ delay: DELAY, stopOnInteraction: false, stopOnFocusIn: true })])] : [],
  );
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(!reducedMotion);

  const sync = useCallback((api) => setSelected(api.selectedScrollSnap()), []);

  useEffect(() => {
    if (!embla) return undefined;
    sync(embla);
    setPlaying(Boolean(embla.plugins()?.autoplay?.isPlaying()));
    // The plugin emits these before updating isPlaying(), so trust the event, not the getter.
    const onPlay = () => setPlaying(true);
    const onStop = () => setPlaying(false);
    embla.on("select", sync).on("reInit", sync).on("autoplay:play", onPlay).on("autoplay:stop", onStop);
    return () => { embla.off("select", sync).off("reInit", sync).off("autoplay:play", onPlay).off("autoplay:stop", onStop); };
  }, [embla, sync, multiple, reducedMotion]);

  // The hero text sits above the slider, so hover is watched on the whole hero section
  // (the nearest <section>), not just the photo layer.
  const rootRef = useRef(null);
  const userPaused = useRef(false);
  const [paused, setPaused] = useState(false); // the visitor's choice via the button
  useEffect(() => {
    const autoplay = embla?.plugins()?.autoplay;
    const hero = rootRef.current?.closest("section");
    if (!autoplay || !hero) return undefined;
    const pause = () => autoplay.stop();
    const resume = () => { if (!userPaused.current) autoplay.play(); };
    hero.addEventListener("mouseenter", pause);
    hero.addEventListener("mouseleave", resume);
    return () => {
      hero.removeEventListener("mouseenter", pause);
      hero.removeEventListener("mouseleave", resume);
    };
    // Re-run when the photo count changes: auto-play only exists once there are 2+ photos
    // (settings load after the first render, but the Embla instance stays the same).
  }, [embla, multiple, reducedMotion]);

  const togglePlay = () => {
    const autoplay = embla?.plugins()?.autoplay;
    if (!autoplay) return;
    const next = !userPaused.current;
    userPaused.current = next;
    setPaused(next);
    if (next) autoplay.stop();
    else autoplay.play();
  };

  if (!photos.length) return <div className="absolute inset-0 bg-navy-900" aria-hidden="true" />;

  return (
    <div ref={rootRef} className="hero-slider" aria-roledescription="carousel" aria-label={label}>
      <div ref={viewportRef} className="hero-slider-viewport">
        <div className="hero-slider-track">
          {photos.map((src, index) => (
            <div key={src} className="hero-slider-slide" role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${photos.length}`} aria-hidden={index !== selected}>
              {/* CMS images come from admin-configured hosts, so next/image isn't used. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={index === selected ? alt : ""}
                fetchPriority={index === 0 ? "high" : "low"}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                onError={() => setFailed((prev) => new Set(prev).add(src))}
              />
            </div>
          ))}
        </div>
      </div>

      {multiple && (
        <div className="hero-slider-controls">
          {!reducedMotion && (
            <button type="button" className="hero-slider-toggle" onClick={togglePlay} aria-label={paused ? "Play slideshow" : "Pause slideshow"}>
              {!paused ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
            </button>
          )}
          {photos.map((src, index) => (
            <button
              key={src}
              type="button"
              className="hero-slider-dot"
              aria-label={`Show photo ${index + 1} of ${photos.length}`}
              aria-current={index === selected ? "true" : undefined}
              onClick={() => embla?.scrollTo(index)}
            >
              {/* Progress fill restarts on every slide change (keyed) and pauses with the slideshow. */}
              {index === selected && <span key={`${selected}-${playing}`} className="hero-slider-progress" data-playing={playing} style={{ animationDuration: `${DELAY}ms` }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
