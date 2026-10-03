"use client";

import { useEffect, useState } from "react";
import { Link, NavLink } from "@/lib/router";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Heart, Search, ShoppingBag, Mail, Phone, MapPin } from "lucide-react";
import { useSettings } from "../../hooks/useCms";
import { getCart, getWishlist } from "../../features/commerce/storage";
import FooterSocial from "../footer/FooterSocial";
import { homeAssets as assets } from "./homeAssets";
import "./homepage.css";

export const planRoute = "/custom-plan-request";
const navigation = [
  ["Destinations", "/destinations"], ["Packages", "/tours"],
  ["Activities", "/activities"], ["Services", "/services"],
  ["About", "/about"], ["Journal", "/blog"], ["Contact", "/contact"],
];

export function Icon({ name }) {
  // Keep exported SVG dimensions intrinsic; their wrappers reserve the design slot.
  return <img className="home-icon" src={assets[name]} alt="" aria-hidden="true" />;
}

export function Action({ to, children, variant = "green", arrow = true, className = "" }) {
  const arrowName = variant === "green" ? "ArrowUpRight" : "ArrowUpRight1";
  return <Button asChild className={`home-action home-action-${variant} ${className}`}>
    <Link to={to}>{children}{arrow && <Icon name={arrowName} />}</Link>
  </Button>;
}

function Brand() {
  const { data: settings } = useSettings(true);
  const siteName = settings?.siteName || "North Luxe";
  return <Link to="/" className="home-brand" aria-label={`${siteName} home`}>
    <span className="home-configured-logo"><img className="home-logo-image" src="/logo-dark.png" alt={siteName} /></span>
  </Link>;
}

export function SiteNavigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [counts, setCounts] = useState({ cart: 0, wishlist: 0 });
  useEffect(() => {
    const sync = () => setCounts({ cart: getCart().length, wishlist: getWishlist().length });
    sync();
    const events = ["storage", "ql-cart-updated", "ql-wishlist-updated"];
    events.forEach((event) => window.addEventListener(event, sync));
    return () => events.forEach((event) => window.removeEventListener(event, sync));
  }, []);
  useEffect(() => setOpen(false), [pathname]);
  return <header className="home-nav" onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}>
    <Brand />
    <nav className="home-desktop-nav" aria-label="Main navigation">
      {navigation.map(([label, to]) => <NavLink key={label} to={to} className={({ isActive }) => isActive ? "is-active" : undefined}>{label}</NavLink>)}
    </nav>
    <div className="home-nav-tools"><Link to="/search" aria-label="Search tours"><Search size={18} /></Link><Link to="/wishlist" aria-label={`Wishlist, ${counts.wishlist} saved tours`}><Heart size={18} />{counts.wishlist > 0 && <small>{counts.wishlist}</small>}</Link><Link to="/cart" aria-label={`Cart, ${counts.cart} tours`}><ShoppingBag size={18} />{counts.cart > 0 && <small>{counts.cart}</small>}</Link></div>
    <Action to={planRoute} className="home-nav-plan">Plan My Trip</Action>
    <Button className="home-menu" variant="outline" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="home-mobile-menu" onClick={() => setOpen(!open)}>
      {open ? <span aria-hidden="true">×</span> : <Icon name="Menu" />}
    </Button>
    {open && <nav id="home-mobile-menu" className="home-mobile-nav" aria-label="Mobile navigation">
      {navigation.map(([label, to]) => <Link key={label} to={to} onClick={() => setOpen(false)}>{label}</Link>)}
      <Action to={planRoute}>Plan My Trip</Action>
    </nav>}
  </header>;
}

export function SiteFooter() {
  const { data: settings } = useSettings(true);
  const groups = [
    ["Explore", [...navigation.slice(0, 4), ["Gallery", "/gallery"], ["Journal", "/blog"]]],
    ["Company", [["About us", "/about"], ["Contact", "/contact"], ["Careers", "/careers"], ["Plan a trip", planRoute]]],
    ["Help", [["FAQs", "/faqs"], ["Travel guidelines", "/guidelines"], ["Booking information", "/help"]]],
  ];
  const email = settings?.supportEmail || settings?.siteEmail;
  const socialLinks = Object.entries(settings?.socialLinks || {}).filter(([platform, href]) => href && ["facebook", "instagram", "twitter", "linkedin"].includes(platform));
  return <footer className="home-footer home-container">
    <div className="home-footer-content">
      <div className="home-footer-brand">
        <Brand />
        <p>{settings?.siteTagline || "Thoughtful journeys across Pakistan and beyond."}</p>
        <address className="home-footer-contact">
          {email && <a href={`mailto:${email}`}><Mail size={14} aria-hidden="true" /><span>{email}</span></a>}
          {settings?.sitePhone && <a href={`tel:${settings.sitePhone.replace(/[^\d+]/g, "")}`}><Phone size={14} aria-hidden="true" /><span>{settings.sitePhone}</span></a>}
          {settings?.address && <div><MapPin size={14} aria-hidden="true" /><span>{settings.address}</span></div>}
        </address>
        {socialLinks.length > 0 && <div className="home-social-links">{socialLinks.map(([platform, href]) => <FooterSocial key={platform} name={platform} icon={platform} href={href} />)}</div>}
      </div>
      <div className="home-footer-navigation">
        {groups.map(([title, links]) => <nav key={title} aria-label={`${title} footer links`}><h4>{title}</h4>{links.map(([label, to]) => <Link key={label} to={to}>{label}</Link>)}</nav>)}
      </div>
    </div>
    <div className="home-footer-legal">
      <p>{String.fromCharCode(169)} {new Date().getFullYear()} {settings?.siteName || "North Luxe Travels"}. All rights reserved.</p>
      <nav aria-label="Legal links"><Link to="/privacy">Privacy policy</Link><Link to="/terms">Terms & cancellation</Link></nav>
    </div>
  </footer>;
}
