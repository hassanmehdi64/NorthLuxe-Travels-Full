import React from "react";
import { getUserAvatar } from "../utils/userAvatar";
import { Badge, RowActions, StatusBadge } from "../ui";

export const formatLastLogin = (value) => {
  if (!value) return "Never";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Never" : date.toLocaleString();
};

export const UserAvatar = ({ user, size = "h-9 w-9" }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={getUserAvatar(user)} alt="" className={`${size} shrink-0 rounded-full object-cover`} />
);

export const RoleBadge = ({ role }) => (
  <Badge tone={role === "Admin" ? "brand" : "neutral"}>{role || "Editor"}</Badge>
);

/** Compact user row used in the phone layout of the team list. */
const UserCard = ({ user, actions }) => (
  <li className="flex items-start gap-3 px-4 py-3">
    <UserAvatar user={user} size="h-10 w-10" />
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-navy-900">{user.name}</p>
      <p className="truncate text-xs text-subtle">{user.email}</p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <RoleBadge role={user.role} />
        <StatusBadge status={user.status} />
      </div>
      <p className="mt-1.5 text-xs text-subtle">Last login: {formatLastLogin(user.lastLoginAt)}</p>
    </div>
    <RowActions actions={actions} />
  </li>
);

export default UserCard;
