export const buildTravelSearchUrl = ({ destination = "", date = "", travellers = "2", experience = "" } = {}) => {
  const params = new URLSearchParams({ guests: String(Math.max(1, Math.min(12, Number(travellers) || 2))) });
  if (destination.trim()) params.set("q", destination.trim());
  if (date) params.set("date", date);
  if (experience) params.set("experience", experience);
  return `/tours?${params}`;
};

export const fitsTravellerCount = (tour, guests) => {
  const capacity = Number(tour?.availableSeats ?? tour?.capacity);
  // Unspecified capacity is not an inventory limit.
  return !guests || !Number.isFinite(capacity) || capacity <= 0 || capacity >= guests;
};
