import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "@/lib/router";
import { Eye, Inbox, Search, Trash2 } from "lucide-react";
import MessageDetail from "./MessageDetail";
import {
  useContacts,
  useDeleteContact,
  useReplyContact,
  useUpdateContact,
  useNotifications,
  useUpdateNotification,
} from "../../hooks/useCms";
import { useToast } from "../../context/ToastContext";
import { getApiErrorMessage } from "../../lib/apiError";
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  RowActions,
  Select,
  SkeletonRows,
  StatusBadge,
  useConfirm,
} from "../ui";

const isRecentlyReceived = (value) => {
  if (!value) return false;
  const at = new Date(value).getTime();
  if (Number.isNaN(at)) return false;
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
  return Date.now() - at <= threeDaysMs;
};

const receivedAt = (msg) => msg?.date || msg?.createdAt;

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
};

const statusOf = (msg) => msg?.status || "Unread";

const ContactMessages = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const { data: messages = [], isLoading, isError, refetch } = useContacts();
  const { data: notifications = [] } = useNotifications();
  const deleteContact = useDeleteContact();
  const updateContact = useUpdateContact();
  const replyContact = useReplyContact();
  const updateNotification = useUpdateNotification();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(() => searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyError, setReplyError] = useState("");

  useEffect(() => {
    const next = searchParams.get("search") || "";
    setSearchTerm((current) => (current === next ? current : next));
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (searchTerm.trim()) params.set("search", searchTerm.trim());
    else params.delete("search");
    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [searchParams, searchTerm, setSearchParams]);

  // --- HANDLERS ---
  const deleteMessage = async (id) => {
    const ok = await confirm({
      title: "Delete inquiry?",
      description: "This will permanently remove this inquiry.",
      confirmLabel: "Delete inquiry",
      cancelLabel: "Keep inquiry",
    });
    if (!ok) return;
    deleteContact.mutate(id, {
      onSuccess: () => {
        toast.success("Deleted", "Inquiry removed successfully.");
        if (selectedMessage?.id === id) setSelectedMessage(null);
      },
    });
  };

  const markAsStatus = (id, newStatus) => {
    updateContact.mutate({ id, status: newStatus });
    if (selectedMessage?.id === id) {
      setSelectedMessage((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const sendReply = (id, reply, { onSuccess } = {}) => {
    setReplyError("");
    replyContact.mutate(
      { id, message: reply },
      {
        onSuccess: (item) => {
          if (item) setSelectedMessage((prev) => (prev?.id === id ? { ...prev, ...item } : prev));
          onSuccess?.();
        },
        onError: (error) => {
          setReplyError(getApiErrorMessage(error, "The reply could not be saved. Please try again."));
        },
      },
    );
  };

  const searchedMessages = messages
    .filter((m) => {
      const subject = String(m.subject || "").toLowerCase();
      const isCustomPlan = subject.includes("custom tour plan request") || subject.includes("custom plan");
      if (isCustomPlan) return false;

      const query = searchTerm.toLowerCase();
      return [m.sender, m.subject, m.email, m.message, m.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    })
    .sort((a, b) => {
      const aTime = new Date(a?.date || a?.createdAt || 0).getTime();
      const bTime = new Date(b?.date || b?.createdAt || 0).getTime();
      return bTime - aTime;
    });

  const statusOptions = useMemo(
    () => Array.from(new Set(messages.map(statusOf))).sort(),
    [messages],
  );

  const filteredMessages =
    statusFilter === "all" ? searchedMessages : searchedMessages.filter((m) => statusOf(m) === statusFilter);

  const openMessage = (msg) => {
    setReplyError("");
    setSelectedMessage(msg);
    const status = String(msg?.status || "").toLowerCase();
    if (status === "unread" || status === "new" || !status) {
      markAsStatus(msg.id, "Read");
    }
  };

  useEffect(() => {
    const unreadContactAlerts = notifications.filter((n) => {
      if (n?.isRead) return false;
      const text = `${n?.title || ""} ${n?.message || ""}`.toLowerCase();
      return String(n?.type || "") === "System" && (text.includes("contact") || text.includes("inquiry"));
    });

    if (!unreadContactAlerts.length) return;

    unreadContactAlerts.forEach((n) => {
      updateNotification.mutate({ id: n.id, isRead: true });
    });
  }, [notifications, updateNotification]);

  const rowActions = (msg) => [
    { label: "Open inquiry", icon: Eye, onClick: () => openMessage(msg) },
    { label: "Delete inquiry", icon: Trash2, danger: true, onClick: () => deleteMessage(msg.id) },
  ];

  const isFiltered = Boolean(searchTerm.trim()) || statusFilter !== "all";

  const renderBody = () => {
    if (isLoading) return <SkeletonRows rows={6} />;
    if (isError) return <ErrorState description="Inquiries could not be loaded." onRetry={() => refetch()} />;
    if (!filteredMessages.length) {
      return (
        <EmptyState
          icon={Inbox}
          title={isFiltered ? "No inquiries match your filters" : "No inquiries yet"}
          description={isFiltered ? "Try a different search or status." : "Messages sent from the contact form will appear here."}
        />
      );
    }

    return (
      <>
        {/* Phones: stacked list */}
        <ul className="divide-y divide-line md:hidden">
          {filteredMessages.map((msg) => (
            <li key={msg.id} className="flex items-start gap-2 px-4 py-3">
              <button
                type="button"
                onClick={() => openMessage(msg)}
                className="min-w-0 flex-1 rounded-control text-left"
              >
                <span className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-navy-900">{msg.sender || "Guest"}</span>
                  <span className="ml-auto shrink-0 text-xs text-subtle">{formatDate(receivedAt(msg))}</span>
                </span>
                <span className="mt-0.5 block truncate text-[13px] text-body">{msg.subject || "No subject"}</span>
                <span className="mt-2 flex flex-wrap gap-1.5">
                  <StatusBadge status={statusOf(msg)} />
                  {isRecentlyReceived(receivedAt(msg)) && <Badge tone="brand">New</Badge>}
                </span>
              </button>
              <RowActions actions={rowActions(msg)} />
            </li>
          ))}
        </ul>

        {/* Desktop: table */}
        <div className="admin-table-wrap hidden md:block">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Subject</th>
                <th scope="col">Received</th>
                <th scope="col">Status</th>
                <th scope="col" className="w-24"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {filteredMessages.map((msg) => (
                <tr
                  key={msg.id}
                  onClick={() => openMessage(msg)}
                  className={selectedMessage?.id === msg.id ? "cursor-pointer bg-canvas" : "cursor-pointer"}
                >
                  <td className="max-w-56">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        openMessage(msg);
                      }}
                      className="cell-primary block max-w-full truncate rounded-control text-left hover:text-brand-700"
                    >
                      {msg.sender || "Guest"}
                    </button>
                    {msg.email && <span className="block truncate text-xs text-subtle">{msg.email}</span>}
                  </td>
                  <td className="max-w-80">
                    <span className="block truncate">{msg.subject || "No subject"}</span>
                  </td>
                  <td className="whitespace-nowrap">{formatDate(receivedAt(msg))}</td>
                  <td>
                    <span className="flex flex-wrap gap-1.5">
                      <StatusBadge status={statusOf(msg)} />
                      {isRecentlyReceived(receivedAt(msg)) && <Badge tone="brand">New</Badge>}
                    </span>
                  </td>
                  <td onClick={(event) => event.stopPropagation()}>
                    <RowActions actions={rowActions(msg)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  return (
    <div>
      <PageHeader title="Inquiries" description="Messages sent through the website contact form." />

      <Card flush>
        <div className="flex flex-col gap-2 border-b border-line p-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search size={15} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
            <Input
              type="search"
              aria-label="Search inquiries"
              placeholder="Search by name, email or subject"
              className="w-full pl-9"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <Select
            aria-label="Filter by status"
            className="sm:w-44"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </Select>
        </div>
        {renderBody()}
      </Card>

      <MessageDetail
        message={selectedMessage}
        onClose={() => setSelectedMessage(null)}
        onDelete={deleteMessage}
        onStatusChange={markAsStatus}
        onReply={sendReply}
        isReplying={replyContact.isPending}
        replyError={replyError}
        onReplyErrorClear={() => setReplyError("")}
      />
    </div>
  );
};

export default ContactMessages;
