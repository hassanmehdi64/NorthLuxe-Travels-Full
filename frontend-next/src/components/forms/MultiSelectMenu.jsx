"use client";

import { DropdownMenu } from "radix-ui";
import { Check, ChevronDown } from "lucide-react";

/**
 * Multi-choice version of SelectMenu (same trigger and menu look).
 * Radix DropdownMenu checkbox items: arrow keys, Space/Enter to toggle, Esc to close.
 * The menu stays open while choosing several options.
 */
export default function MultiSelectMenu({ values = [], onToggle, options = [], placeholder = "Select", size = "md", className = "", ...triggerProps }) {
  const chosen = options.filter((option) => values.includes(option.value));
  const summary = chosen.length === 0 ? "" : chosen.length <= 2 ? chosen.map((o) => o.label).join(", ") : `${chosen.length} selected`;

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger
        className={`select-trigger ${size === "sm" ? "select-trigger-sm" : ""} ${className}`}
        {...(summary ? {} : { "data-placeholder": "" })}
        {...triggerProps}
      >
        <span className="select-trigger-value">{summary || placeholder}</span>
        <span className="select-trigger-chevron"><ChevronDown size={16} aria-hidden="true" /></span>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="brand-search-menu overflow-y-auto"
          style={{ width: "var(--radix-dropdown-menu-trigger-width)", maxHeight: "min(300px, var(--radix-dropdown-menu-content-available-height))" }}
          sideOffset={6}
          collisionPadding={12}
          align="start"
        >
          {options.map((option) => (
            <DropdownMenu.CheckboxItem
              key={option.value}
              className="brand-search-option"
              checked={values.includes(option.value)}
              onCheckedChange={() => onToggle?.(option.value)}
              onSelect={(event) => event.preventDefault()}
            >
              <span>{option.label}</span>
              <DropdownMenu.ItemIndicator><Check size={14} /></DropdownMenu.ItemIndicator>
            </DropdownMenu.CheckboxItem>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
