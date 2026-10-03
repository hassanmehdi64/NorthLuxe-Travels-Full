import { CreditCard, Landmark, ShieldCheck } from "lucide-react";

const methodIcon = (mode) => {
  if (mode === "card") return CreditCard;
  if (mode === "manual") return Landmark;
  return ShieldCheck;
};

const BookingPreferencesSection = ({
  bookingType,
  form,
  setForm,
  paymentMethods,
  selectedPaymentMethod,
  selectedReceivingAccount,
  isTravelerSectionValid,
  isTravelSectionValid,
  isPreferencesSectionValid,
  onBack,
  onContinue,
}) => {
  const isCardPayment = selectedPaymentMethod?.mode === "card";
  const isArrivalPayment = selectedPaymentMethod?.mode === "arrival";
  const isManualPayment = selectedPaymentMethod?.mode === "manual";
  const referenceLabel = selectedPaymentMethod?.referenceLabel || "Payment reference";

  const selectMethod = (nextValue) => {
    setForm((previousForm) => ({
      ...previousForm,
      paymentMethod: nextValue,
      transactionReference: nextValue === previousForm.paymentMethod ? previousForm.transactionReference : "",
      manualSenderName: nextValue === previousForm.paymentMethod ? previousForm.manualSenderName : "",
      manualSenderNumber: nextValue === previousForm.paymentMethod ? previousForm.manualSenderNumber : "",
      manualSentAmount: nextValue === previousForm.paymentMethod ? previousForm.manualSentAmount : "",
      manualSentAt: nextValue === previousForm.paymentMethod ? previousForm.manualSentAt : "",
      manualPaymentSlip: nextValue === previousForm.paymentMethod ? previousForm.manualPaymentSlip : "",
      manualPaymentSlipName: nextValue === previousForm.paymentMethod ? previousForm.manualPaymentSlipName : "",
    }));
  };

  return (
    <div className="space-y-4 py-1 sm:space-y-5">
      <div>
        <p className="text-base font-semibold tracking-tight text-theme">Choose payment</p>
        <p className="mt-1 text-xs text-muted">Select how you want to complete this booking.</p>
      </div>

      <div>
        <p className="ql-label">Payment method</p>
        <div className="grid gap-1.5 rounded-xl bg-[#f1f4f5] p-1.5 sm:grid-cols-3" role="radiogroup" aria-label="Payment method">
          {paymentMethods.map((method) => {
            const active = method.key === form.paymentMethod;
            const MethodIcon = methodIcon(method.mode);
            return (
              <button
                key={method.key}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => selectMethod(method.key)}
                className={`flex min-h-[48px] items-center justify-center gap-2 rounded-lg px-3 py-2 text-center transition ${
                  active
                    ? "bg-white text-theme "
                    : "text-muted hover:bg-white/60 hover:text-theme"
                }`}
              >
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${active ? "bg-[#e7f7ef] text-[var(--c-brand-dark)]" : "text-muted"}`}>
                  <MethodIcon size={13} strokeWidth={1.8} />
                </span>
                <span className="min-w-0 truncate text-[12px] font-semibold">{method.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedPaymentMethod?.supportsPlan ? (
        <div>
          <p className="ql-label">Pay now</p>
          <div className="inline-grid w-full gap-1 rounded-lg bg-[#f3f5f6] p-1 sm:w-auto sm:grid-cols-2" role="radiogroup" aria-label="Payment amount">
            {[
              { value: "advance_10", label: "10% advance" },
              { value: "full", label: "Full amount" },
            ].map((plan) => (
              <button
                key={plan.value}
                type="button"
                role="radio"
                aria-checked={form.paymentPlan === plan.value}
                onClick={() => setForm((p) => ({ ...p, paymentPlan: plan.value }))}
                className={`min-h-[38px] rounded-md px-4 py-2 text-[12px] font-semibold transition ${
                  form.paymentPlan === plan.value
                    ? "bg-white text-theme "
                    : "text-muted hover:text-theme"
                }`}
              >
                {plan.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {isManualPayment ? (
        <div className="space-y-4 border-t border-booking pt-4">
          {selectedReceivingAccount ? (
            <div className="flex flex-col gap-2 rounded-lg bg-[#f3f8f5] px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] text-muted">Send payment to</p>
                <p className="mt-0.5 text-[13px] font-semibold text-theme">
                  {selectedReceivingAccount.bankName || selectedReceivingAccount.label || "Receiving account"}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="break-all text-sm font-bold text-theme">{selectedReceivingAccount.accountNumber || "Account number missing"}</p>
                {selectedReceivingAccount.accountTitle ? <p className="mt-0.5 text-[11px] text-muted">{selectedReceivingAccount.accountTitle}</p> : null}
              </div>
            </div>
          ) : (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-[12px] text-amber-700">
              No receiving account is configured for this method.
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className="ql-label">Sender name</span>
              <input className="ql-input" placeholder="Name used for payment" value={form.manualSenderName} onChange={(event) => setForm((p) => ({ ...p, manualSenderName: event.target.value }))} />
            </label>
            <label>
              <span className="ql-label">Amount sent</span>
              <input type="number" min="0" step="0.01" className="ql-input" placeholder="Enter amount" value={form.manualSentAmount} onChange={(event) => setForm((p) => ({ ...p, manualSentAmount: event.target.value }))} />
            </label>
            <label className="sm:col-span-2">
              <span className="ql-label">{referenceLabel}</span>
              <input className="ql-input" placeholder={`Enter ${referenceLabel.toLowerCase()}`} value={form.transactionReference} onChange={(event) => setForm((p) => ({ ...p, transactionReference: event.target.value }))} />
            </label>
          </div>

          {selectedPaymentMethod?.instructions ? <p className="text-[11px] leading-5 text-muted">{selectedPaymentMethod.instructions}</p> : null}
        </div>
      ) : null}

      {isCardPayment || isArrivalPayment ? (
        <div className="flex items-start gap-2.5 border-t border-booking pt-4 text-[12px] leading-5 text-muted">
          <ShieldCheck size={15} className="mt-0.5 shrink-0 text-[var(--c-brand-dark)]" />
          <span>{isCardPayment ? "You’ll enter card details securely after reviewing your booking." : "No payment details are needed now. Pay when you arrive."}</span>
        </div>
      ) : null}

      {bookingType === "custom" ? (
        <label>
          <span className="ql-label">Additional request</span>
          <textarea className="ql-textarea" rows={3} placeholder="Anything else we should know?" value={form.customRequirements} onChange={(event) => setForm((p) => ({ ...p, customRequirements: event.target.value }))} />
        </label>
      ) : null}

      <div className="flex flex-col-reverse gap-2.5 border-t border-booking pt-4 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" className="ql-btn-secondary w-full sm:w-auto" onClick={onBack}>Back</button>
        <button type="button" className="ql-btn-primary w-full sm:w-auto" disabled={!isTravelerSectionValid || !isTravelSectionValid || !isPreferencesSectionValid} onClick={onContinue}>Review booking</button>
      </div>
    </div>
  );
};

export default BookingPreferencesSection;
