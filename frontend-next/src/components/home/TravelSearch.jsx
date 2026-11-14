"use client";

import { useId, useState } from "react";
import { MapPin, CalendarDays, Users, Compass, Search, ChevronDown } from "lucide-react";
import SelectMenu from "../forms/SelectMenu";
import DatePickerField from "../forms/DatePickerField";
import { useNavigate } from "@/lib/router";
import { usePublicContentList, usePublicTours } from "../../hooks/useCms";
import { homeDestinations } from "./homeData.mjs";
import { buildTravelSearchUrl } from "./travelSearch.mjs";

const SearchSelect = ({ label, icon: Icon, value, onChange, options, className = "" }) => {
  const labelId = useId();
  return (
    <div className={`brand-search-field ${className}`}>
      <span id={labelId} className="brand-search-label">{Icon ? <Icon size={14} aria-hidden="true" /> : null}{label}</span>
      <SelectMenu size="sm" value={value} onChange={onChange} options={options} aria-labelledby={labelId} />
    </div>
  );
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
  const [moreOpen, setMoreOpen] = useState(false);
  const dateLabelId = useId();


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
            <DatePickerField
              size="sm"
              aria-labelledby={dateLabelId}
              value={date}
              onChange={setDate}
              title="Choose your travel date"
              subtitle="Find the right time to explore"
              yearsAhead={3}
            />
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
