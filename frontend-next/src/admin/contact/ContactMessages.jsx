import React, { useEffect, useState } from "react";
import { useSearchParams } from "@/lib/router";
import {
  Mail,
  MessageSquare,
  Search,
  Trash2,
  CheckCircle2,
  Clock,
  Filter,
  User,
  Archive,
  Inbox,
} from "lucide-react";
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

const isRecentlyReceived = (value) => {
  if (!value) return false;
  const at = new Date(value).getTime();
  if (Number.isNaN(at)) return false;
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
  return Date.now() - at <= threeDaysMs;
};

const ContactMessages = () => {
  const toast = useToast();
  const { data: messages = [] } = useContacts();
  const { data: notifications = [] } = useNotifications();
  const deleteContact = useDeleteContact();
  const updateContact = useUpdateContact();
  const replyContact = useReplyContact();
  const updateNotification = useUpdateNotification();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(() => searchParams.get("search") || "");
  const [selectedMessage, setSelectedMessage] = useState(null);

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
  const deleteMessage = (id) => {
    toast.confirm(
      "Delete Message?",
      "This will permanently remove this inquiry.",
      () =>
        deleteContact.mutate(id, {
          onSuccess: () => {
            toast.success("Deleted", "Inquiry removed successfully.");
            if (selectedMessage?.id === id) setSelectedMessage(null);
          },
        }),
      {
        confirmLabel: "Delete",
        tone: "danger",
      },
    );
  };

  const markAsStatus = (id, newStatus) => {
    updateContact.mutate({ id, status: newStatus });
    if (selectedMessage?.id === id) {
      setSelectedMessage((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const filteredMessages = messages
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

  const openMessage = (msg) => {
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

  return (
    <div className="admin-inbox">
      <div className={`inbox-list ${selectedMessage ? "is-selected" : ""}`}>
        <div className="inbox-heading"><Inbox size={18} /><h1 className="admin-page-title">Inbox</h1></div>
        <input type="search" aria-label="Search inquiries" placeholder="Search inquiries" className="inbox-search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
        {filteredMessages.map((msg) => <button type="button" key={msg.id} onClick={() => openMessage(msg)} className="brand-card inbox-message-card" data-selected={selectedMessage?.id === msg.id}>
          <div className="inbox-message-heading"><span>{msg.sender || "Guest"}</span><time>{new Date(msg.date || msg.createdAt).toLocaleDateString()}</time></div>
          <h3 className="truncate">{msg.subject}</h3>
          <p className="line-clamp-2">{msg.message}</p>
          <span className="admin-soft-badge admin-soft-badge-muted mt-2">{msg.status || "Unread"}</span>
          {isRecentlyReceived(msg.date || msg.createdAt) && <span className="admin-soft-badge admin-soft-badge-primary ml-2">New</span>}
        </button>)}
        {!filteredMessages.length && <div className="brand-card inbox-empty">No inquiries match your search.</div>}
      </div>
      <div className={`inbox-detail ${!selectedMessage ? "is-empty" : ""}`}>
        {selectedMessage ? <MessageDetail message={selectedMessage} onClose={() => setSelectedMessage(null)} onDelete={deleteMessage} onMarkReplied={(id, reply) => replyContact.mutate({ id, message: reply })} /> : <div className="brand-card inbox-empty"><Mail size={24} /><p>Select an inquiry to read or reply.</p></div>}
      </div>
    </div>
  );
};

export default ContactMessages;
