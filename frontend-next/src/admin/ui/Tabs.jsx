"use client";

import { Switch as RadixSwitch, Tabs as RadixTabs } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * Underline tabs. items: [{ value, label, count?, icon? }]
 * Controlled: pass value + onValueChange. Render panels yourself (or use TabPanel).
 */
export const Tabs = ({ value, onValueChange, items, children, className, listClassName, ariaLabel }) => (
  <RadixTabs.Root value={value} onValueChange={onValueChange} className={className}>
    <RadixTabs.List
      aria-label={ariaLabel}
      className={cn("admin-scroll -mx-1 mb-4 flex gap-1 overflow-x-auto border-b border-line px-1", listClassName)}
    >
      {items.map(({ value: itemValue, label, count, icon: Icon }) => (
        <RadixTabs.Trigger
          key={itemValue}
          value={itemValue}
          className={cn(
            "relative -mb-px inline-flex h-10 shrink-0 items-center gap-2 border-b-2 border-transparent px-3 text-sm font-medium text-subtle transition-colors",
            "hover:text-navy-900 data-[state=active]:border-brand data-[state=active]:text-navy-900",
          )}
        >
          {Icon && <Icon size={15} aria-hidden="true" />}
          {label}
          {count !== undefined && (
            <span className="rounded-full bg-canvas px-1.5 py-0.5 text-xs font-semibold text-subtle">{count}</span>
          )}
        </RadixTabs.Trigger>
      ))}
    </RadixTabs.List>
    {children}
  </RadixTabs.Root>
);

export const TabPanel = ({ value, children, className }) => (
  <RadixTabs.Content value={value} className={cn("outline-none", className)}>{children}</RadixTabs.Content>
);

/** On/off switch with label. */
export const Switch = ({ checked, onCheckedChange, label, description, disabled, id }) => (
  <label htmlFor={id} className="flex cursor-pointer items-start justify-between gap-4">
    <span className="min-w-0">
      <span className="block text-sm font-semibold text-navy-900">{label}</span>
      {description && <span className="mt-0.5 block text-[13px] leading-relaxed text-subtle">{description}</span>}
    </span>
    <RadixSwitch.Root
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className="relative mt-0.5 h-5 w-9 shrink-0 rounded-full bg-line-strong transition-colors data-[state=checked]:bg-brand disabled:opacity-50"
    >
      <RadixSwitch.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[18px]" />
    </RadixSwitch.Root>
  </label>
);
