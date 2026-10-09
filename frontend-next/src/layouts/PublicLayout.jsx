import { useEffect } from "react";
import { useLocation } from "@/lib/router";
import { SiteNavigation, SiteFooter } from "../components/home/SiteChrome";
import WhatsAppFloatButton from "../components/common/WhatsAppFloatButton";
import { useSettings } from "../hooks/useCms";
import "../styles/public-theme.css";
import "../styles/ui-consistency.css";

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
    <div className="luxe-home public-site">
      <SiteNavigation />
      <div className={location.pathname === "/" ? "public-home-shell" : "public-page-content"}>
        {children}
      </div>
      <SiteFooter />
      <WhatsAppFloatButton />
    </div>
  );
};

export default PublicLayout;
