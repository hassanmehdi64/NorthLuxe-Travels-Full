import React, { useState } from "react";
import {
  ArrowLeft,
  Trash2,
  Send,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";

const MessageDetail = ({ message, onClose, onDelete, onMarkReplied }) => {
  const [reply, setReply] = useState("");
  const [isReplyOpen, setIsReplyOpen] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    onMarkReplied(message.id, reply);
    setReply("");
    setIsReplyOpen(false);
  };

  return (
    <section className="brand-card inbox-message-detail" aria-label="Inquiry details">
      <div className="inbox-detail-toolbar">
        <button type="button" onClick={onClose} className="admin-soft-button-ghost"><ArrowLeft size={14} />Inbox</button>
        <button type="button" onClick={() => onDelete(message.id)} className="admin-soft-icon-button" data-tone="danger" aria-label="Delete inquiry"><Trash2 size={15} /></button>
      </div>
      <div className="inbox-detail-body">
        <h2>{message.sender || "Guest"}</h2>
        <div className="inbox-contact-meta">
          {message.email && <span><Mail size={12} />{message.email}</span>}
          {message.phone && <span><Phone size={12} />{message.phone}</span>}
          {(message.date || message.createdAt) && <span><Calendar size={12} />{new Date(message.date || message.createdAt).toLocaleDateString()}</span>}
        </div>
        <div className="inbox-message-content"><h3>{message.subject}</h3><p>{message.message}</p></div>
        <div className="mt-4 flex flex-wrap gap-2"><span className="admin-soft-badge admin-soft-badge-muted">{message.status || "Unread"}</span>{message.urgency && <span className="admin-soft-badge admin-soft-badge-muted">{message.urgency} priority</span>}</div>
      </div>
      <div className="inbox-reply">
        {!isReplyOpen ? <button type="button" onClick={() => setIsReplyOpen(true)} className="admin-soft-button"><Send size={14} />Write reply</button> : <form onSubmit={handleSend}>
          <textarea aria-label="Reply message" placeholder="Type your reply" value={reply} onChange={(event) => setReply(event.target.value)} />
          <div className="inbox-reply-actions"><button type="button" onClick={() => { setReply(""); setIsReplyOpen(false); }} className="admin-soft-button-ghost">Cancel</button><button type="submit" disabled={!reply.trim()} className="admin-soft-button"><Send size={14} />Send reply</button></div>
        </form>}
      </div>
    </section>
  );
};

export default MessageDetail;
