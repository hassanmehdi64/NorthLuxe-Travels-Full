"use client";
import BookingDetails from "@/admin/bookings/BookingDetails";
import RequireRole from "@/components/auth/RequireRole";
export default function Page() { return <RequireRole roles={["Admin"]} fallback="/admin/content"><BookingDetails /></RequireRole>; }
