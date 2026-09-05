import { Link } from "@/lib/router";
import { useSettings } from "../../hooks/useCms";

const FooterBottom = () => {
  const { data: settings } = useSettings(true);
  const currentYear = new Date().getFullYear();
  const siteName = settings?.siteName || "North Luxe Travels";

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-5 text-center sm:flex-row sm:text-left">
      <p className="text-center text-[10px] font-medium text-[var(--footer-muted)] sm:text-left">
        &copy; {currentYear} {siteName}. All rights reserved.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-end">
        <Link
          to="/privacy"
          className="text-[10px] font-medium text-[var(--footer-muted)] transition-colors duration-200 hover:text-[var(--footer-accent)]"
        >
          Privacy Policy
        </Link>
        <Link
          to="/terms"
          className="text-[10px] font-medium text-[var(--footer-muted)] transition-colors duration-200 hover:text-[var(--footer-accent)]"
        >
          Terms of Service
        </Link>
      </div>
    </div>
  );
};

export default FooterBottom;
