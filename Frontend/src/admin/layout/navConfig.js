import {
  LayoutDashboard,
  Briefcase,
  Compass,
  Image,
  BookOpen,
  Star,
  Users,
  MessageSquare,
  Bell,
  Settings,
} from "lucide-react";

export const adminNavItems = [
  { id: "overview", label: "Overview", path: "/admin", icon: LayoutDashboard },
  {
    id: "bookings",
    label: "Bookings",
    path: "/admin/bookings",
    icon: Briefcase,
  },
  { id: "tours", label: "Tours", path: "/admin/tours", icon: Compass },
  { id: "gallery", label: "Gallery", path: "/admin/gallery", icon: Image },
  { id: "blogs", label: "Blogs", path: "/admin/blogs", icon: BookOpen },
  { id: "testimonials", label: "Testimonials", path: "/admin/testimonials", icon: Star },
  { id: "users", label: "Users", path: "/admin/users", icon: Users },
  {
    id: "contacts",
    label: "Inquiries",
    path: "/admin/contacts",
    icon: MessageSquare,
  },
  {
    id: "notifications",
    label: "Notifications",
    path: "/admin/notifications",
    icon: Bell,
  },
  {
    id: "settings",
    label: "Settings",
    path: "/admin/settings",
    icon: Settings,
  },
];
