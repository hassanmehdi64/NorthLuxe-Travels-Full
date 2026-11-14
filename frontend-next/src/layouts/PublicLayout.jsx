import { useEffect } from "react";
import { useLocation } from "@/lib/router";
import { SiteNavigation, SiteFooter } from "../components/home/SiteChrome";
import WhatsAppFloatButton from "../components/common/WhatsAppFloatButton";
import { useSettings } from "../hooks/useCms";
import "../styles/public-theme.css";
import "../styles/ui-consistency.css";
import "../styles/public-consistency.css";

// Pages rebuilt on the design system opt out of the legacy `.public-page-content`
// overrides (styles/public-theme.css). Remove this once the legacy CSS is deleted.
const REBUILT_ROUTES = [/^\/$/, /^\/gallery\/?$/, /^\/tours\/[^/]+\/?$/, /^\/book(\/|$)/, /^\/custom-booking(\/|$)/];
const usesLegacyStyles = (pathname = "") => !REBUILT_ROUTES.some((pattern) => pattern.test(pathname));

const PublicLayout = ({ children }) => {
  const { data: settings } = useSettings(true);
  const location = useLocation();

  useEffect(() => {
    if (!settings) return;

    const siteName = settings.siteName || "North Luxe";
    document.title = siteName;

    const faviconUrl = settings.faviconUrl;
    if (!faviconUrl) return;

    let link = document.querySelector("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "icon");
      document.head.appendChild(link);
    }
    link.setAttribute("href", faviconUrl);
  }, [settings]);

  return (
    <div className="public-site flex min-h-dvh flex-col">
      <a href="#main-content" className="sr-only z-50 rounded-control bg-white px-4 py-2 text-sm font-semibold text-navy-900 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <SiteNavigation />
      <div id="main-content" className={`flex-1 ${usesLegacyStyles(location.pathname) ? "public-page-content" : ""}`}>
        {children}
      </div>
      <SiteFooter />
      <WhatsAppFloatButton />
    </div>
  );
};

export default PublicLayout;
