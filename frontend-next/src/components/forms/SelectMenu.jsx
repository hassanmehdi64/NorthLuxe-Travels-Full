"use client";

import { forwardRef } from "react";
import { Select } from "radix-ui";
import { Check, ChevronDown } from "lucide-react";

const EMPTY = "__empty__";
const toRadix = (value) => (value === "" || value === null || value === undefined ? EMPTY : String(value));

/**
 * The one dropdown used across the public site (filters, booking, custom trip,
 * journal). Radix Select: full keyboard support (arrows, typeahead, Esc),
 * screen-reader roles, and a portalled menu that never gets clipped.
 *
 * options: [{ value, label, hint?, disabled? }]  — value "" is allowed (e.g. "All").
 * Works inside <Field>: id / aria-invalid / aria-describedby pass to the trigger.
 */
const SelectMenu = forwardRef(function SelectMenu(
  { value, onChange, options = [], placeholder = "Select", size = "md", icon: Icon, className = "", disabled, name, ...triggerProps },
  ref,
) {
  const current = options.find((option) => toRadix(option.value) === toRadix(value));

  return (
    <Select.Root
      value={current ? toRadix(current.value) : undefined}
      onValueChange={(next) => {
        const option = options.find((item) => toRadix(item.value) === next);
        onChange?.(option ? option.value : next === EMPTY ? "" : next);
      }}
      disabled={disabled}
      name={name}
    >
      <Select.Trigger ref={ref} className={`select-trigger ${size === "sm" ? "select-trigger-sm" : ""} ${className}`} {...triggerProps}>
        {Icon && <Icon size={16} className="select-trigger-icon" aria-hidden="true" />}
        <span className="select-trigger-value">
          <Select.Value placeholder={placeholder}>{current?.label}</Select.Value>
        </span>
        <Select.Icon className="select-trigger-chevron"><ChevronDown size={16} /></Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="brand-search-menu" position="popper" sideOffset={6} collisionPadding={12}>
          <Select.ScrollUpButton className="brand-search-scroll"><ChevronDown size={12} className="rotate-180" /></Select.ScrollUpButton>
          <Select.Viewport>
            {options.map((option) => (
              <Select.Item key={toRadix(option.value)} value={toRadix(option.value)} disabled={option.disabled} className="brand-search-option">
                <span className="min-w-0">
                  <Select.ItemText>{option.label}</Select.ItemText>
                  {option.hint && <span className="select-option-hint">{option.hint}</span>}
                </span>
                <Select.ItemIndicator><Check size={14} /></Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton className="brand-search-scroll"><ChevronDown size={12} /></Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
});

export default SelectMenu;
