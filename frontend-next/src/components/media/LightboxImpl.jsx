"use client";

import YARL from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";
import "yet-another-react-lightbox/plugins/captions.css";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

/** The real lightbox. Loaded on demand by ./Lightbox — never import this directly. */
export default function LightboxImpl({ slides, index, onClose, onIndexChange }) {
  const reducedMotion = usePrefersReducedMotion();
  const hasCaptions = slides.some((slide) => slide.title || slide.description);
  return (
    <YARL
      open
      close={onClose}
      index={index}
      slides={slides}
      on={{ view: ({ index: next }) => onIndexChange?.(next) }}
      plugins={[Zoom, Counter, ...(hasCaptions ? [Captions] : [])]}
      carousel={{ finite: slides.length < 3, preload: 1 }}
      controller={{ closeOnBackdropClick: true, closeOnPullDown: true }}
      animation={reducedMotion ? { fade: 0, swipe: 0, zoom: 0 } : { fade: 250, swipe: 380 }}
      zoom={{ maxZoomPixelRatio: 2.5, scrollToZoom: true }}
      captions={{ showToggle: false, descriptionTextAlign: "center" }}
      render={slides.length < 2 ? { buttonPrev: () => null, buttonNext: () => null } : undefined}
      labels={{ Previous: "Previous photo", Next: "Next photo", Close: "Close photos", "Zoom in": "Zoom in", "Zoom out": "Zoom out", Lightbox: "Photo viewer", Carousel: "Photos" }}
      className="brand-lightbox"
    />
  );
}
