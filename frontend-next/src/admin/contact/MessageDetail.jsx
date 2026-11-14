import React, { useState } from "react";
import { Send, Trash2 } from "lucide-react";
import { Badge, Button, DetailList, Drawer, Field, Select, StatusBadge, Textarea } from "../ui";

// Statuses the inquiry model accepts; the current value is always kept as an option.
const STATUS_OPTIONS = ["Unread", "Replied"];

const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
};

const ReplyForm = ({ message, onReply, replyError, onReplyErrorClear }) => {
  const [reply, setReply] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (!reply.trim()) {
      setLocalError("Write a reply before sending.");
      return;
    }
    onReply(message.id, reply, { onSuccess: () => setReply("") });
  };

  return (
    <form id="inquiry-reply-form" onSubmit={handleSend} className="border-t border-line pt-5">
      <Field
        label="Reply"
        error={localError || replyError}
        hint="Replies are saved to this inquiry; email delivery is coming soon."
      >
        <Textarea
          rows={6}
          placeholder={`Write a reply to ${message.sender || "the guest"}`}
          value={reply}
          onChange={(event) => {
            setReply(event.target.value);
            if (localError) setLocalError("");
            if (replyError) onReplyErrorClear?.();
          }}
        />
      </Field>
    </form>
  );
};

const MessageDetail = ({ message, onClose, onDelete, onStatusChange, onReply, isReplying, replyError, onReplyErrorClear }) => {
  const status = message?.status || "Unread";
  const statusOptions = STATUS_OPTIONS.includes(status) ? STATUS_OPTIONS : [status, ...STATUS_OPTIONS];

  return (
    <Drawer
      open={Boolean(message)}
      onOpenChange={(open) => { if (!open) onClose(); }}
      size="lg"
      title={message?.subject || "Inquiry"}
      description={message ? `From ${message.sender || "Guest"}` : undefined}
      footer={message && (
        <>
          <Button variant="danger" icon={Trash2} className="mr-auto" onClick={() => onDelete(message.id)}>
            Delete
          </Button>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button variant="primary" type="submit" form="inquiry-reply-form" icon={Send} loading={isReplying}>
            Send reply
          </Button>
        </>
      )}
    >
      {message && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <StatusBadge status={status} />
              {message.urgency && <Badge>{message.urgency} priority</Badge>}
            </div>
            <Field label="Status" className="w-40">
              <Select value={status} onChange={(event) => onStatusChange(message.id, event.target.value)}>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Select>
            </Field>
          </div>

          <DetailList
            items={[
              ["Name", message.sender || "Guest"],
              ["Email", message.email ? <a href={`mailto:${message.email}`} className="text-brand-700 hover:underline">{message.email}</a> : ""],
              ["Phone", message.phone ? <a href={`tel:${message.phone}`} className="text-brand-700 hover:underline">{message.phone}</a> : ""],
              ["Received", formatDateTime(message.date || message.createdAt)],
            ]}
          />

          <div>
            <h3 className="text-[13px] font-semibold text-navy-900">Message</h3>
            <p className="mt-1.5 whitespace-pre-line break-words text-sm leading-relaxed text-body">{message.message}</p>
          </div>

          <ReplyForm
            key={message.id}
            message={message}
            onReply={onReply}
            replyError={replyError}
            onReplyErrorClear={onReplyErrorClear}
          />
        </div>
      )}
    </Drawer>
  );
};

export default MessageDetail;
