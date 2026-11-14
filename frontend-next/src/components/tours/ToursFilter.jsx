import { useId } from "react";
import { Calendar, ListFilter, MapPin, Mountain, RotateCcw } from "lucide-react";
import SelectMenu from "../forms/SelectMenu";

const FilterDropdown = ({ value, onChange, options, icon, label }) => {
  const labelId = useId();
  return (
    <div className="min-w-0 flex-1">
      <span id={labelId} className="mb-1.5 block text-xs font-semibold text-navy-900">{label}</span>
      <SelectMenu size="sm" icon={icon} aria-labelledby={labelId} value={value} onChange={onChange} options={options} />
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
