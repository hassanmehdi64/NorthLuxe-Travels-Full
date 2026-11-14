import { useState } from "react";
import { CheckCheck, Calendar, Inbox, Sparkles } from "lucide-react";
import { Button, Card, EmptyState, ErrorState, PageHeader, SkeletonRows, useConfirm } from "../ui";
import NotificationItem from "./NotificationItem";
import NotificationFilters from "./NotificationFilters";
import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useNotifications,
  useUpdateNotification,
} from "../../hooks/useCms";

const isRecentlyReceived = (value) => {
  if (!value) return false;
  const at = new Date(value).getTime();
  if (Number.isNaN(at)) return false;
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
  return Date.now() - at <= threeDaysMs;
};

const Notifications = () => {
  const [renderedAt] = useState(() => Date.now());
  const [activeFilter, setActiveFilter] = useState("All");
  const notificationsQuery = useNotifications();
  const notifications = notificationsQuery.data || [];
  const confirm = useConfirm();
  const updateNotification = useUpdateNotification();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();

  // Logic Handlers
  const handleMarkAsRead = async (id) => {
    await updateNotification.mutateAsync({ id, isRead: true });
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate();
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: "Delete this notification?",
      description: "It will be removed from the inbox. This cannot be undone.",
      confirmLabel: "Delete notification",
      cancelLabel: "Keep it",
    });
    if (ok) deleteNotification.mutate(id);
  };

  const filteredData = notifications
    .filter((n) => activeFilter === "All" || n.type === activeFilter)
    .sort((a, b) => {
      const unreadSort = Number(Boolean(a?.isRead)) - Number(Boolean(b?.isRead));
      if (unreadSort !== 0) return unreadSort;
      const aTime = new Date(a?.time || a?.createdAt || 0).getTime();
      const bTime = new Date(b?.time || b?.createdAt || 0).getTime();
      return bTime - aTime;
    });

  const unread = notifications.filter((n) => !n.isRead);
  const recent = notifications.filter((n) => isRecentlyReceived(n.time || n.createdAt));
  const counts = {
    All: unread.length,
    Bookings: unread.filter((n) => n.type === "Bookings").length,
    System: unread.filter((n) => n.type === "System").length,
  };

  const description = notificationsQuery.isLoading
    ? "Booking updates and system alerts."
    : `${unread.length} unread · ${recent.length} in the last 3 days`;

  let content;
  if (notificationsQuery.isLoading) {
    content = <SkeletonRows rows={5} />;
  } else if (notificationsQuery.isError && !notifications.length) {
    content = <ErrorState onRetry={() => notificationsQuery.refetch()} />;
  } else if (!filteredData.length) {
    content = (
      <EmptyState
        icon={Inbox}
        title="No notifications"
        description={activeFilter === "All" ? "You're all caught up." : `Nothing in ${activeFilter} right now.`}
      />
    );
  } else {
    content = (
      <ul className="divide-y divide-line">
        {filteredData.map((item) => {
          const typeStyles =
            item.type === "Bookings"
              ? { icon: <Calendar size={16} aria-hidden="true" />, color: "text-brand-700", bgColor: "bg-brand-50" }
              : { icon: <Sparkles size={16} aria-hidden="true" />, color: "text-subtle", bgColor: "bg-canvas" };
          return (
            <NotificationItem
              key={item.id}
              item={{
                ...item,
                ...typeStyles,
                time: new Date(item.time || item.createdAt || renderedAt).toLocaleString(),
                isLatest: isRecentlyReceived(item.time || item.createdAt),
              }}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          );
        })}
      </ul>
    );
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        description={description}
        actions={
          <Button
            size="sm"
            icon={CheckCheck}
            onClick={handleMarkAllRead}
            loading={markAllRead.isPending}
            disabled={!unread.length}
          >
            Mark all read
          </Button>
        }
      />

      <NotificationFilters
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        counts={counts}
      />

      <Card flush>{content}</Card>
    </div>
  );
};

export default Notifications;
