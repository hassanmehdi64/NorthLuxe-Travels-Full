import { buildTourDestinationFallback, mapContentDestination } from "../../utils/destinations.js";

export function homeDestinations(tours = [], entries = []) {
  const published = entries.filter((item) => item.status !== "draft");
  const items = published.length ? published.map(mapContentDestination) : buildTourDestinationFallback(tours);
  return items.map((item) => ({ ...item, href: item.slug ? `/destinations/${encodeURIComponent(item.slug)}` : `/tours?q=${encodeURIComponent(item.title)}` }));
}

export function featuredTours(tours = []) {
  const published = tours.filter((tour) => tour.status !== "draft");
  const featured = published.filter((tour) => tour.featured);
  return (featured.length ? featured : published).slice(0, 3);
}

export function contentCards(items = [], route) {
  return items.filter((item) => item.status !== "draft").map((item) => ({
    ...item,
    image: item.image || item.coverImage || "",
    description: item.shortDescription || item.description || "",
    href: item.slug || item.id ? `/${route}/${encodeURIComponent(item.slug || item.id)}` : `/${route}`,
  }));
}

export function internationalDestinations(entries = []) {
  return contentCards(entries, "destinations").filter((item) => {
    const category = String(item.category || "").toLowerCase();
    const country = String(item.meta?.country || "").trim().toLowerCase();
    return category.includes("international") || (country && !["pakistan", "pk"].includes(country));
  }).slice(0, 4);
}
