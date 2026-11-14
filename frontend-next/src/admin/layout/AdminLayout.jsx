"use client";

import { useEffect, useState } from "react";
import { useLocation } from "@/lib/router";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { ConfirmProvider, TooltipProvider } from "../ui";
import "../../styles/admin.css";
import "../../styles/ui-consistency.css";

const readPreference = (key, fallback) => {
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};

const writePreference = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable (private mode) — preference just isn't remembered */
  }
};

const AdminLayout = ({ children }) => {
  // Server and first client render use the same defaults; stored preferences are
  // applied after mount, so there is no hydration mismatch.
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState("light");
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setCollapsed(readPreference("admin-sidebar-collapsed", "false") === "true");
    setTheme(readPreference("admin-theme", "light") === "dark" ? "dark" : "light");
    setPrefsLoaded(true);
  }, []);

  useEffect(() => {
    if (prefsLoaded) writePreference("admin-sidebar-collapsed", String(collapsed));
  }, [collapsed, prefsLoaded]);

  // Dark mode lives on <body> only while the admin is mounted (portaled dialogs and
  // menus need it too) and is removed on leave, so it never leaks to the public site.
  useEffect(() => {
    if (!prefsLoaded) return undefined;
    writePreference("admin-theme", theme);
    document.body.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.remove("dark");
    return () => document.body.classList.remove("dark");
  }, [theme, prefsLoaded]);

  useEffect(() => setMobileNavOpen(false), [location.pathname]);

  return (
    <TooltipProvider>
      <ConfirmProvider>
        <div className={`admin-shell flex min-h-dvh ${theme === "dark" ? "dark" : ""}`}>
          <Sidebar
            collapsed={collapsed}
            mobileOpen={mobileNavOpen}
            onCloseMobile={() => setMobileNavOpen(false)}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar
              collapsed={collapsed}
              onToggleCollapsed={() => setCollapsed((value) => !value)}
              onOpenMobileNav={() => setMobileNavOpen(true)}
              theme={theme}
              onToggleTheme={() => setTheme((value) => (value === "dark" ? "light" : "dark"))}
            />
            <main id="admin-main" className="flex-1 px-4 pb-10 pt-5 sm:px-6 lg:px-8 lg:pt-6">
              <div className="mx-auto w-full max-w-[1320px]">{children}</div>
            </main>
          </div>
        </div>
      </ConfirmProvider>
    </TooltipProvider>
  );
};

export default AdminLayout;
