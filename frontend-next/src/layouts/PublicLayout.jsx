import { useEffect } from "react";
import { useLocation } from "@/lib/router";
import Navbar from "../components/navbar/Navbar";
import Footer from "../components/footer/Footer";
import WhatsAppFloatButton from "../components/common/WhatsAppFloatButton";
import { useSettings } from "../hooks/useCms";

const PublicLayout = ({ children }) => {
  const { data: settings } = useSettings(true);
  const location = useLocation();

  const flushHeroRoutes = ["/tours", "/destinations", "/activities", "/services", "/about", "/blog", "/contact"];
  const shouldFlushTopSpacing = flushHeroRoutes.includes(location.pathname);
  const shouldFlushSideSpacing = ["/", ...flushHeroRoutes].includes(location.pathname);

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
    <>
      <Navbar />
      <div className={`${shouldFlushTopSpacing ? "pt-0" : "pt-[60px] sm:pt-[64px]"} ${shouldFlushSideSpacing ? "px-0" : "px-0 sm:px-[5px]"}`}>
        <main>
          {children}
        </main>
      </div>
      <div className="px-0">
        <Footer />
      </div>
      <WhatsAppFloatButton />
    </>
  );
};

export default PublicLayout;
