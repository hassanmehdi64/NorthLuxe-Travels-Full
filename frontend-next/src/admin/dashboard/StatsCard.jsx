import { Card, Skeleton } from "../ui";

/** Compact KPI tile: label, value, optional hint. Shows a skeleton while loading. */
const StatsCard = ({ title, value, hint, loading = false }) => (
  <Card as="article" bodyClassName="p-4 sm:p-4">
    <p className="text-[13px] font-medium text-subtle">{title}</p>
    {loading ? (
      <Skeleton className="mt-2 h-7 w-24" />
    ) : (
      <p className="mt-1 truncate text-2xl font-bold leading-tight text-navy-900">{value}</p>
    )}
    {hint && <p className="mt-1 text-xs text-subtle">{hint}</p>}
  </Card>
);

export default StatsCard;
