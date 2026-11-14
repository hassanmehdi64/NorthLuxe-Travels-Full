"use client";

import { useEffect, useRef, useState } from "react";
import { Mountain } from "lucide-react";

/**
 * <img> that swaps to a branded placeholder when the source is missing or fails.
 * We deliberately do NOT fall back to another real photo: showing a different
 * place's picture under a destination's name is misleading.
 */
export default function SafeImage({ src, alt = "", label, className = "", onError, ...rest }) {
  const imgRef = useRef(null);
  const [failedSrc, setFailedSrc] = useState(null);
  const failed = !src || failedSrc === src;

  // Errors that happen before hydration never reach React's onError.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0 && src) setFailedSrc(src);
  }, [src]);

  if (failed) {
    return (
      <span role="img" aria-label={alt || label || "Photo coming soon"} className={`image-fallback ${className}`}>
        <Mountain aria-hidden="true" size={28} strokeWidth={1.4} />
        {label ? <span className="image-fallback-label">{label}</span> : null}
      </span>
    );
  }

  return (
    // CMS images come from admin-configured external hosts, so next/image isn't used here.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className={className}
      onError={(event) => {
        setFailedSrc(src);
        onError?.(event);
      }}
      {...rest}
    />
  );
}
