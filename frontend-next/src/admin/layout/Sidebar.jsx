import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Dialog as RadixDialog } from "radix-ui";
import { Link } from "@/lib/router";
import { LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton, Tooltip } from "../ui";
import { adminNavItems } from "./navConfig";
import { useAuth } from "../../context/useAuth";
import { useNotifications } from "../../hooks/useCms";

const playAdminNotificationSound = async ({
  audioContextRef,
  audioUnlockedRef,
  force = false,
} = {}) => {
  if (typeof window === "undefined") return false;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return false;

  if (!audioContextRef.current) {
    audioContextRef.current = new AudioContextClass();
  }

  const context = audioContextRef.current;
  if (!context) return false;

  try {
    if (context.state === "suspended") {
      await context.resume();
    }

    if (audioUnlockedRef) {
      audioUnlockedRef.current = true;
    }

    if (!force && audioUnlockedRef && !audioUnlockedRef.current) {
      return false;
    }

    const playTone = (frequency, startTime, duration, gainValue) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(frequency, startTime);
      gainNode.gain.setValueAtTime(0.0001, startTime);
      gainNode.gain.exponentialRampToValueAtTime(gainValue, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      oscillator.start(startTime);
      oscillator.stop(startTime + duration + 0.03);
    };

    const now = context.currentTime;
    playTone(880, now, 0.2, 0.18);
    playTone(1174, now + 0.22, 0.22, 0.16);
    return true;
  } catch {
    return false;
  }
};

const NAV_GROUPS = [
  ["Operations", ["overview", "bookings", "contacts", "notifications"]],
  ["Website", ["tours", "gallery", "blogs", "testimonials", "content"]],
  ["Workspace", ["users", "settings"]],
];

const isItemActive = (item, pathname) => {
  if (item.path === "/admin") return pathname === "/admin";
  return [item.path, ...(item.matches || [])].some((path) => pathname === path || pathname?.startsWith(`${path}/`));
};

const NavItems = ({ items, pathname, collapsed, badgeCounts, onNavigate }) => (
  <nav aria-label="Admin navigation" className="admin-scroll flex-1 overflow-y-auto px-3 py-3">
    {NAV_GROUPS.map(([group, ids]) => {
      const groupItems = items.filter((item) => ids.includes(item.id));
      if (!groupItems.length) return null;
      return (
        <div key={group} className="mb-4 last:mb-0">
          {!collapsed && <p className="mb-1 px-2.5 text-xs font-medium text-subtle">{group}</p>}
          <ul className="grid gap-0.5">
            {groupItems.map((item) => {
              const active = isItemActive(item, pathname);
              const count = badgeCounts[item.id] || 0;
              const link = (
                <Link
                  to={item.path}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  aria-label={collapsed ? `${item.label}${count ? `, ${count} new` : ""}` : undefined}
                  className={cn(
                    "relative flex h-9 items-center gap-2.5 rounded-control px-2.5 text-sm font-medium transition-colors",
                    collapsed && "justify-center px-0",
                    active ? "bg-brand-50 text-brand-700" : "text-body hover:bg-canvas hover:text-navy-900",
                  )}
                >
                  <item.icon size={17} aria-hidden="true" className="shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {count > 0 &&
                    (collapsed ? (
                      <span aria-hidden="true" className="absolute right-2 top-1.5 h-2 w-2 rounded-full bg-brand ring-2 ring-surface" />
                    ) : (
                      <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1.5 text-xs font-bold leading-none text-white">
                        {count > 99 ? "99+" : count}
                      </span>
                    ))}
                </Link>
              );
              return <li key={item.id}>{collapsed ? <Tooltip content={item.label} side="right">{link}</Tooltip> : link}</li>;
            })}
          </ul>
        </div>
      );
    })}
  </nav>
);

const Brand = ({ collapsed }) => (
  <Link to="/" aria-label="Open the North Luxe website" className="flex h-16 shrink-0 items-center border-b border-line px-4">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src="/logo-dark-trim.png"
      alt="North Luxe"
      width={404}
      height={174}
      className={cn("h-8 w-auto dark:hidden", collapsed && "h-6")}
    />
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src="/logo-white-trim.png"
      alt=""
      aria-hidden="true"
      width={404}
      height={174}
      className={cn("hidden h-8 w-auto dark:block", collapsed && "h-6")}
    />
  </Link>
);

const SignOut = ({ collapsed, onLogout }) => (
  <div className="border-t border-line p-3">
    {collapsed ? (
      <IconButton label="Sign out" icon={LogOut} onClick={onLogout} variant="danger" className="mx-auto flex" />
    ) : (
      <button
        type="button"
        onClick={onLogout}
        className="flex h-9 w-full items-center gap-2.5 rounded-control px-2.5 text-sm font-medium text-body transition-colors hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40"
      >
        <LogOut size={17} aria-hidden="true" />
        Sign out
      </button>
    )}
  </div>
);

const Sidebar = ({ collapsed, mobileOpen, onCloseMobile }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const role = user?.role;
  const isAdmin = role === "Admin";

  const { data: notifications = [] } = useNotifications(isAdmin);

  const previousUnreadRef = useRef(null);
  const previousNotificationIdsRef = useRef(new Set());
  const audioContextRef = useRef(null);
  const audioUnlockedRef = useRef(false);

  useEffect(() => {
    if (!isAdmin || typeof window === "undefined") return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return undefined;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }

    const unlockAudio = async () => {
      const context = audioContextRef.current;
      if (!context) return;
      try {
        if (context.state === "suspended") {
          await context.resume();
        }
        if ("Notification" in window && Notification.permission === "default") {
          void Notification.requestPermission();
        }
        audioUnlockedRef.current = true;
      } catch {
        // ignore unlock issues
      }
    };

    window.addEventListener("pointerdown", unlockAudio, { passive: true });
    window.addEventListener("keydown", unlockAudio);

    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin || typeof window === "undefined") return;

    const unreadItems = notifications.filter((n) => !n?.isRead);
    const currentUnreadCount = unreadItems.length;
    const currentIds = new Set(
      unreadItems.map((item) => String(item?.id || "")),
    );

    if (previousUnreadRef.current === null) {
      previousUnreadRef.current = currentUnreadCount;
      previousNotificationIdsRef.current = currentIds;
      return;
    }

    const newItems = unreadItems.filter(
      (item) => !previousNotificationIdsRef.current.has(String(item?.id || "")),
    );

    if (newItems.length) {
      if (audioUnlockedRef.current) {
        void playAdminNotificationSound({ audioContextRef, audioUnlockedRef });
      }

      if ("Notification" in window && Notification.permission === "granted") {
        newItems.slice(0, 2).forEach((item) => {
          try {
            const notification = new Notification(
              item?.title || "New admin update",
              {
                body: item?.message || "A new update has arrived.",
                tag: `northluxe-${item?.id || Date.now()}`,
                renotify: true,
              },
            );
            notification.onclick = () => {
              window.focus();
              notification.close();
            };
          } catch {
            // ignore browser notification errors
          }
        });
      }
    }

    previousUnreadRef.current = currentUnreadCount;
    previousNotificationIdsRef.current = currentIds;
  }, [notifications, isAdmin]);

  const unreadNotifications = notifications.filter((n) => !n?.isRead);
  const unreadBookingAlerts = unreadNotifications.filter(
    (n) => String(n?.type || "") === "Bookings",
  ).length;
  const unreadContactAlerts = unreadNotifications.filter((n) => {
    const text = `${n?.title || ""} ${n?.message || ""}`.toLowerCase();
    return (
      String(n?.type || "") === "System" &&
      (text.includes("contact") || text.includes("inquiry"))
    );
  }).length;

  const badgeCounts = {
    overview: 0,
    bookings: unreadBookingAlerts,
    contacts: unreadContactAlerts,
    notifications: unreadNotifications.length,
  };
  const visibleNavItems = adminNavItems.filter((item) => !item.roles?.length || item.roles.includes(role));

  return (
    <>
      {/* Desktop: persistent, full height, collapsible to an icon rail */}
      <aside
        className={cn(
          "hidden shrink-0 self-stretch border-r border-line bg-surface transition-[width] duration-200 lg:block",
          collapsed ? "w-[72px]" : "w-60",
        )}
      >
        <div className="sticky top-0 flex h-dvh flex-col">
          <Brand collapsed={collapsed} />
          <NavItems items={visibleNavItems} pathname={pathname} collapsed={collapsed} badgeCounts={badgeCounts} />
          <SignOut collapsed={collapsed} onLogout={logout} />
        </div>
      </aside>

      {/* Phones/tablets: drawer with focus trap, Escape and a close button */}
      <RadixDialog.Root open={mobileOpen} onOpenChange={(open) => { if (!open) onCloseMobile(); }}>
        <RadixDialog.Portal>
          <RadixDialog.Overlay className="fixed inset-0 z-[60] bg-navy-950/40 lg:hidden" />
          <RadixDialog.Content className="admin-shell fixed inset-y-0 left-0 z-[61] flex w-72 max-w-[85vw] flex-col bg-surface shadow-pop outline-none lg:hidden">
            <RadixDialog.Title className="sr-only">Admin navigation</RadixDialog.Title>
            <RadixDialog.Description className="sr-only">Go to a section of the admin</RadixDialog.Description>
            <div className="relative">
              <Brand />
              <RadixDialog.Close asChild>
                <IconButton label="Close menu" icon={X} tooltip={false} className="absolute right-3 top-3.5" />
              </RadixDialog.Close>
            </div>
            <NavItems items={visibleNavItems} pathname={pathname} collapsed={false} badgeCounts={badgeCounts} onNavigate={onCloseMobile} />
            <SignOut collapsed={false} onLogout={logout} />
          </RadixDialog.Content>
        </RadixDialog.Portal>
      </RadixDialog.Root>
    </>
  );
};

export default Sidebar;
