import { Tabs } from "../ui";

const TABS = ["All", "Bookings", "System"];

/** Filter tabs. The count on each tab is its number of unread notifications. */
const NotificationFilters = ({ activeFilter, setActiveFilter, counts }) => (
  <Tabs
    ariaLabel="Filter notifications"
    value={activeFilter}
    onValueChange={setActiveFilter}
    items={TABS.map((tab) => ({ value: tab, label: tab, count: counts[tab] || undefined }))}
  />
);

export default NotificationFilters;
