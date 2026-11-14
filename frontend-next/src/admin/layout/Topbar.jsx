"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@/lib/router";
import { Bell, Menu, Moon, PanelLeftClose, PanelLeftOpen, Search, Sun } from "lucide-react";
import ProfileDropdown from "../profile/ProfileDropdown";
import { useAdminBlogs, useBookings, useContacts, useGallery, useNotifications, useUsers } from "../../hooks/useCms";
import { useAuth } from "../../context/useAuth";
import { Badge, IconButton, Modal } from "../ui";

const SearchResults = ({ query, results, onOpen }) => {
  if (!query.trim()) return null;
  return results.length ? (
    <ul className="grid gap-0.5">
      {results.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => onOpen(item.route)}
            className="flex w-full items-center justify-between gap-3 rounded-control px-3 py-2.5 text-left transition-colors hover:bg-canvas focus-visible:bg-canvas"
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-navy-900">{item.title}</span>
              <span className="block truncate text-xs text-subtle">{item.subtitle}</span>
            </span>
            <Badge tone="neutral">{item.type}</Badge>
          </button>
        </li>
      ))}
    </ul>
  ) : (
    <div className="px-3 py-3">
      <p className="text-sm font-semibold text-navy-900">No matches</p>
      <p className="mt-0.5 text-xs text-subtle">Press Enter to search bookings for “{query.trim()}”.</p>
    </div>
  );
};

/** Top bar: sidebar control, global search, theme, notifications and account menu. */
const Topbar = ({ collapsed, onToggleCollapsed, onOpenMobileNav, theme, onToggleTheme }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const searchRef = useRef(null);
  const isDark = theme === "dark";
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const isAdmin = user?.role === "Admin";
  const { data: notifications = [] } = useNotifications(isAdmin);
  const { data: bookings = [] } = useBookings(isAdmin);
  const { data: blogs = [] } = useAdminBlogs();
  const { data: galleryItems = [] } = useGallery();
  const { data: users = [] } = useUsers(isAdmin);
  const { data: contacts = [] } = useContacts(isAdmin);
  const [globalQuery, setGlobalQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const globalResults = useMemo(() => {
    const query = globalQuery.trim().toLowerCase();
    if (!query) return [];

    const results = [];

    bookings.forEach((item) => {
      const haystack = [item.customer, item.bookingCode, item.tour, item.email, item.phone]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (haystack.includes(query)) {
        results.push({
          id: `booking-${item.id}`,
          title: item.customer || item.bookingCode || "Booking",
          subtitle: item.tour || item.bookingCode || "Booking result",
          route: `/admin/bookings?search=${encodeURIComponent(globalQuery.trim())}`,
          type: "Booking",
        });
      }
    });

    blogs.forEach((item) => {
      const haystack = [item.title, item.slug, item.author, item.status].filter(Boolean).join(" ").toLowerCase();
      if (haystack.includes(query)) {
        results.push({
          id: `blog-${item.id}`,
          title: item.title || "Blog",
          subtitle: item.author || item.status || "Blog post",
          route: `/admin/blogs?search=${encodeURIComponent(globalQuery.trim())}`,
          type: "Blog",
        });
      }
    });

    galleryItems.forEach((item) => {
      const haystack = [item.title, item.category, item.alt, item.status].filter(Boolean).join(" ").toLowerCase();
      if (haystack.includes(query)) {
        results.push({
          id: `gallery-${item.id}`,
          title: item.title || "Gallery item",
          subtitle: item.category || item.status || "Gallery",
          route: `/admin/gallery?search=${encodeURIComponent(globalQuery.trim())}`,
          type: "Gallery",
        });
      }
    });

    users.forEach((item) => {
      const haystack = [item.name, item.email, item.role, item.status].filter(Boolean).join(" ").toLowerCase();
      if (haystack.includes(query)) {
        results.push({
          id: `user-${item.id}`,
          title: item.name || "Team member",
          subtitle: item.email || item.role || "User",
          route: `/admin/users?search=${encodeURIComponent(globalQuery.trim())}`,
          type: "User",
        });
      }
    });

    contacts.forEach((item) => {
      const haystack = [item.sender, item.subject, item.email, item.message].filter(Boolean).join(" ").toLowerCase();
      if (haystack.includes(query)) {
        results.push({
          id: `contact-${item.id}`,
          title: item.sender || "Inquiry",
          subtitle: item.subject || item.email || "Inquiry",
          route: `/admin/contacts?search=${encodeURIComponent(globalQuery.trim())}`,
          type: "Inquiry",
        });
      }
    });

    return results.slice(0, 8);
  }, [blogs, bookings, contacts, galleryItems, globalQuery, users]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openResult = (route) => {
    navigate(route);
    setIsSearchOpen(false);
    setMobileSearchOpen(false);
  };

  const handleSearchSubmit = (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const query = globalQuery.trim();
    if (!query) return;
    if (globalResults[0]?.route) {
      openResult(globalResults[0].route);
      return;
    }
    navigate(`/admin/bookings?search=${encodeURIComponent(query)}`);
    setIsSearchOpen(false);
    setMobileSearchOpen(false);
  };

  const searchInput = (props) => (
    <div className="relative">
      <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
      <input
        type="search"
        value={globalQuery}
        onChange={(event) => {
          setGlobalQuery(event.target.value);
          setIsSearchOpen(Boolean(event.target.value.trim()));
        }}
        onFocus={() => setIsSearchOpen(Boolean(globalQuery.trim()))}
        onKeyDown={handleSearchSubmit}
        placeholder="Search bookings, inquiries, users…"
        aria-label="Search the admin"
        className="input h-9 border-line bg-canvas pl-9 focus:bg-surface"
        {...props}
      />
    </div>
  );

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b border-line bg-surface/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-surface/85 sm:px-6 lg:px-8">
      <IconButton label="Open menu" icon={Menu} onClick={onOpenMobileNav} className="lg:hidden" tooltip={false} />
      <IconButton
        label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        icon={collapsed ? PanelLeftOpen : PanelLeftClose}
        onClick={onToggleCollapsed}
        className="hidden lg:inline-grid"
      />

      <div ref={searchRef} className="relative hidden w-full max-w-md sm:block">
        {searchInput()}
        {isSearchOpen && (
          <div className="absolute inset-x-0 top-[calc(100%+6px)] z-50 rounded-card border border-line bg-surface p-1.5 shadow-pop">
            <SearchResults query={globalQuery} results={globalResults} onOpen={openResult} />
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-1">
        <IconButton label="Search" icon={Search} onClick={() => setMobileSearchOpen(true)} className="sm:hidden" />
        <IconButton label={isDark ? "Switch to light mode" : "Switch to dark mode"} icon={isDark ? Sun : Moon} onClick={onToggleTheme} />
        {isAdmin && (
          <IconButton
            label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"}
            icon={Bell}
            to="/admin/notifications"
            badge={unreadCount}
          />
        )}
        <span aria-hidden="true" className="mx-1.5 hidden h-6 w-px bg-line sm:block" />
        <ProfileDropdown />
      </div>

      <Modal open={mobileSearchOpen} onOpenChange={setMobileSearchOpen} title="Search the admin" size="md">
        {searchInput({ autoFocus: true })}
        <div className="mt-2">
          <SearchResults query={globalQuery} results={globalResults} onOpen={openResult} />
        </div>
      </Modal>
    </header>
  );
};

export default Topbar;
