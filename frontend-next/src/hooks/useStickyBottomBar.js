import { useEffect } from "react";

/** Marks <body> while a sticky bottom bar is shown so floating buttons move above it. */
export const useStickyBottomBar = (active = true) => {
  useEffect(() => {
    if (!active) return undefined;
    document.body.dataset.stickyBar = "true";
    return () => {
      delete document.body.dataset.stickyBar;
    };
  }, [active]);
};
