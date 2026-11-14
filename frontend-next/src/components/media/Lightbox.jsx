"use client";

import dynamic from "next/dynamic";

// Loaded only when a photo is first opened (client-only), so it costs nothing on page load.
const LightboxImpl = dynamic(() => import("./LightboxImpl"), { ssr: false });

/**
 * The one photo viewer for the site: zoom (pinch, double-tap, wheel), swipe, keyboard
 * (←/→/Esc), focus trap and screen-reader labels.
 * slides: [{ src, alt, title?, description? }]. Render it with index !== null to open.
 */
export default function Lightbox({ slides = [], index = null, onClose, onIndexChange }) {
  if (index === null || index === undefined || !slides.length) return null;
  return <LightboxImpl slides={slides} index={index} onClose={onClose} onIndexChange={onIndexChange} />;
}
