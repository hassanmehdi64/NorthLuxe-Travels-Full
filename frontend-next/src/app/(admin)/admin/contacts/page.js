"use client";
import ContactMessages from "@/admin/contact/ContactMessages";
import RequireRole from "@/components/auth/RequireRole";
export default function Page() { return <RequireRole roles={["Admin"]} fallback="/admin/content"><ContactMessages /></RequireRole>; }
