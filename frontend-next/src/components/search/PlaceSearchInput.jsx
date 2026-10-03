import { useEffect, useId, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { filterPlaceSuggestions } from "../../utils/tourSearch";

const PlaceSearchInput = ({
  value,
  onChange,
  suggestions = [],
  placeholder = "Search places",
  rootClassName = "",
  inputClassName = "",
  panelClassName = "",
  anchorToParent = false,
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const listboxId = useId();

  useEffect(() => {
    const handleOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const visibleSuggestions = useMemo(() => {
    const normalizedValue = value.trim().toLowerCase();
    const selectedItem = suggestions.find(
      (item) => item.label.trim().toLowerCase() === normalizedValue,
    );

    if (selectedItem) {
      return [
        selectedItem,
        ...suggestions.filter((item) => item.value !== selectedItem.value),
      ];
    }

    return filterPlaceSuggestions(suggestions, value, 7);
  }, [suggestions, value]);

  return (
    <div
      ref={rootRef}
      className={`relative w-full ${rootClassName}`.trim()}
      style={anchorToParent ? { position: "static" } : undefined}
    >
      <input
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className={inputClassName}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={listboxId}
      />

      {open && visibleSuggestions.length ? (
        <div
          role="listbox"
          id={listboxId}
          aria-label="Destination suggestions"
          className={`absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_18px_45px_rgba(var(--c-brand-rgb),0.18)] ${panelClassName}`.trim()}
        >
          <div className="flex items-center gap-2 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--c-navy)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--c-brand)]" />
            Available destinations
          </div>
          <div className="brand-dropdown-scroll max-h-[230px] space-y-0.5 overflow-y-auto overscroll-contain pr-1">
            {visibleSuggestions.map((item) => {
              const selected = value.trim().toLowerCase() === item.label.trim().toLowerCase();

              return (
                <button
                  key={item.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(item.label);
                    setOpen(false);
                  }}
                  className={`flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                    selected
                      ? "bg-[var(--c-brand)] text-white"
                      : "text-slate-600 hover:bg-[rgba(var(--c-brand-rgb),0.08)] hover:text-[var(--c-navy)]"
                  }`}
                >
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${selected ? "bg-white/15" : "bg-slate-50 text-[var(--c-navy)]"}`}>
                    <MapPin size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold">{item.label}</span>
                    {item.subtitle ? (
                      <span className={`mt-0.5 block truncate text-[10px] font-medium ${selected ? "text-white/75" : "text-slate-400"}`}>
                        {item.subtitle}
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PlaceSearchInput;
