/**
 * WhatsApp link from site settings, or "" when no number is configured
 * (never fall back to an invented number).
 */
export const getWhatsAppHref = (settings, message = "") => {
  const configured = String(settings?.socialLinks?.whatsapp || "").trim();
  if (/^https?:\/\//i.test(configured)) return configured;
  const digits = String(settings?.whatsappNumber || "").replace(/[^\d]/g, "");
  if (digits.length < 8) return "";
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
};
