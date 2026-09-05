import { useSettings } from "../../hooks/useCms";

const getMapEmbedUrl = (settings) => {
  const configured = String(settings?.googleMapUrl || "").trim();
  if (configured) {
    if (configured.includes("output=embed")) return configured;
    return `${configured}${configured.includes("?") ? "&" : "?"}output=embed`;
  }

  const query = encodeURIComponent(settings?.address || "Skardu, Gilgit-Baltistan");
  return `https://www.google.com/maps?q=${query}&output=embed`;
};

const ContactMap = () => {
  const { data: settings } = useSettings(true);

  return (
    <div className="overflow-hidden rounded-2xl border border-theme bg-theme-surface shadow-[0_6px_18px_rgba(15,23,42,0.045)]">
      <div className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
        <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.26em] text-[var(--c-brand)] sm:text-[10px]">
          Visit Our Region
        </p>
        <h3 className="text-xl font-bold tracking-tight text-theme sm:text-2xl">Find North Luxe</h3>
        </div>
        <p className="text-xs text-muted">Gilgit-Baltistan, Pakistan</p>
      </div>
      <iframe
        title="North Luxe Travels Location"
        src={getMapEmbedUrl(settings)}
        className="h-[280px] w-full border-0 sm:h-[320px] lg:h-[340px]"
        loading="lazy"
      ></iframe>
    </div>
  );
};

export default ContactMap;
