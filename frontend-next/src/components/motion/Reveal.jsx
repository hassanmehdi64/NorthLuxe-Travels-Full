"use client";

import { useEffect, useRef } from "react";

/**
 * Subtle fade-up when a block first scrolls into view (once). Use it on section
 * headings and card rows, not on every element.
 * - Server HTML is fully visible: nothing is hidden if JS is slow or off.
 * - Blocks already on screen at load are left alone (no flash).
 * - Only opacity/transform animate; reduced-motion users get no animation.
 */
export default function Reveal({ as: Tag = "div", delay = 0, className = "", children, ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return undefined; // already visible

    node.dataset.reveal = "hidden";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        node.dataset.reveal = "shown";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={className} style={delay ? { "--reveal-delay": `${delay}ms` } : undefined} {...rest}>
      {children}
    </Tag>
  );
}
