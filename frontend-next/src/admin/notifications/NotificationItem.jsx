import { useNavigate } from "@/lib/router";
import { ArrowRight, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge, Button, RowActions } from "../ui";

const NotificationItem = ({ item, onMarkAsRead, onDelete }) => {
  const navigate = useNavigate();

  // Dynamic Navigation based on type
  const handleViewDetails = async () => {
    const text = `${item?.title || ""} ${item?.message || ""}`.toLowerCase();
    const routes = {
      Bookings: `/admin/bookings`,
      User: `/admin/users`,
    };

    let target = routes[item.type] || "/admin";
    if (item.type === "System") {
      if (text.includes("contact") || text.includes("inquiry")) target = "/admin/contacts";
      else target = "/admin/settings";
    }

    if (!item.isRead) {
      try {
        await onMarkAsRead(item.id);
      } catch {
        // Allow navigation even if mark-read fails.
      }
    }

    navigate(target);
  };

  return (
    <li className="flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-canvas sm:gap-4 sm:px-5">
      <span className={cn("relative grid h-9 w-9 shrink-0 place-items-center rounded-full", item.bgColor, item.color)}>
        {item.icon}
        {!item.isRead && (
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-brand ring-2 ring-surface">
            <span className="sr-only">Unread</span>
          </span>
        )}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className={cn("text-sm leading-snug", item.isRead ? "font-medium text-body" : "font-semibold text-navy-900")}>
            {item.title}
          </h3>
          <Badge>{item.type}</Badge>
          {item.isLatest && <Badge tone="brand">New</Badge>}
        </div>
        {item.message && <p className="mt-1 text-[13px] leading-relaxed text-subtle">{item.message}</p>}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-xs text-subtle">{item.time}</span>
          <Button variant="ghost" size="sm" iconRight={ArrowRight} onClick={handleViewDetails} className="-ml-2 sm:ml-0">
            View details
          </Button>
        </div>
      </div>

      <RowActions
        className="shrink-0"
        actions={[
          { label: "Mark as read", icon: Check, onClick: () => onMarkAsRead(item.id), hidden: item.isRead },
          { label: "Delete notification", icon: Trash2, onClick: () => onDelete(item.id), danger: true },
        ]}
      />
    </li>
  );
};

export default NotificationItem;
