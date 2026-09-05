import { createElement, useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "@/lib/router";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { getCart, getWishlist } from "../../features/commerce/storage";
import { useSettings } from "../../hooks/useCms";
import { getLogoUrl, getNavbarColors } from "../../lib/siteTheme";

const splitBrandName = (name) => {
  const parts = String(name || "North Luxe Travels").trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return { main: parts[0] || "North Luxe", accent: "" };
  return { main: parts.slice(0, -1).join(" "), accent: parts[parts.length - 1] };
};

const BrandMark = ({ settings, navColors, compact = false, onClick }) => {
  const siteName = settings?.siteName || "North Luxe Travels";
  const brand = splitBrandName(siteName);
  const logoUrl = getLogoUrl(settings);

  return (
    <Link
      to="/"
      onClick={onClick}
      className={`flex min-w-0 shrink items-center gap-2 whitespace-nowrap font-black tracking-tight text-[var(--nav-text)] ${
        compact ? "text-sm" : "text-[15px] sm:text-lg"
      }`}
      style={{ color: navColors.text }}
      aria-label={siteName}>
      {logoUrl ? (
        <span
          className={`inline-flex shrink-0 items-center justify-center overflow-hidden ${
            compact ? "h-12 w-[132px]" : "h-12 w-[132px] sm:h-14 sm:w-[152px]"
          }`}>
          {/* CMS logos can come from dynamically configured external hosts. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt={siteName}
            decoding="async"
            fetchPriority="high"
            className="h-full w-full scale-[1.12] object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
          />
        </span>
      ) : (
        <span className="rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2">
          <span className="text-white">{brand.main}</span>{" "}
          {brand.accent ? (
            <span className="text-[var(--c-brand)]">{brand.accent}</span>
          ) : null}
        </span>
      )}
    </Link>
  );
};

const ActionLink = ({ to, icon, label, count = 0, className = "", grouped = false }) => (
  <Link
    to={to}
    className={`ql-btn-icon group relative h-9 w-9 rounded-lg text-white shadow-none transition-colors duration-150 hover:shadow-none [--btn-icon-text:#ffffff] [--btn-icon-hover-bg:rgba(255,255,255,0.06)] [--btn-icon-hover-text:#ffffff] [--btn-icon-hover-border:rgba(255,255,255,0.16)] sm:h-10 sm:w-10 ${
      grouped
        ? "[--btn-icon-bg:transparent] [--btn-icon-border:transparent]"
        : "[--btn-icon-bg:rgba(255,255,255,0.035)] [--btn-icon-border:rgba(255,255,255,0.15)]"
    } ${className}`}
    aria-label={label}
    title={label}>
    {createElement(icon, {
      size: 15,
    })}
    {count > 0 && (
      <span className="absolute -right-1.5 -top-1.5 h-4 min-w-4 rounded-full bg-[var(--c-brand)] px-1 text-center text-[10px] font-black leading-4 text-white">
        {count > 9 ? "9+" : count}
      </span>
    )}
  </Link>
);

const QuickLink = ({ to, icon, label, count = 0, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="relative flex h-11 min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg border border-white/10 bg-white/[0.035] px-1 text-center text-[9px] font-semibold leading-none text-white transition-colors duration-200 focus-visible:border-[var(--nav-active)] focus-visible:outline-none">
    <span className="grid h-4 w-4 shrink-0 place-items-center text-[var(--nav-active)]">
      {createElement(icon, { size: 12 })}
    </span>
    <span className="max-w-full truncate">{label}</span>
    {count > 0 && (
      <span className="absolute right-1 top-1 min-w-3.5 rounded-full bg-[var(--c-brand)] px-1 text-center text-[8px] font-bold leading-3.5 text-white">
        {count > 9 ? "9+" : count}
      </span>
    )}
  </Link>
);

const Navbar = () => {
  const { data: settings } = useSettings(true);
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  const menuItems = useMemo(
    () => [
      { name: "Home", href: "/" },
      { name: "Tours", href: "/tours" },
      { name: "Destinations", href: "/destinations" },
      { name: "Activities", href: "/activities" },
      { name: "Services", href: "/services" },
      { name: "About", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Contact", href: "/contact" },
    ],
    [],
  );

  useEffect(() => {
    const syncCounts = () => {
      setWishlistCount(getWishlist().length);
      setCartCount(getCart().length);
    };

    syncCounts();
    window.addEventListener("storage", syncCounts);
    window.addEventListener("ql-cart-updated", syncCounts);
    window.addEventListener("ql-wishlist-updated", syncCounts);

    return () => {
      window.removeEventListener("storage", syncCounts);
      window.removeEventListener("ql-cart-updated", syncCounts);
      window.removeEventListener("ql-wishlist-updated", syncCounts);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    const closeAtDesktop = () => {
      if (window.innerWidth >= 1280) setIsOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeAtDesktop);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeAtDesktop);
    };
  }, [isOpen]);

  const handleLinkClick = () => setIsOpen(false);
  const navColors = getNavbarColors(settings);
  const navbarBackground = isScrolled ? navColors.scrolled : navColors.main;
  const drawerBackground = navColors.mobile || navbarBackground;
  const navStyleVars = {
    "--nav-bg": navbarBackground,
    "--nav-text": navColors.text,
    "--nav-muted": navColors.mutedText,
    "--nav-active": navColors.activeText,
  };

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-300 ${
          isScrolled
            ? "border-white/15 shadow-[0_10px_30px_rgba(2,8,23,0.2)] backdrop-blur-xl"
            : "border-white/10 backdrop-blur-md"
        }`}
        style={{ ...navStyleVars, background: navbarBackground }}>
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <div className="flex h-15 items-center justify-between gap-2.5 sm:h-16 sm:gap-4">
            <div className="flex min-w-0 flex-1 items-center">
              <BrandMark settings={settings} navColors={navColors} />
            </div>

            <div className="hidden flex-[2] items-center justify-center gap-0.5 xl:flex">
              {menuItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group relative inline-flex h-9 items-center justify-center px-3 text-[13px] font-semibold leading-none transition-colors duration-200 ${
                      isActive
                        ? "text-[var(--nav-active)] [&>span]:scale-x-100"
                        : "text-[var(--nav-text)] hover:text-[var(--nav-active)]"
                    }`
                  }>
                  {item.name}
                  <span className="pointer-events-none absolute inset-x-3 bottom-0 h-[2px] origin-center scale-x-0 rounded-full bg-[var(--c-brand)] transition-transform duration-200" />
                </NavLink>
              ))}
            </div>

            <div className="hidden flex-1 items-center justify-end xl:flex">
              <div className="flex items-center gap-0.5 rounded-xl border border-white/10 bg-white/[0.035] p-0.5">
                <ActionLink to="/search" icon={Search} label="Search Tours" grouped />
                <ActionLink
                  to="/wishlist"
                  icon={Heart}
                  label="Wishlist"
                  count={wishlistCount}
                  grouped
                />
                <ActionLink
                  to="/cart"
                  icon={ShoppingBag}
                  label="Cart"
                  count={cartCount}
                  grouped
                />
              </div>
            </div>

            <div className="flex items-center gap-2 xl:hidden">
              <button
                onClick={() => setIsOpen((prev) => !prev)}
                className={`ql-btn-icon group h-9 w-9 shrink-0 rounded-lg shadow-none transition-colors duration-150 hover:shadow-none [--btn-icon-bg:rgba(255,255,255,0.035)] [--btn-icon-text:#ffffff] [--btn-icon-hover-bg:rgba(255,255,255,0.06)] [--btn-icon-hover-text:#ffffff] sm:h-10 sm:w-10 ${
                  isOpen
                    ? "[--btn-icon-border:rgba(32,183,122,0.7)] [--btn-icon-bg:rgba(255,255,255,0.1)]"
                    : "[--btn-icon-border:rgba(255,255,255,0.16)] [--btn-icon-hover-border:rgba(255,255,255,0.24)]"
                }`}
                aria-label={isOpen ? "Close menu" : "Open menu"}
                aria-expanded={isOpen}
                aria-controls="mobile-navbar-drawer">
                {isOpen ? <X size={17} /> : <Menu size={17} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-40 bg-[rgba(2,8,23,0.5)] backdrop-blur-[2px] transition-opacity duration-300 xl:hidden ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <div
        id="mobile-navbar-drawer"
        className={`fixed bottom-0 right-0 top-0 z-50 w-[min(90vw,330px)] overflow-hidden border-l border-white/10 shadow-[-18px_0_45px_rgba(2,8,23,0.28)] transition-[transform,opacity] duration-300 ease-out xl:hidden ${
          isOpen
            ? "pointer-events-auto translate-x-0 opacity-100"
            : "pointer-events-none translate-x-full opacity-0"
        }`}
        style={{ ...navStyleVars, background: drawerBackground }}
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}>
        <div className="flex h-full flex-col overflow-hidden">
          <div className="flex h-15 shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 sm:h-16 sm:px-5">
            <BrandMark
              settings={settings}
              navColors={navColors}
              compact
              onClick={handleLinkClick}
            />
            <button
              onClick={() => setIsOpen(false)}
              className="ql-btn-icon group h-9 w-9 shrink-0 rounded-lg text-white shadow-none transition-colors duration-150 hover:shadow-none [--btn-icon-bg:rgba(255,255,255,0.06)] [--btn-icon-text:#ffffff] [--btn-icon-border:rgba(255,255,255,0.16)] [--btn-icon-hover-bg:rgba(255,255,255,0.1)] [--btn-icon-hover-text:#ffffff] [--btn-icon-hover-border:rgba(255,255,255,0.24)]"
              aria-label="Close menu">
              <X size={17} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `flex min-h-9 items-center rounded-lg border px-3 py-2 text-[13px] font-semibold transition-colors duration-200 ${
                      isActive
                        ? "border-white/10 bg-white/[0.09] text-[var(--nav-active)]"
                        : "border-transparent text-[var(--nav-text)] hover:text-[var(--nav-active)]"
                    }`
                  }>
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </div>

            <div className="mt-4 border-t border-white/10 pt-3">
              <p className="mb-2 flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.16em] text-[var(--nav-muted)] opacity-70">
                <span className="h-px w-4 bg-[var(--nav-active)]" />
                Quick Links
              </p>

              <div className="grid grid-cols-3 gap-1.5">
                <QuickLink
                  to="/search"
                  icon={Search}
                  label="Search"
                  onClick={handleLinkClick}
                />

                <QuickLink
                  to="/wishlist"
                  icon={Heart}
                  label="Wishlist"
                  count={wishlistCount}
                  onClick={handleLinkClick}
                />

                <QuickLink
                  to="/cart"
                  icon={ShoppingBag}
                  label="Cart"
                  count={cartCount}
                  onClick={handleLinkClick}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
