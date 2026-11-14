import { useLocation } from "@/lib/router";
import { FaFacebookMessenger, FaWhatsapp } from "react-icons/fa";
import { useSettings } from "../../hooks/useCms";
import { getWhatsAppHref } from "../../lib/whatsapp";

/**
 * Floating chat buttons. Hidden when no WhatsApp/Messenger is configured.
 * Pages with a sticky bottom bar set <body data-sticky-bar="true"> (see
 * useStickyBottomBar) and the buttons move above it (styles/design-system.css).
 */
const WhatsAppFloatButton = () => {
  const { data: settings } = useSettings(true);
  const location = useLocation();
  if (location.pathname.startsWith("/admin")) return null;

  const messengerLink = settings?.socialLinks?.facebook || "";
  const whatsappLink = getWhatsAppHref(settings, `Hello ${settings?.siteName || "North Luxe"}, I need help with a tour booking.`);
  if (!messengerLink && !whatsappLink) return null;

  const buttonClass =
    "grid h-12 w-12 place-items-center rounded-full text-white shadow-raised transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2";

  return (
    <div className="site-chat-buttons fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2.5 sm:bottom-6 sm:right-6">
      {messengerLink ? (
        <a href={messengerLink} target="_blank" rel="noreferrer" aria-label="Message us on Messenger" className={`${buttonClass} bg-[#0084ff]`}>
          <FaFacebookMessenger className="h-5 w-5" aria-hidden="true" />
        </a>
      ) : null}
      {whatsappLink ? (
        <a href={whatsappLink} target="_blank" rel="noreferrer" aria-label="Chat with us on WhatsApp" className={`${buttonClass} bg-[#128c4a]`}>
          <FaWhatsapp className="h-6 w-6" aria-hidden="true" />
        </a>
      ) : null}
    </div>
  );
};

export default WhatsAppFloatButton;
