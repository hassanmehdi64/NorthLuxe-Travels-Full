"use client";
import Notifications from "@/admin/notifications/Notifications";
import RequireRole from "@/components/auth/RequireRole";
export default function Page() { return <RequireRole roles={["Admin"]} fallback="/admin/content"><Notifications /></RequireRole>; }
