/**
 * Safe HTML string building for print windows and other places that must produce
 * raw HTML (e.g. window.document.write).
 *
 *   html`<p>${customerText}</p>`        → customerText is HTML-escaped
 *   html`<ul>${items.map((i) => html`<li>${i}</li>`)}</ul>`  → nested html`` and arrays are kept
 *
 * Every interpolated value is escaped unless it was itself produced by `html`.
 * There is intentionally no "raw" escape hatch.
 */

class SafeHtml {
  constructor(value) {
    this.value = value;
  }

  toString() {
    return this.value;
  }
}

export const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const render = (value) => {
  if (value === null || value === undefined || value === false) return "";
  if (value instanceof SafeHtml) return value.value;
  if (Array.isArray(value)) return value.map(render).join("");
  return escapeHtml(value);
};

export const html = (strings, ...values) =>
  new SafeHtml(strings.reduce((out, chunk, index) => out + chunk + (index < values.length ? render(values[index]) : ""), ""));

/** Only http(s) and data:image URLs are allowed in src/href attributes. */
export const safeUrl = (value) => {
  const url = String(value ?? "").trim();
  return /^(https?:\/\/|data:image\/(png|jpe?g|webp|gif);base64,)/i.test(url) ? url : "";
};
