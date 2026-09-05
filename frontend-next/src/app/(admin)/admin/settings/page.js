"use client";
import SiteSettings from "@/admin/settings/SiteSettings";
import RequireRole from "@/components/auth/RequireRole";
export default function Page() { return <RequireRole roles={["Admin"]} fallback="/admin/content"><SiteSettings /></RequireRole>; }
