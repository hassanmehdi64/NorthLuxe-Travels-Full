/**
 * Parse an admin text box of image URLs (one per line, or comma-separated).
 * Embedded uploads ("data:image/jpeg;base64,/9j/...") contain a comma, so a plain
 * split would cut them in two; this re-joins them. Also repairs lists already
 * saved in two halves. Trims, drops blanks and duplicates.
 */
const DATA_HEADER = /^data:[\w.+-]+\/[\w.+-]+(;[\w=.+-]+)*$/i;

export const joinSplitDataUrls = (parts) => {
  const list = parts.map((part) => String(part || "").trim()).filter(Boolean);
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

export const parseMediaList = (value) =>
  Array.isArray(value) ? joinSplitDataUrls(value) : joinSplitDataUrls(String(value || "").split(/\r?\n|,/));
