import FooterSocial from "./FooterSocial";
import FooterSection from "./FooterSection";
import FooterBottom from "./FooterBottom";
import { footerLinks, socialLinks } from "./footerData";
import { Mail, Phone, MapPin } from "lucide-react";
import Image from "next/image";
import { useSettings } from "../../hooks/useCms";
import { getFooterColors } from "../../lib/siteTheme";

const normalizePhoneHref = (value) =>
  String(value || "").replace(/[^\d+]/g, "");

const splitBrandName = (name) => {
  const parts = String(name || "North Luxe")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length < 2) {
    return { main: parts[0] || "North", accent: "Luxe" };
  }

  return {
    main: parts.slice(0, -1).join(" "),
    accent: parts[parts.length - 1],
  };
};

const Footer = () => {
  const { data: settings } = useSettings(true);

  const siteName = settings?.siteName || "North Luxe";
  const brand = splitBrandName(siteName);

  const tagline =
    settings?.siteTagline ||
    "Premium tours across Gilgit-Baltistan with curated routes, reliable local support, and comfort-first planning for families, couples, and group travelers.";

  const email =
    settings?.supportEmail ||
    settings?.siteEmail ||
    "info@northluxetravels.com";

  const phone = settings?.sitePhone || "+92 300 1234567";
  const address = settings?.address || "Skardu, Gilgit-Baltistan";

  const footerColors = getFooterColors(settings);
  const footerLogoUrl = "/north-luxe-logo.png";

  const configuredSocialLinks = socialLinks.map((item) => ({
    ...item,
    href: settings?.socialLinks?.[item.icon] || item.href,
  }));

  const contactInfo = [
    { icon: Mail, label: "Email", value: email, href: `mailto:${email}` },
    {
      icon: Phone,
      label: "Phone",
      value: phone,
      href: `tel:${normalizePhoneHref(phone)}`,
    },
    { icon: MapPin, label: "Base", value: address },
  ];

  return (
    <footer
      className="relative overflow-hidden border-t border-white/10 bg-[var(--c-navy)] pb-20 pt-8 text-[var(--footer-text)] sm:pb-6 sm:pt-9"
      style={{
        "--footer-bg": "var(--c-navy)",
        "--footer-text": "#ffffff",
        "--footer-muted": "rgba(255,255,255,0.66)",
        "--footer-accent": footerColors.accentText,
        background: "var(--footer-bg)",
        color: "var(--footer-text)",
      }}>
      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 pb-7 text-center sm:text-left md:grid-cols-6 md:gap-x-8 lg:grid-cols-12 lg:gap-x-10 lg:pb-8">
          <div className="col-span-2 space-y-3 md:col-span-6 lg:col-span-5">
            <div className="flex flex-col items-center sm:items-start">
              {footerLogoUrl ? (
                <div className="flex w-full items-center justify-center sm:justify-start">
                  <Image
                    src={footerLogoUrl}
                    alt={siteName}
                    width={160}
                    height={56}
                    className="h-14 w-40 object-contain object-center sm:object-left"
                  />
                </div>
              ) : (
                <h3 className="inline-flex text-xl font-bold tracking-tight text-[var(--footer-text)] md:text-2xl">
                  {brand.main}{" "}
                  <span className="text-[var(--footer-accent)]">
                    {brand.accent}
                  </span>
                </h3>
              )}
            </div>

            <p className="mx-auto max-w-md text-xs leading-5 text-[var(--footer-muted)] sm:mx-0">
              {tagline}
            </p>

            <div className="flex items-center justify-center gap-2 pt-0 sm:justify-start">
              {configuredSocialLinks.map((social, index) => (
                <FooterSocial key={index} {...social} />
              ))}
            </div>
          </div>

          {footerLinks.map((section, index) => (
            <FooterSection
              key={index}
              title={section.title}
              links={section.links}
              className="col-span-1 w-full text-center sm:text-left md:col-span-2 lg:col-span-2"
            />
          ))}

            <div className="col-span-2 mx-auto w-full max-w-[280px] space-y-3 text-center sm:mx-0 sm:text-left md:col-span-2 lg:col-span-3">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--footer-accent)]">
                Contact
              </h4>

              <ul className="space-y-2.5">
                {contactInfo.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-center gap-2.5 sm:justify-start">
                    <div className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[rgba(var(--c-brand-rgb),0.13)] text-[var(--footer-accent)]">
                      <item.icon size={13} />
                    </div>

                    <div className="min-w-0 flex-1 text-left">
                      {item.href ? (
                        <a
                          href={item.href}
                          className="break-words text-[11px] font-medium text-[var(--footer-muted)] transition-colors hover:text-[var(--footer-accent)]">
                          {item.value}
                        </a>
                      ) : (
                        <p className="break-words text-[11px] font-medium text-[var(--footer-muted)]">
                          {item.value}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
          </div>
        </div>

        <FooterBottom />
      </div>
    </footer>
  );
};

export default Footer;
