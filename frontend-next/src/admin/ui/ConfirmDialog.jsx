"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AlertDialog } from "radix-ui";
import { Button } from "./Button";

const ConfirmContext = createContext(null);

/**
 * Promise-based confirmation for destructive actions:
 *   const confirm = useConfirm();
 *   if (await confirm({ title: "Delete tour?", confirmLabel: "Delete tour", cancelLabel: "Keep tour" })) …
 * Focus starts on the SAFE button; Escape cancels.
 */
export const ConfirmProvider = ({ children }) => {
  const [state, setState] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback((options) => new Promise((resolve) => {
    resolver.current = resolve;
    setState({ tone: "danger", cancelLabel: "Cancel", confirmLabel: "Confirm", ...options });
  }), []);

  const close = (result) => {
    resolver.current?.(result);
    resolver.current = null;
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog.Root open={Boolean(state)} onOpenChange={(open) => { if (!open) close(false); }}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-[70] bg-navy-950/40" />
          <AlertDialog.Content className="admin-shell fixed left-1/2 top-1/2 z-[71] w-[calc(100vw-24px)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-panel bg-surface p-5 shadow-pop outline-none">
            <AlertDialog.Title className="text-base font-semibold text-navy-900">{state?.title}</AlertDialog.Title>
            <AlertDialog.Description className="mt-1.5 text-sm leading-relaxed text-subtle">
              {state?.description || "This action cannot be undone."}
            </AlertDialog.Description>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <Button variant="secondary" autoFocus>{state?.cancelLabel}</Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button variant={state?.tone === "danger" ? "danger-solid" : "primary"} onClick={() => close(true)}>
                  {state?.confirmLabel}
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error("useConfirm must be used inside <ConfirmProvider>");
  return confirm;
};
