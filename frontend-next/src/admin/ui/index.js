/**
 * North Luxe admin UI kit. Every admin page builds from these; no page invents
 * its own buttons, inputs, badges, cards or dialogs.
 *
 * Rules:
 * - Colours/radii/shadows come from design tokens (bg-surface, bg-canvas, border-line,
 *   text-navy-900, text-body, text-subtle, text-brand-700, rounded-control/card/panel).
 *   Never bg-white / text-slate-* / hex colours: those break dark mode.
 * - Minimum text size 12px (text-xs). No uppercase+tracking labels.
 * - Icon-only buttons: <IconButton label="…"> (aria-label + tooltip).
 * - Destructive actions: await useConfirm()({ … }) with explicit labels.
 * - Create/edit forms: <Drawer> (or <Modal> for short ones), save button `loading`.
 */
export { Button } from "./Button";
export { IconButton } from "./IconButton";
export { Tooltip, TooltipProvider } from "./Tooltip";
export { Card, DetailList } from "./Card";
export { PageHeader } from "./PageHeader";
export { Badge, StatusBadge, statusTone } from "./Badge";
export { Field, Input, Select, Textarea, Checkbox } from "./Field";
export { Drawer, Modal } from "./Dialog";
export { ConfirmProvider, useConfirm } from "./ConfirmDialog";
export { ActionMenu, RowActions } from "./RowActions";
export { EmptyState, ErrorState, Skeleton, SkeletonRows } from "./Feedback";
export { Tabs, TabPanel, Switch } from "./Tabs";
