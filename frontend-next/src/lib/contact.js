/**
 * The business's contact details, read only from site settings (Admin → Settings → General).
 * No invented fallbacks: anything not configured is returned as "" and should be hidden.
 */
export const getContactDetails = (settings = {}) => {
  const email = String(settings?.supportEmail || settings?.siteEmail || "").trim();
  const phone = String(settings?.sitePhone || "").trim();
  const whatsapp = String(settings?.whatsappNumber || "").trim();
  const address = String(settings?.address || "").trim();
  return {
    email,
    phone,
    phoneHref: phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : "",
    whatsapp,
    address,
  };
};
