import {
  Calendar,
  MapPin,
  SlidersHorizontal,
} from "lucide-react";

const ToursFilter = ({
  filters,
  setFilters,
  destinations,
}) => {
  const set = (patch) => setFilters((prev) => ({ ...prev, ...patch }));

  return (
    <section className="py-8 lg:py-10 bg-theme-bg">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
        <div className="mb-3 flex items-center justify-center">
          <div className="inline-flex items-center gap-3">
            <span className="h-px w-8 bg-[var(--c-brand)]" />
            <span className="text-[11px] font-black uppercase tracking-[0.26em] text-[var(--c-brand)]">
              Smart Filters
            </span>
            <span className="h-px w-8 bg-[var(--c-brand)]" />
          </div>
        </div>

        <div className="rounded-xl border border-theme bg-theme-surface p-2.5 shadow-[0_10px_18px_rgba(15,23,42,0.06)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
            <InlineSelect icon={MapPin} label="Location">
              <select
                value={filters.destination}
                onChange={(e) => set({ destination: e.target.value })}
                className="h-9 w-full sm:w-auto sm:min-w-[170px] rounded-lg border border-theme bg-theme-bg px-3 text-sm font-semibold text-theme outline-none focus:border-[var(--c-brand)]/45"
              >
                {destinations.map((item) => (
                  <option key={item} value={item}>
                    {item === "all" ? "All Regions" : item}
                  </option>
                ))}
              </select>
            </InlineSelect>

            <InlineSelect icon={Calendar} label="Duration">
              <select
                value={filters.duration}
                onChange={(e) => set({ duration: e.target.value })}
                className="h-9 w-full sm:w-auto sm:min-w-[150px] rounded-lg border border-theme bg-theme-bg px-3 text-sm font-semibold text-theme outline-none focus:border-[var(--c-brand)]/45"
              >
                <option value="all">Any Days</option>
                <option value="1-3">1-3 Days</option>
                <option value="4-7">4-7 Days</option>
                <option value="8+">8+ Days</option>
              </select>
            </InlineSelect>

            <InlineSelect icon={SlidersHorizontal} label="Priority">
              <select
                value={filters.sortBy}
                onChange={(e) => set({ sortBy: e.target.value })}
                className="h-9 w-full sm:w-auto sm:min-w-[130px] rounded-lg border border-theme bg-theme-bg px-3 text-sm font-semibold text-theme outline-none focus:border-[var(--c-brand)]/45"
              >
                <option value="popular">Popular</option>
                <option value="newest">Latest</option>
                <option value="price_low">Budget</option>
                <option value="price_high">Premium</option>
              </select>
            </InlineSelect>
          </div>
        </div>
      </div>
    </section>
  );
};

const InlineSelect = ({ icon: Icon, label, children }) => (
  <label className="flex items-center gap-2.5 rounded-lg border border-theme bg-theme-bg px-2.5 py-2 text-xs font-black uppercase tracking-[0.1em] text-muted">
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[var(--c-brand)]/10">
      <Icon size={14} className="text-[var(--c-brand)]" />
    </span>
    <span className="text-[11px] sm:text-[12px] shrink-0">{label}</span>
    <div className="ml-auto w-full sm:w-auto">{children}</div>
  </label>
);

export default ToursFilter;
