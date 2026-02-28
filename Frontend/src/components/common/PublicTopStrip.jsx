import { Link } from "react-router-dom";
import { useSettings } from "../../hooks/useCms";

const PublicTopStrip = () => {
  const { data: settings } = useSettings(true);

  const phone = settings?.sitePhone || "+92 300 1234567";
  const email = settings?.siteEmail || "info@northluxetravels.com";

  return (
    <div className="max-sm:ml-[27px] max-sm:mr-3 sm:mx-0 flex flex-col gap-2 text-center sm:text-left sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-theme bg-theme-surface px-3 sm:px-4 py-2 mb-3 text-sm text-muted font-bold">
      <p className="hidden sm:block font-semibold">
        Premium tours across Gilgit-Baltistan.
      </p>
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-4">
        <a href={`tel:${phone}`} className="hover:text-theme transition-colors">
          {phone}
        </a>
        <a
          href={`mailto:${email}`}
          className="hover:text-theme transition-colors">
          {email}
        </a>
        <Link
          to="/contact"
          className="text-[var(--c-brand)] font-semibold hover:opacity-80">
          Talk to an advisor
        </Link>
      </div>
    </div>
  );
};

export default PublicTopStrip;
