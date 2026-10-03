import { createPortal } from "react-dom";
import {
  ChevronDown,
  Search,
  MapPin,
  ShieldCheck,
  Star,
  Headphones,
  CalendarDays,
  Users,
  SlidersHorizontal,
  BookOpenCheck,
} from "lucide-react";
import { Link, useNavigate } from "@/lib/router";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Calendar as UiCalendar } from "@/components/ui/calendar";
import PlaceSearchInput from "../search/PlaceSearchInput";
import { usePublicContentList, usePublicTours } from "../../hooks/useCms";
import { buildPlaceSuggestions } from "../../utils/tourSearch";
import HeroBackgroundSlider from "./HeroBackgroundSlider";

const HERO_POINTS = [
  { icon: ShieldCheck, label: "Trusted partners" },
  { icon: Star, label: "Transparent pricing" },
  { icon: Headphones, label: "24/7 support" },
];

const formatDate = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
};

const parseLocalDate = (value) => {
  if (!value) return undefined;

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) return undefined;

  return new Date(year, month - 1, day);
};

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const useIsMobile = (breakpoint = 640) => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const onResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    onResize();

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);

  return isMobile;
};

const HeroDatePicker = ({ when, setWhen, placeholder = "When" }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 320 });

  const wrapRef = useRef(null);
  const panelRef = useRef(null);

  const isMobile = useIsMobile(640);

  const selectedDate = useMemo(() => parseLocalDate(when), [when]);

  const updatePos = useCallback(() => {
    if (typeof window === "undefined") return;

    const el = wrapRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const width = Math.min(320, window.innerWidth - 16);
    const left = Math.min(
      window.innerWidth - width - 8,
      Math.max(8, rect.left),
    );

    setPos({
      top: rect.bottom + 10 + window.scrollY,
      left: left + window.scrollX,
      width,
    });
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!open || isMobile) return;
    updatePos();
  }, [open, isMobile, updatePos]);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const onReposition = () => {
      if (!isMobile) {
        updatePos();
      }
    };

    const onPointerDown = (event) => {
      if (
        wrapRef.current?.contains(event.target) ||
        panelRef.current?.contains(event.target)
      ) {
        return;
      }

      setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, isMobile, updatePos]);

  const calendarContent = (
    <UiCalendar
      mode="single"
      selected={selectedDate}
      onSelect={(date) => {
        if (!date) return;

        setWhen(formatDate(date));
        setOpen(false);
      }}
      className="mx-auto w-full max-w-[17.5rem] rounded-lg border bg-white shadow-[0_18px_40px_rgba(15,23,42,0.12)] sm:max-w-none"
      fixedWeeks
      captionLayout="dropdown"
    />
  );

  return (
    <div
      ref={wrapRef}
      className="relative flex min-h-[54px] items-center gap-3 rounded-[10px] border border-slate-200 bg-white px-4 py-2 shadow-sm transition-colors hover:border-emerald-300">
      <CalendarDays size={20} className="shrink-0 text-[var(--c-navy)]" />

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="min-w-0 flex-1 select-none text-left">
        <span className="block text-[13px] font-bold leading-tight text-slate-900">Travel Dates</span>
        <span className="mt-1 block truncate text-xs text-slate-500">
          {selectedDate
            ? selectedDate.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })
            : placeholder}
        </span>
      </button>
      <ChevronDown size={16} className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          isMobile ? (
            <div
              ref={panelRef}
              className="fixed inset-x-3 top-[4.6rem] z-[99999] sm:inset-x-auto sm:right-4">
              <div className="mx-auto w-full max-w-[17.5rem] sm:max-w-[292px]">
                {calendarContent}
              </div>
            </div>
          ) : (
            <div
              ref={panelRef}
              className="absolute z-[99999]"
              style={{
                top: pos.top,
                left: pos.left,
                width: pos.width,
              }}>
              {calendarContent}
            </div>
          ),
          document.body,
        )}
    </div>
  );
};

const TRAVELER_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 10];

const TravelersSelect = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const panelHeight = 248;
    const spaceBelow = window.innerHeight - rect.bottom;
    const top =
      spaceBelow >= panelHeight + 12
        ? rect.bottom + 8
        : Math.max(8, rect.top - panelHeight - 8);

    setPosition({ top, left: rect.left, width: rect.width });
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (open) updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (
        triggerRef.current?.contains(event.target) ||
        panelRef.current?.contains(event.target)
      ) return;
      setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, updatePosition]);

  return (
    <div
      ref={triggerRef}
      className={`relative flex min-h-[54px] items-center gap-3 rounded-[10px] border bg-white px-4 py-2 shadow-sm transition-colors ${
        open ? "border-[var(--c-brand)] ring-2 ring-[rgba(var(--c-brand-rgb),0.12)]" : "border-slate-200 hover:border-emerald-300"
      }`}
    >
      <Users size={20} className="shrink-0 text-[var(--c-navy)]" />
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="min-w-0 flex-1 text-left"
      >
        <span className="block text-[13px] font-bold leading-tight text-slate-900">Travelers</span>
        <span className="mt-1 block text-xs text-slate-500">
          {value} {Number(value) === 1 ? "Traveler" : "Travelers"}
        </span>
      </button>
      <ChevronDown
        size={16}
        className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180 text-[var(--c-brand)]" : ""}`}
      />

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            role="listbox"
            aria-label="Select number of travelers"
            className="fixed z-[99999] overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_18px_45px_rgba(var(--c-brand-rgb),0.18)]"
            style={position}
          >
            <div className="mb-1 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--c-navy)]">
              Number of travelers
            </div>
            <div className="brand-dropdown-scroll max-h-[198px] space-y-0.5 overflow-y-auto overscroll-contain pr-1">
              {TRAVELER_OPTIONS.map((count) => {
                const selected = String(count) === String(value);
                return (
                  <button
                    key={count}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      onChange(String(count));
                      setOpen(false);
                    }}
                    className={`flex min-h-12 w-full items-center rounded-lg px-3 py-2 text-left text-[13px] font-semibold transition ${
                      selected
                        ? "bg-[var(--c-brand)] text-white"
                        : "text-slate-600 hover:bg-[rgba(var(--c-brand-rgb),0.08)] hover:text-[var(--c-navy)]"
                    }`}
                  >
                    <span>{count} {count === 1 ? "Traveler" : "Travelers"}</span>
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

const TourMain = () => {
  const navigate = useNavigate();

  const { data: tours = [] } = usePublicTours();
  const { data: destinationItems = [] } = usePublicContentList("destination");

  const [where, setWhere] = useState("");
  const [when, setWhen] = useState("");
  const [travelers, setTravelers] = useState("2");

  const placeSuggestions = useMemo(
    () => buildPlaceSuggestions({ tours, destinationItems }),
    [tours, destinationItems],
  );

  const onSubmit = (event) => {
    event.preventDefault();

    const params = new URLSearchParams();
    const trimmedWhere = where.trim();

    if (trimmedWhere) {
      params.set("q", trimmedWhere);
    }

    if (when) {
      params.set("date", when);
    }

    params.set("travelers", travelers);

    const query = params.toString();

    navigate(query ? `/tours?${query}` : "/tours");
  };

  return (
    <section className="relative isolate overflow-hidden bg-[#fbfaf7] xl:grid xl:min-h-[560px] xl:grid-cols-[minmax(0,1.7fr)_minmax(410px,0.82fr)] xl:[height:calc(100svh-64px)]">
      <div className="relative min-h-[520px] overflow-hidden sm:min-h-[580px] md:min-h-[620px] xl:h-full xl:min-h-0">
        <HeroBackgroundSlider />
        <div className="absolute inset-0 z-[14] bg-[linear-gradient(90deg,rgba(var(--c-brand-rgb),0.9)_0%,rgba(var(--c-brand-rgb),0.76)_34%,rgba(var(--c-brand-rgb),0.34)_68%,rgba(var(--c-brand-rgb),0.14)_100%)]" />

        <div className="relative z-20 flex min-h-[520px] items-center px-5 py-10 sm:min-h-[580px] sm:px-10 sm:py-12 md:min-h-[620px] md:px-14 xl:h-full xl:min-h-0 xl:px-[5.5vw] xl:py-12">
          <div className="max-w-[540px]">
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-[0.28em] text-white/80 [&>span:nth-child(3)]:hidden [&>span:nth-child(5)]:hidden sm:text-[11px]">
              <span className="h-0.5 w-12 bg-[var(--c-brand)]" />
              <span>Explore</span><span>•</span><span>Experience</span><span>•</span><span>Belong</span>
            </div>
            <h1 className="mt-4 text-[clamp(3rem,11vw,4.5rem)] font-medium leading-[0.92] tracking-[-0.04em] text-white xl:text-[clamp(3.5rem,4.35vw,4.85rem)]">
              Discover <span className="block text-[var(--c-brand)]">Pakistan</span><span className="block">Beautifully</span>
            </h1>
            <p className="mt-5 max-w-md text-base font-medium leading-7 text-white/85 sm:text-lg sm:leading-8">
              Luxury tours, verified partners,<br className="hidden sm:block" /> seamless booking.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:items-stretch">
              <Link to="/destinations" className="ql-btn-primary min-h-11 rounded-[10px] px-5 text-xs font-bold">Explore Destinations</Link>
              <Link to="/tours" className="inline-flex min-h-11 items-center justify-center rounded-[10px] border border-white/55 bg-white/10 px-5 text-xs font-bold text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-[var(--c-navy)]">View Packages</Link>
            </div>
          </div>
        </div>
      </div>

      <aside className="relative z-30 border-t-2 border-[var(--c-brand)] bg-[#fbfaf7] px-5 py-9 sm:px-10 sm:py-11 md:px-14 xl:-ml-24 xl:flex xl:h-full xl:min-h-0 xl:items-center xl:border-t-0 xl:px-0 xl:py-5 xl:pl-32 xl:pr-[4vw] xl:[clip-path:polygon(15%_0,100%_0,100%_100%,0_100%)]">
        <span className="pointer-events-none absolute bottom-0 left-0 hidden h-full w-[2px] origin-bottom rotate-[8deg] bg-[var(--c-brand)] xl:block" />
        <div className="relative mx-auto w-full max-w-[460px] xl:max-w-[430px]">
          <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.13em] text-slate-600"><span className="h-0.5 w-12 bg-[var(--c-brand)]" />Plan your journey</div>
          <h2 className="mt-3 text-[40px] font-medium leading-[0.98] tracking-[-0.03em] text-[var(--c-navy)] sm:text-[44px]">Find Your<br />Perfect Trip</h2>
          <p className="mt-2 text-[13px] text-slate-600">Handpicked destinations. Unforgettable experiences.</p>

          <form onSubmit={onSubmit} className="mt-5 space-y-2.5">
            <div className="relative flex min-h-[54px] items-center gap-3 rounded-[10px] border border-slate-200 bg-white px-4 py-2 shadow-sm transition-colors hover:border-emerald-300">
              <MapPin size={20} className="shrink-0 text-[var(--c-navy)]" />
              <div className="min-w-0 flex-1"><span className="block text-[13px] font-bold leading-tight text-slate-900">Destination</span><PlaceSearchInput value={where} onChange={setWhere} suggestions={placeSuggestions} placeholder="Where do you want to go?" anchorToParent inputClassName="mt-1 w-full bg-transparent text-xs text-slate-600 outline-none placeholder:text-slate-400" /></div>
              <ChevronDown size={16} className="shrink-0 text-slate-400" />
            </div>

            <HeroDatePicker when={when} setWhen={setWhen} placeholder="Select your dates" />

            <TravelersSelect value={travelers} onChange={setTravelers} />

            <button type="submit" className="ql-btn-primary min-h-12 w-full text-sm font-bold"><Search size={18} />Search Journeys</button>
          </form>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              to="/custom-plan-request"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-semibold text-[#294052] shadow-[0_2px_8px_rgba(var(--c-brand-rgb),0.04)] transition hover:border-[rgba(var(--c-brand-rgb),0.38)] hover:bg-[#f5fbf8] hover:text-[var(--c-brand-dark)]"
            >
              <SlidersHorizontal size={13} />
              Custom request
            </Link>
            <Link
              to="/book"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[var(--c-navy)] px-3 text-[11px] font-semibold text-white shadow-[0_4px_12px_rgba(var(--c-brand-rgb),0.14)] transition hover:bg-[#0b2c54]"
            >
              <BookOpenCheck size={13} />
              Book directly
            </Link>
          </div>

          <div className="mt-3 grid grid-cols-3 divide-x divide-slate-200 border-t border-slate-100 pt-3">
            {HERO_POINTS.map(({ icon: Icon, label }) => <div key={label} className="flex flex-col items-center gap-1 px-2 text-center text-[9px] font-semibold leading-3 text-slate-700 sm:flex-row sm:text-left sm:text-[10px]"><Icon size={18} className="shrink-0 text-[var(--c-navy)]" /><span>{label}</span></div>)}
          </div>
        </div>
      </aside>
    </section>
  );
};

export default TourMain;
