"use client";
import AdminLayout from "@/admin/layout/AdminLayout";
import RequireAdminAuth from "@/components/auth/RequireAdminAuth";
export default function Layout({ children }) {
  return <RequireAdminAuth><AdminLayout>{children}</AdminLayout></RequireAdminAuth>;
}
