"use client";

import { Dialog as RadixDialog } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "./IconButton";

const SHEET_WIDTHS = { md: "sm:max-w-md", lg: "sm:max-w-xl", xl: "sm:max-w-3xl" };
const MODAL_WIDTHS = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

const Frame = ({ title, description, footer, children, onClose }) => (
  <>
    <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
      <div className="min-w-0">
        <RadixDialog.Title className="text-base font-semibold text-navy-900">{title}</RadixDialog.Title>
        {description ? (
          <RadixDialog.Description className="mt-0.5 text-[13px] text-subtle">{description}</RadixDialog.Description>
        ) : (
          <RadixDialog.Description className="sr-only">{title}</RadixDialog.Description>
        )}
      </div>
      <RadixDialog.Close asChild>
        <IconButton label="Close" icon={X} size="sm" tooltip={false} onClick={onClose} />
      </RadixDialog.Close>
    </header>
    <div className="admin-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
    {footer && <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-canvas/60 px-5 py-3">{footer}</footer>}
  </>
);

/**
 * Side drawer for create/edit forms. Focus is trapped, Escape and the backdrop close it.
 * Wrap the body in a <form> and point the footer's submit button at it with `form="id"`.
 */
export const Drawer = ({ open, onOpenChange, title, description, footer, children, size = "lg" }) => (
  <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-[60] bg-navy-950/40 backdrop-blur-[1px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
      <RadixDialog.Content
        className={cn(
          "admin-shell fixed inset-y-0 right-0 z-[61] flex w-full flex-col bg-surface shadow-pop outline-none",
          "data-[state=open]:animate-in data-[state=open]:slide-in-from-right-8 data-[state=open]:duration-200",
          SHEET_WIDTHS[size],
        )}
      >
        <Frame title={title} description={description} footer={footer}>{children}</Frame>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  </RadixDialog.Root>
);

/** Centered modal for short forms and confirmations. */
export const Modal = ({ open, onOpenChange, title, description, footer, children, size = "md" }) => (
  <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-[60] bg-navy-950/40 backdrop-blur-[1px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
      <RadixDialog.Content
        className={cn(
          "admin-shell fixed left-1/2 top-1/2 z-[61] flex max-h-[min(88dvh,760px)] w-[calc(100vw-24px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-panel bg-surface shadow-pop outline-none",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          MODAL_WIDTHS[size],
        )}
      >
        <Frame title={title} description={description} footer={footer}>{children}</Frame>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  </RadixDialog.Root>
);
