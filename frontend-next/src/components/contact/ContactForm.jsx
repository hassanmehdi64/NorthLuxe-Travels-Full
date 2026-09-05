import { useState } from "react";
import { Send } from "lucide-react";
import { useCreateContact } from "../../hooks/useCms";
import { useToast } from "../../context/ToastContext";

const ContactForm = () => {
  const createContact = useCreateContact();
  const toast = useToast();
  const [form, setForm] = useState({ sender: "", email: "", subject: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createContact.mutateAsync(form);
      setForm({ sender: "", email: "", subject: "", message: "" });
      toast.success("Message sent", "A confirmation email has been sent to your inbox.");
    } catch (error) {
      toast.error(
        "Unable to send message",
        error?.response?.data?.message || "Please try again in a moment.",
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="h-full space-y-4 rounded-2xl border border-theme bg-theme-surface p-5 shadow-[0_6px_18px_rgba(15,23,42,0.045)] sm:p-6"
    >
      <div className="border-b border-theme pb-4">
        <p className="text-[9px] font-bold uppercase tracking-[0.26em] text-[var(--c-brand)] sm:text-[10px]">
          Send Inquiry
        </p>
        <h3 className="mt-2 text-xl font-bold tracking-tight text-theme sm:text-2xl">
          Tell Us About Your Journey
        </h3>
        <p className="mt-1.5 text-sm leading-5 text-muted">
          Share the essentials and our team will help shape the next steps.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="ql-label">Full Name</label>
          <input
            type="text"
            placeholder="Your name"
            required
            value={form.sender}
            onChange={(e) => setForm((prev) => ({ ...prev, sender: e.target.value }))}
            className="ql-input"
          />
        </div>

        <div>
          <label className="ql-label">Email Address</label>
          <input
            type="email"
            placeholder="you@example.com"
            required
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            className="ql-input"
          />
        </div>
      </div>

      <div>
        <label className="ql-label">Subject</label>
        <input
          type="text"
          placeholder="Trip inquiry"
          required
          value={form.subject}
          onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
          className="ql-input"
        />
      </div>

      <div>
        <label className="ql-label">Message</label>
        <textarea
          rows="4"
          placeholder="Tell us about your travel plans, dates, and preferences..."
          required
          value={form.message}
          onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
          className="ql-textarea"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={createContact.isPending}
        className="ql-btn-primary w-full py-3 text-[12px] font-semibold"
      >
        {createContact.isPending ? "Sending..." : "Send Message"}
        <Send size={14} strokeWidth={2} />
      </button>
    </form>
  );
};

export default ContactForm;
