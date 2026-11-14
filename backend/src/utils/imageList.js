/**
 * Image lists (galleries, slider images) arrive as arrays of URLs. Older admin forms
 * split their text box on commas, which cuts an embedded upload
 * ("data:image/jpeg;base64,/9j/...") into two broken entries:
 *   ["data:image/jpeg;base64", "/9j/..."]
 * cleanImageList re-joins those halves, trims, drops blanks and duplicates.
 * Used when saving (so new data is clean) and when reading (so existing data shows).
 */
const DATA_HEADER = /^data:[\w.+-]+\/[\w.+-]+(;[\w=.+-]+)*$/i; // "data:image/jpeg;base64" with no payload

export const cleanImageList = (items) => {
  const list = (Array.isArray(items) ? items : [])
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);

  const out = [];
  for (let i = 0; i < list.length; i += 1) {
    const value = list[i];
    if (DATA_HEADER.test(value) && i + 1 < list.length && !/^(https?:|data:|\/\/)/i.test(list[i + 1])) {
      out.push(`${value},${list[i + 1]}`);
      i += 1;
    } else if (!DATA_HEADER.test(value)) {
      out.push(value);
    }
  }
  return [...new Set(out)];
};

/** Clean the image arrays kept inside content `meta` (activity sliders, highlights). */
export const cleanMetaImageLists = (meta) => {
  if (!meta || typeof meta !== "object") return meta || {};
  const next = { ...meta };
  for (const key of Object.keys(next)) {
    if (/images$/i.test(key) && Array.isArray(next[key])) next[key] = cleanImageList(next[key]);
  }
  return next;
};
