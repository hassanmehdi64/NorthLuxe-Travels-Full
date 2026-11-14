"use client";

import { Tooltip as RadixTooltip } from "radix-ui";

/** Wrap the admin once (AdminLayout) so tooltips share a delay. */
export const TooltipProvider = ({ children }) => (
  <RadixTooltip.Provider delayDuration={250} skipDelayDuration={150}>
    {children}
  </RadixTooltip.Provider>
);

/** Shows on hover AND keyboard focus. `children` must be a focusable element. */
export const Tooltip = ({ content, side = "top", children }) => {
  if (!content) return children;
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          sideOffset={6}
          className="z-[100] max-w-xs rounded-md bg-navy-950 px-2.5 py-1.5 text-xs font-medium leading-snug text-white shadow-raised"
        >
          {content}
          <RadixTooltip.Arrow className="fill-navy-950" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
};
