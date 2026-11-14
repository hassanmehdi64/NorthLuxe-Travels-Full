"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Heart, Mail, MapPin, Menu, MessageCircle, Phone, Search, ShoppingBag, X } from "lucide-react";
import { Link } from "@/lib/router";
import { useSettings } from "../../hooks/useCms";
import { getCart, getWishlist } from "../../features/commerce/storage";
import { getContactDetails } from "../../lib/contact";
import FooterSocial from "../footer/FooterSocial";

export const planRoute = "/custom-plan-request";

const navigation = [
  ["Destinations", "/destinations"],
  ["Tours", "/tours"],
  ["Activities", "/activities"],
  ["Services", "/services"],
  ["About", "/about"],
  ["Journal", "/blog"],
  ["Contact", "/contact"],
];

const isActivePath = (pathname, to) => pathname === to || pathname?.startsWith(`${to}/`);

function Brand({ variant = "dark", className = "" }) {
  const { data: settings } = useSettings(true);
  const siteName = settings?.siteName || "North Luxe Travels";
  return (
    <Link to="/" className={`inline-flex shrink-0 items-center ${className}`} aria-label={`${siteName} home`}>
      {/* Trimmed logo files: the originals carry large transparent margins. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={variant === "light" ? "/logo-white-trim.png" : "/logo-dark-trim.png"}
        alt={siteName}
        width={404}
        height={174}
        className="h-10 w-auto sm:h-11"
      />
    </Link>
  );
}

function CountBadge({ count }) {
  if (!count) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold leading-none text-white">
      {count > 9 ? "9+" : count}
    </span>
  );
}

function useCommerceCounts() {
  const [counts, setCounts] = useState({ cart: 0, wishlist: 0 });
  useEffect(() => {
    const sync = () => setCounts({ cart: getCart().length, wishlist: getWishlist().length });
    sync();
    const events = ["storage", "ql-cart-updated", "ql-wishlist-updated"];
    events.forEach((event) => window.addEventListener(event, sync));
    return () => events.forEach((event) => window.removeEventListener(event, sync));
  }, []);
  return counts;
}

const toolClass =
  "relative grid h-9 w-9 place-items-center rounded-control text-navy-900 transition-colors hover:bg-brand-50 hover:text-brand-700";

export function SiteNavigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const counts = useCommerceCounts();

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header data-scrolled={scrolled} className="site-header sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="container-site flex h-16 items-center gap-4">
        <Brand />

        <nav aria-label="Main navigation" className="ml-auto hidden items-center gap-1 lg:flex">
          {navigation.map(([label, to]) => {
            const active = isActivePath(pathname, to);
            return (
              <Link
                key={to}
                to={to}
                aria-current={active ? "page" : undefined}
                className={`nav-link px-3 py-2 text-sm [--nav-x:0.75rem] ${active ? "font-semibold" : "font-medium"}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-0.5 lg:ml-2">
          <Link to="/search" aria-label="Search tours" className={toolClass}><Search size={18} /></Link>
          <Link to="/wishlist" aria-label={`Wishlist, ${counts.wishlist} saved`} className={`${toolClass} hidden sm:grid`}>
            <Heart size={18} /><CountBadge count={counts.wishlist} />
          </Link>
          <Link to="/cart" aria-label={`Cart, ${counts.cart} tours`} className={toolClass}>
            <ShoppingBag size={18} /><CountBadge count={counts.cart} />
          </Link>
        </div>

        <Link to={planRoute} className="btn btn-primary btn-sm hidden md:inline-flex">
          Plan my trip
        </Link>

        <button
          type="button"
          className="btn-icon btn-icon-sm lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Mobile navigation"
          className="menu-enter max-h-[calc(100dvh-64px)] overflow-y-auto border-t border-line bg-white lg:hidden"
        >
          <div className="container-site grid gap-1 py-3">
            {navigation.map(([label, to]) => {
              const active = isActivePath(pathname, to);
              return (
                <Link
                  key={to}
                  to={to}
                  aria-current={active ? "page" : undefined}
                  className="flex h-11 items-center px-3 text-[15px]"
                >
                  <span className={`nav-link py-1 ${active ? "font-semibold" : "font-medium"}`}>{label}</span>
                </Link>
              );
            })}
            <Link to="/wishlist" className="flex h-11 items-center gap-2 rounded-control px-3 text-[15px] font-medium text-navy-900 hover:bg-canvas sm:hidden">
              <Heart size={16} aria-hidden="true" /> Wishlist {counts.wishlist > 0 && <span className="text-subtle">({counts.wishlist})</span>}
            </Link>
            <Link to={planRoute} className="btn btn-primary mt-2 w-full">Plan my trip</Link>
          </div>
        </nav>
      )}
    </header>
  );
}

const footerGroups = [
  ["Explore", [["Destinations", "/destinations"], ["Tours", "/tours"], ["Activities", "/activities"], ["Services", "/services"], ["Gallery", "/gallery"]]],
  ["Company", [["About us", "/about"], ["Journal", "/blog"], ["Careers", "/careers"], ["Contact", "/contact"]]],
  ["Support", [["Plan a trip", planRoute], ["FAQs", "/faqs"], ["Travel guidelines", "/guidelines"], ["Booking help", "/help"]]],
];

export function SiteFooter() {
  const { data: settings } = useSettings(true);
  const { email, phone, phoneHref, whatsapp, address } = getContactDetails(settings);
  const whatsappHref = whatsapp ? `https://wa.me/${whatsapp.replace(/[^\d]/g, "")}` : "";
  const socialLinks = Object.entries(settings?.socialLinks || {}).filter(
    ([platform, href]) => href && ["facebook", "instagram", "twitter", "linkedin"].includes(platform),
  );
  const siteName = settings?.siteName || "North Luxe Travels";

  return (
    <footer className="bg-navy-950 text-white/70">
      <div className="container-site grid gap-10 py-12 md:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)] md:gap-12">
        <div className="max-w-sm">
          <Brand variant="light" />
          <p className="mt-4 text-sm leading-relaxed">
            {settings?.siteTagline || "Premium tours across Gilgit-Baltistan."}
          </p>
          <address className="mt-5 grid gap-2.5 text-sm not-italic">
            {phone && (
              <a href={phoneHref} className="inline-flex items-center gap-2.5 hover:text-white">
                <Phone size={15} className="text-sand-300" aria-hidden="true" />{phone}
              </a>
            )}
            {whatsappHref && (
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 hover:text-white">
                <MessageCircle size={15} className="text-sand-300" aria-hidden="true" />WhatsApp
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} className="inline-flex items-center gap-2.5 break-all hover:text-white">
                <Mail size={15} className="shrink-0 text-sand-300" aria-hidden="true" />{email}
              </a>
            )}
            {address && (
              <span className="inline-flex items-start gap-2.5">
                <MapPin size={15} className="mt-0.5 shrink-0 text-sand-300" aria-hidden="true" />{address}
              </span>
            )}
          </address>
          {socialLinks.length > 0 && (
            <div className="mt-5 flex gap-2">
              {socialLinks.map(([platform, href]) => <FooterSocial key={platform} name={platform} icon={platform} href={href} />)}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {footerGroups.map(([title, links]) => (
            <nav key={title} aria-label={`${title} links`}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-white">{title}</h2>
              <ul className="mt-4 grid gap-2.5 text-sm">
                {links.map(([label, to]) => (
                  <li key={to}><Link to={to} className="hover:text-white">{label}</Link></li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-site flex flex-col gap-3 py-5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
          <nav aria-label="Legal links" className="flex gap-5">
            <Link to="/privacy" className="hover:text-white">Privacy policy</Link>
            <Link to="/terms" className="hover:text-white">Terms & cancellation</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
