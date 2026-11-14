"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

// Layout effect in the browser (runs before paint, so nothing flickers); plain effect on the server.
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Subtle fade-up when a block first scrolls into view (once). Use it on section
 * headings and card rows, not on every element.
 * - Server HTML is fully visible: nothing is hidden if JS is slow or off.
 * - Blocks already on screen at load are left alone (no flash); staggered grids still
 *   settle in, hidden before first paint.
 * - Only opacity/transform animate; reduced-motion users get no animation.
 * - `stagger`: the children (e.g. cards in a grid) enter one after another instead.
 */
export default function Reveal({ as: Tag = "div", delay = 0, stagger = false, className = "", children, ...rest }) {
  const ref = useRef(null);

  useIsoLayoutEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    const rect = node.getBoundingClientRect();
    // Blocks already on screen are left alone — except staggered card grids, which only
    // appear once their data has loaded, so they can settle in without a flash.
    if (!stagger && rect.top < window.innerHeight && rect.bottom > 0) return undefined;

    node.dataset.reveal = "hidden";
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        // Wait a frame so the hidden state is painted first; otherwise nothing animates.
        frame = window.requestAnimationFrame(() => {
          frame = window.requestAnimationFrame(() => { node.dataset.reveal = "shown"; });
        });
        // Hand transitions back to the elements (e.g. card hover lift) once the entrance is over.
        window.setTimeout(() => { node.dataset.reveal = "done"; }, 1400);
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [stagger]);

  return (
    <Tag
      ref={ref}
      className={className}
      data-reveal-stagger={stagger ? "" : undefined}
      style={delay ? { "--reveal-delay": `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
