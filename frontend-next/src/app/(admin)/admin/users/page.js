"use client";
import UserList from "@/admin/users/UserList";
import RequireRole from "@/components/auth/RequireRole";
export default function Page() { return <RequireRole roles={["Admin"]} fallback="/admin/content"><UserList /></RequireRole>; }
