import { fitsTravellerCount } from "../components/home/travelSearch.mjs";
import PageHero from "../components/common/PageHero";
import ToursFilter from "../components/tours/ToursFilter";
import ToursList from "../components/tours/ToursList";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "@/lib/router";
import { usePublicTours } from "../hooks/useCms";
import {
  getDateSearchMeta,
  getTourSearchScore,
  getTourSearchText,
  normalizeSearchValue,
} from "../utils/tourSearch";

const Tours = () => {
  const { data: tours = [], isLoading } = usePublicTours();
  const [searchParams] = useSearchParams();
  const seasonFilter = (searchParams.get("season") || "").toLowerCase();
  const query = searchParams.get("q") || "";
  const travelDate = searchParams.get("date") || "";
  const guestParam = Number(searchParams.get("guests"));
  const guests = Number.isInteger(guestParam) && guestParam > 0 ? Math.min(guestParam, 12) : 0;
  const experienceFilter = normalizeSearchValue(searchParams.get("experience") || "");
  const requestedExperience = experienceFilter.includes("luxury")
    ? "luxury"
    : experienceFilter.includes("adventure")
      ? "adventure"
      : experienceFilter.includes("culture")
        ? "culture"
        : experienceFilter.includes("family")
          ? "family"
          : "all";
  const searchDestination = searchParams.get("destination") || "all";
  const dateMeta = useMemo(() => getDateSearchMeta(travelDate), [travelDate]);

  const [filters, setFilters] = useState({
    destination: searchDestination || "all",
    duration: "all",
    experience: requestedExperience,
    sortBy: "popular",
  });

  useEffect(() => {
    setFilters((current) => ({ ...current, destination: searchDestination, experience: requestedExperience }));
  }, [searchDestination, requestedExperience]);

  const destinations = useMemo(
    () => ["all", ...new Set(tours.map((tour) => tour.location).filter(Boolean))],
    [tours],
  );

  useEffect(() => {
    if (filters.destination !== "all" && destinations.length && !destinations.includes(filters.destination)) {
      setFilters((prev) => ({ ...prev, destination: "all" }));
    }
  }, [destinations, filters.destination]);

  const filteredTours = useMemo(() => {
    const fitsDuration = (days) => {
      if (filters.duration === "all") return true;
      if (filters.duration === "1-3") return days >= 1 && days <= 3;
      if (filters.duration === "4-7") return days >= 4 && days <= 7;
      return days >= 8;
    };

    const baseMatches = tours.filter((tour) => {
      const destinationOk = filters.destination === "all" || tour.location === filters.destination;
      const durationOk = fitsDuration(Number(tour.durationDays || 0));
      const seasonText = [
        tour?.title,
        tour?.location,
        tour?.shortDescription,
        tour?.bestSeason,
        tour?.season,
        ...(Array.isArray(tour?.tags) ? tour.tags : []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const seasonOk = !seasonFilter || seasonText.includes(seasonFilter);
      const tourSearchText = getTourSearchText(tour);
      const experienceTerms = {
        luxury: ["luxury", "scenic"],
        adventure: ["adventure", "trek", "hike"],
        culture: ["culture", "heritage", "history"],
        family: ["family", "group"],
      };
      const selectedExperienceTerms = experienceTerms[filters.experience] || [];
      const experienceOk =
        filters.experience === "all" ||
        selectedExperienceTerms.some((term) => tourSearchText.includes(term));
      return destinationOk && durationOk && seasonOk && experienceOk && fitsTravellerCount(tour, guests);
    });

    let scoredMatches = baseMatches.map((tour) => ({
      tour,
      meta: getTourSearchScore(tour, query, travelDate),
    }));

    if (query.trim()) {
      scoredMatches = scoredMatches.filter((item) => item.meta.matchesQuery);
    }

    if (travelDate) {
      const dateMatches = scoredMatches.filter((item) => item.meta.matchesDate);
      if (dateMatches.length) scoredMatches = dateMatches;
    }

    return scoredMatches
      .sort((a, b) => {
        const relevanceDiff = (b.meta.score || 0) - (a.meta.score || 0);
        if ((query.trim() || travelDate) && relevanceDiff !== 0) return relevanceDiff;
        if (filters.sortBy === "price_low") return Number(a.tour.price || 0) - Number(b.tour.price || 0);
        if (filters.sortBy === "price_high") return Number(b.tour.price || 0) - Number(a.tour.price || 0);
        if (filters.sortBy === "newest") return new Date(b.tour.createdAt) - new Date(a.tour.createdAt);
        const popularityA = Number(a.tour.reviews || 0) + (a.tour.featured ? 100 : 0);
        const popularityB = Number(b.tour.reviews || 0) + (b.tour.featured ? 100 : 0);
        return popularityB - popularityA;
      })
      .map((item) => item.tour);
  }, [tours, filters, seasonFilter, query, travelDate, guests]);

  const searchSummary = useMemo(
    () => ({
      query: query.trim(),
      guests,
      dateLabel: dateMeta.label,
      seasonLabel: dateMeta.season,
    }),
    [query, dateMeta, guests],
  );

  return (
    <main className="bg-theme-bg text-theme">
      <PageHero
        page="tours"
        label="Tours hero"
        tag="Curated Journeys"
        title="Discover Pakistan"
        accent="Beautifully"
        text="Browse verified tour plans with transparent pricing, trusted support, and smooth booking from start to finish."
      />
      <ToursFilter
        filters={filters}
        setFilters={setFilters}
        destinations={destinations}
      />
      <ToursList
        tours={filteredTours}
        searchSummary={searchSummary}
        isLoading={isLoading}
      />
    </main>
  );
};

export default Tours;
