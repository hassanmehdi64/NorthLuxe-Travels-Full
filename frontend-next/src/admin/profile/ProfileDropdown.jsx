"use client";

import { DropdownMenu } from "radix-ui";
import { ChevronDown, History, LogOut, Settings, User } from "lucide-react";
import { useNavigate } from "@/lib/router";
import { useAuth } from "../../context/useAuth";
import { getUserAvatar } from "../utils/userAvatar";

const MENU_ITEMS = [
  { label: "My profile", icon: User, path: "/admin/profile/MyProfile" },
  { label: "Account settings", icon: Settings, path: "/admin/profile/AccountSettings" },
  { label: "Activity log", icon: History, path: "/admin/profile/ActivityLog" },
];

const itemClass =
  "flex cursor-pointer select-none items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-navy-900 outline-none data-[highlighted]:bg-canvas";

/** Account menu in the top bar. */
const ProfileDropdown = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger
        aria-label="Account menu"
        className="flex items-center gap-2 rounded-control py-1 pl-1 pr-1.5 transition-colors hover:bg-canvas data-[state=open]:bg-canvas"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={getUserAvatar(user)} alt="" className="h-8 w-8 rounded-full object-cover" />
        <span className="hidden text-left leading-tight md:block">
          <span className="block max-w-36 truncate text-[13px] font-semibold text-navy-900">{user?.name || "Admin"}</span>
          <span className="block text-xs text-subtle">{user?.role || "Admin"}</span>
        </span>
        <ChevronDown size={15} aria-hidden="true" className="hidden text-subtle md:block" />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={8} className="admin-shell z-[80] w-60 rounded-card border border-line bg-surface p-1 shadow-pop">
          <div className="px-2.5 py-2">
            <p className="text-xs text-subtle">Signed in as</p>
            <p className="truncate text-sm font-semibold text-navy-900">{user?.email || "—"}</p>
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-line" />
          {MENU_ITEMS.map(({ label, icon: Icon, path }) => (
            <DropdownMenu.Item key={path} onSelect={() => navigate(path)} className={itemClass}>
              <Icon size={15} aria-hidden="true" className="text-subtle" />
              {label}
            </DropdownMenu.Item>
          ))}
          <DropdownMenu.Separator className="my-1 h-px bg-line" />
          <DropdownMenu.Item onSelect={handleLogout} className={`${itemClass} text-red-700 dark:text-red-400`}>
            <LogOut size={15} aria-hidden="true" />
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default ProfileDropdown;
