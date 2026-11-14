"use client";

import { DropdownMenu } from "radix-ui";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { IconButton } from "./IconButton";

/**
 * Overflow menu with labelled items (used on touch screens and for secondary actions).
 * items: [{ label, icon, onClick?, to?, danger?, disabled? }]
 */
export const ActionMenu = ({ items, label = "More actions", align = "end", trigger }) => {
  const router = useRouter();
  const visible = items.filter(Boolean).filter((item) => !item.hidden);
  if (!visible.length) return null;
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        {trigger || <IconButton label={label} icon={MoreHorizontal} tooltip={false} />}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          sideOffset={6}
          className="admin-shell z-[80] min-w-44 rounded-card border border-line bg-surface p-1 shadow-pop"
        >
          {visible.map(({ label: itemLabel, icon: Icon, onClick, to, danger, disabled }) => (
            <DropdownMenu.Item
              key={itemLabel}
              disabled={disabled}
              onSelect={() => (to ? router.push(to) : onClick?.())}
              className={cn(
                "flex cursor-pointer select-none items-center gap-2.5 rounded-md px-2.5 py-2 text-sm outline-none",
                "data-[highlighted]:bg-canvas data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
                danger ? "text-red-700 dark:text-red-400" : "text-navy-900",
              )}
            >
              {Icon && <Icon size={15} aria-hidden="true" />}
              {itemLabel}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

/**
 * Row actions: icon buttons with tooltips on md+ screens, a labelled menu on phones.
 * actions: [{ label, icon, onClick?, to?, danger?, hidden?, disabled? }]
 */
export const RowActions = ({ actions, className }) => {
  const visible = actions.filter(Boolean).filter((action) => !action.hidden);
  if (!visible.length) return null;
  return (
    <div className={cn("flex items-center justify-end", className)}>
      <div className="hidden items-center gap-0.5 md:flex">
        {visible.map(({ label, icon, onClick, to, danger, disabled }) => (
          <IconButton key={label} label={label} icon={icon} onClick={onClick} to={to} disabled={disabled} variant={danger ? "danger" : "ghost"} size="sm" iconSize={16} />
        ))}
      </div>
      <div className="md:hidden">
        <ActionMenu items={visible} />
      </div>
    </div>
  );
};
