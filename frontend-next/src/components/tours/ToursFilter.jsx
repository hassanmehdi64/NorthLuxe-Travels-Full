import {
  Calendar,
  ChevronDown,
  ListFilter,
  MapPin,
  Mountain,
  RotateCcw,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const FilterDropdown = ({
  value,
  onChange,
  options,
  icon: Icon,
  label,
  placeholder = "Select",
}) => {
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const menuRef = useRef(null);
  const selected = options.find((item) => item.value === value);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const rect = menuRef.current?.getBoundingClientRect();
    if (!rect) return;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropdownNeed = 220;
    setOpenUpward(spaceBelow < dropdownNeed && spaceAbove > spaceBelow);
  }, [open, options.length]);

  return (
    <div ref={menuRef} className="relative min-w-0 flex-1">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex h-16 w-full items-center gap-3 rounded-xl border bg-white px-3 text-left outline-none transition-[border-color,box-shadow,transform] duration-150 active:scale-[0.99] ${
          open
            ? "border-[var(--c-brand)] bg-[rgba(var(--c-brand-rgb),0.025)] shadow-[0_0_0_3px_rgba(var(--c-brand-rgb),0.08)]"
            : "border-slate-200 hover:border-[rgba(var(--c-brand-rgb),0.38)]"
        }`}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[rgba(var(--c-brand-rgb),0.1)] text-[var(--c-brand)]">
          <Icon size={17} strokeWidth={1.9} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[8px] font-bold uppercase tracking-[0.17em] text-slate-500">
            {label}
          </span>
          <span className="mt-1 block truncate text-[13px] font-semibold text-[var(--c-navy)]">
            {selected?.label || placeholder}
          </span>
        </span>
        <ChevronDown
          size={14}
          className={`pointer-events-none shrink-0 text-slate-400 transition-transform duration-150 ${open ? "rotate-180 text-[var(--c-brand)]" : ""}`}
        />
      </button>

      <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: openUpward ? 5 : -5, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: openUpward ? 4 : -4, scale: 0.99 }}
          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className={`absolute left-0 z-[80] min-w-[190px] w-full overflow-hidden rounded-xl border border-[rgba(var(--c-brand-rgb),0.28)] bg-white p-1.5 shadow-[0_14px_30px_rgba(var(--c-brand-rgb),0.12)] ${
            openUpward ? "bottom-full mb-1.5" : "top-full mt-1.5"
          }`}
          role="listbox"
        >
          <div className="max-h-52 space-y-0.5 overflow-y-auto overscroll-contain pr-1 [scrollbar-color:rgba(var(--c-brand-rgb),0.45)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[rgba(var(--c-brand-rgb),0.4)] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1">
            {options.map((item) => {
              const active = value === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  className={`w-full rounded-lg border-l-2 px-2.5 py-2 text-left text-[11px] transition-[background-color,color,border-color,transform] duration-150 active:scale-[0.99] ${
                    active
                      ? "border-[var(--c-brand)] bg-[rgba(var(--c-brand-rgb),0.11)] font-semibold text-[var(--c-brand-dark)]"
                      : "border-transparent text-slate-600 hover:border-[rgba(var(--c-brand-rgb),0.3)] hover:bg-[rgba(var(--c-brand-rgb),0.055)] hover:text-[var(--c-brand-dark)]"
                  }`}
                  role="option"
                  aria-selected={active}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </motion.div>
      ) : null}
      </AnimatePresence>
    </div>
  );
};

const ToursFilter = ({
  filters,
  setFilters,
  destinations,
}) => {
  const set = (patch) => setFilters((prev) => ({ ...prev, ...patch }));
  const hasActiveFilters =
    filters.destination !== "all" ||
    filters.duration !== "all" ||
    filters.experience !== "all" ||
    filters.sortBy !== "popular";

  const clearFilters = () =>
    setFilters({
      destination: "all",
      duration: "all",
      experience: "all",
      sortBy: "popular",
    });

  return (
    <section className="relative z-20 bg-theme-bg py-5 sm:py-6">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        {hasActiveFilters && <div className="mb-2 flex justify-end">
          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[10px] font-semibold text-[var(--c-brand-dark)] transition-colors hover:bg-[rgba(var(--c-brand-rgb),0.07)] disabled:pointer-events-none disabled:opacity-35">
            <RotateCcw size={12} />
            <span>Clear filters</span>
          </button>
        </div>}

        <div className="rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-[0_10px_28px_rgba(var(--c-brand-rgb),0.07)]">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <FilterDropdown
                icon={MapPin}
                label="Location"
                value={filters.destination}
                onChange={(nextValue) => set({ destination: nextValue })}
                options={destinations.map((item) => ({
                  value: item,
                  label: item === "all" ? "All Regions" : item,
                }))}
              />
              <FilterDropdown
                icon={Calendar}
                label="Duration"
                value={filters.duration}
                onChange={(nextValue) => set({ duration: nextValue })}
                options={[
                  { value: "all", label: "Any Days" },
                  { value: "1-3", label: "1-3 Days" },
                  { value: "4-7", label: "4-7 Days" },
                  { value: "8+", label: "8+ Days" },
                ]}
              />
              <FilterDropdown
                icon={Mountain}
                label="Experience"
                value={filters.experience}
                onChange={(nextValue) => set({ experience: nextValue })}
                options={[
                  { value: "all", label: "All Experiences" },
                  { value: "luxury", label: "Luxury & Scenic" },
                  { value: "adventure", label: "Adventure" },
                  { value: "culture", label: "Culture & Heritage" },
                  { value: "family", label: "Family Tours" },
                ]}
              />
              <FilterDropdown
                icon={ListFilter}
                label="Sort by"
                value={filters.sortBy}
                onChange={(nextValue) => set({ sortBy: nextValue })}
                options={[
                  { value: "popular", label: "Popular" },
                  { value: "newest", label: "Latest" },
                  { value: "price_low", label: "Budget" },
                  { value: "price_high", label: "Premium" },
                ]}
              />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ToursFilter;
