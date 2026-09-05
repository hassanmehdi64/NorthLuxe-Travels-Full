const normalizeMediaUrl = (value = "") => {
  const src = String(value || "").trim();
  if (!src) return "";

  try {
    const url = new URL(src);
    if (["localhost", "127.0.0.1"].includes(url.hostname)) {
      return `${url.pathname}${url.search}`;
    }
  } catch {
    // Relative URLs already point to the current Next.js application.
  }

  return src;
};

export const buildGalleryItems = (items = [], tours = []) => {
  const publishedItems = items
    .map((item) => ({
      src: normalizeMediaUrl(item?.url),
      title: item?.title || "North Luxe journey",
      category: item?.category || "Journey",
      alt: item?.alt || item?.title || "North Luxe travel gallery",
    }))
    .filter((item) => item.src);

  if (publishedItems.length) return publishedItems;

  const fallbackItems = tours.flatMap((tour) => {
    const sources = [tour?.image, ...(Array.isArray(tour?.gallery) ? tour.gallery : [])];
    return sources.map((src) => ({
      src: normalizeMediaUrl(src),
      title: tour?.title || "Northern Pakistan journey",
      category: tour?.location || "Pakistan",
      alt: tour?.title || "Northern Pakistan travel gallery",
    }));
  });

  const uniqueItems = new Map();
  fallbackItems.forEach((item) => {
    if (item.src && !uniqueItems.has(item.src)) uniqueItems.set(item.src, item);
  });

  return [...uniqueItems.values()];
};
