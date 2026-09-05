"use client";
import ContentManagement from "@/admin/content/ContentManagement";
import DashboardHome from "@/admin/dashboard/DashboardHome";
import { useAuth } from "@/context/useAuth";
export default function Page() {
  const { user } = useAuth();
  return user?.role === "Editor" ? <ContentManagement fixedType="activity" /> : <DashboardHome />;
}
