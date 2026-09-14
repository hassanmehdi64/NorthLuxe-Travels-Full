const STEP_ITEMS = [
  { id: 1, label: "Guest Details", short: "Guests" },
  { id: 2, label: "Dates & Stay", short: "Travel" },
  { id: 3, label: "Payment", short: "Payment" },
];

const BookingStepTabs = ({
  activeSection,
  isTravelerSectionValid,
  isTravelSectionValid,
  onStepChange,
}) => (
  <nav aria-label="Booking progress" className="rounded-xl border border-booking bg-[#fbfcfc] px-2 py-2 sm:px-3">
    <div className="grid grid-cols-3">
      {STEP_ITEMS.map((item) => {
        const canOpen =
          item.id === 1 ||
          (item.id === 2 && isTravelerSectionValid) ||
          (item.id === 3 && isTravelerSectionValid && isTravelSectionValid);
        return (
          <button
            key={item.id}
            type="button"
            disabled={!canOpen}
            onClick={() => canOpen && onStepChange(item.id)}
            className={`group relative flex min-w-0 items-center justify-center gap-2 rounded-lg px-1.5 py-2 text-center transition sm:px-3 ${
              activeSection === item.id
                ? "bg-white text-theme shadow-[0_1px_5px_rgba(15,47,87,0.08)]"
                : canOpen
                  ? "cursor-pointer text-muted hover:bg-white/70 hover:text-theme"
                  : "cursor-not-allowed text-muted opacity-40"
            }`}
          >
            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${activeSection === item.id ? "bg-[var(--c-brand)] text-white" : "border border-slate-300 bg-white text-muted"}`}>
              {item.id}
            </span>
            <span className="truncate text-[10px] font-semibold sm:text-[12px]">
              <span className="sm:hidden">{item.short}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  </nav>
);

export default BookingStepTabs;
