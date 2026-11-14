"use client";

import { useId, useState } from "react";
import { MapPin, CalendarDays, Users, Compass, Search, ChevronDown, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Popover, Select } from "radix-ui";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { useNavigate } from "@/lib/router";
import { usePublicContentList, usePublicTours } from "../../hooks/useCms";
import { homeDestinations } from "./homeData.mjs";
import { buildTravelSearchUrl } from "./travelSearch.mjs";

const SearchSelect = ({ label, icon: Icon, value, onChange, options, className = "" }) => {
  const labelId = useId();
  return <div className={`brand-search-field ${className}`}>
    <span id={labelId} className="brand-search-label">{Icon ? <Icon size={14} aria-hidden="true" /> : null}{label}</span>
    <Select.Root value={value || "__all__"} onValueChange={(next) => onChange(next === "__all__" ? "" : next)}>
      <Select.Trigger className="brand-search-control" aria-labelledby={labelId}><Select.Value /><Select.Icon><ChevronDown size={14} /></Select.Icon></Select.Trigger>
      <Select.Portal><Select.Content className="brand-search-menu" position="popper" sideOffset={6} collisionPadding={12}>
        <Select.ScrollUpButton className="brand-search-scroll"><ChevronDown size={12} className="rotate-180" /></Select.ScrollUpButton>
        <Select.Viewport>{options.map((option) => <Select.Item className="brand-search-option" key={option.value || "__all__"} value={option.value || "__all__"} disabled={option.disabled}>
          <Select.ItemText>{option.label}</Select.ItemText><Select.ItemIndicator><Check size={14} /></Select.ItemIndicator>
        </Select.Item>)}</Select.Viewport>
        <Select.ScrollDownButton className="brand-search-scroll"><ChevronDown size={12} /></Select.ScrollDownButton>
      </Select.Content></Select.Portal>
    </Select.Root>
  </div>;
};

const TravelSearch = () => {
  const { data: tours = [], isLoading: toursLoading } = usePublicTours();
  const { data: entries = [], isLoading: destinationsLoading } = usePublicContentList("destination");
  const destinations = [...new Set(homeDestinations(tours, entries).map((item) => item.title).filter(Boolean))];
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [travellers, setTravellers] = useState("2");
  const [experience, setExperience] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const dateLabelId = useId();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonth = new Date(today.getFullYear() + 20, 11, 1);
  const changeMonth = (year, month) => {
    const next = new Date(year, month, 1);
    setCalendarMonth(next < firstMonth ? firstMonth : next > lastMonth ? lastMonth : next);
  };
  const selectedDate = date ? new Date(`${date}T00:00:00`) : undefined;


  return (
    <form
      className="rounded-panel border border-line bg-white p-3 shadow-pop sm:p-4"
      aria-label="Find tours"
      onSubmit={(event) => {
        event.preventDefault();
        navigate(buildTravelSearchUrl({ destination, date, travellers, experience }));
      }}
    >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr_1fr_auto] lg:items-end">
          <SearchSelect label="Where to?" icon={MapPin} value={destination} onChange={setDestination}
            options={[{ value: "", label: toursLoading && destinationsLoading ? "Loading destinations..." : "All destinations" }, ...destinations.map((title) => ({ value: title, label: title }))]} />
          <div className={`brand-search-field ${moreOpen ? "" : "max-sm:hidden"}`}>
            <span id={dateLabelId} className="brand-search-label"><CalendarDays size={14} aria-hidden="true" />Travel date</span>
            <Popover.Root open={calendarOpen} onOpenChange={(open) => { if (open) setCalendarMonth(selectedDate ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1) : firstMonth); setCalendarOpen(open); }}>
              <Popover.Trigger type="button" className="brand-search-control" aria-labelledby={dateLabelId}>
                <span>{selectedDate ? selectedDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Choose date"}</span><ChevronDown size={14} />
              </Popover.Trigger>
              <Popover.Portal><Popover.Content className="brand-search-calendar" align="start" sideOffset={6} collisionPadding={12} aria-label="Choose travel date">
                <div className="brand-calendar-heading"><span className="brand-calendar-heading-icon"><CalendarDays size={16} /></span><div><strong>Choose your travel date</strong><p>Find the right time to explore</p></div></div>
                <div className="brand-calendar-navigation">
                  <button type="button" aria-label="Previous month" disabled={calendarMonth <= firstMonth} onClick={() => changeMonth(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1)}><ChevronLeft size={16} /></button>
                  <SearchSelect label="Month" value={String(calendarMonth.getMonth())} onChange={(month) => changeMonth(calendarMonth.getFullYear(), Number(month))}
                    options={Array.from({ length: 12 }, (_, month) => ({ value: String(month), label: new Date(2026, month, 1).toLocaleDateString("en-GB", { month: "long" }), disabled: calendarMonth.getFullYear() === today.getFullYear() && month < today.getMonth() }))} />
                  <SearchSelect label="Year" value={String(calendarMonth.getFullYear())} onChange={(year) => changeMonth(Number(year), calendarMonth.getMonth())}
                    options={Array.from({ length: 21 }, (_, index) => ({ value: String(today.getFullYear() + index), label: String(today.getFullYear() + index) }))} />
                  <button type="button" aria-label="Next month" disabled={calendarMonth >= lastMonth} onClick={() => changeMonth(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1)}><ChevronRight size={16} /></button>
                </div>
                <DayPicker mode="single" selected={selectedDate} month={calendarMonth} onMonthChange={setCalendarMonth} disabled={{ before: today }} startMonth={firstMonth} endMonth={lastMonth} hideNavigation classNames={{ month_caption: "brand-calendar-hidden-caption" }} autoFocus onSelect={(day) => {
                  if (day) setDate(`${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`);
                  else setDate("");
                  setCalendarOpen(false);
                }} />
                <button type="button" className="brand-calendar-clear" onClick={() => { setDate(""); setCalendarOpen(false); }}>Clear date</button>
              </Popover.Content></Popover.Portal>
            </Popover.Root>
          </div>
          <SearchSelect className={moreOpen ? "" : "max-sm:hidden"} label="Travellers" icon={Users} value={travellers} onChange={setTravellers}
            options={Array.from({ length: 12 }, (_, index) => ({ value: String(index + 1), label: `${index + 1} ${index === 0 ? "adult" : "adults"}` }))} />
          <SearchSelect className={moreOpen ? "" : "max-sm:hidden"} label="Trip type" icon={Compass} value={experience} onChange={setExperience}
            options={[{ value: "", label: "All experiences" }, { value: "luxury", label: "Luxury" }, { value: "family", label: "Family" }, { value: "adventure", label: "Adventure" }, { value: "culture", label: "Culture" }]} />
          <button type="submit" className="btn btn-primary w-full sm:col-span-2 lg:col-span-1 lg:w-auto"><Search size={16} aria-hidden="true" />Search tours</button>
        </div>
        <button
          type="button"
          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 sm:hidden"
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((value) => !value)}
        >
          {moreOpen ? "Fewer options" : "More options: date, travellers, trip type"}
          <ChevronDown size={14} className={moreOpen ? "rotate-180" : ""} aria-hidden="true" />
        </button>
    </form>
  );
};

export default TravelSearch;
