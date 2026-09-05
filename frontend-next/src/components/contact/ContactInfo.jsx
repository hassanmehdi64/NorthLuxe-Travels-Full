import { Clock3, Mail, MapPin, Phone } from "lucide-react";
import { useSettings } from "../../hooks/useCms";

const ContactInfo = () => {
  const { data: settings } = useSettings(true);
  const phone = settings?.sitePhone || "+92 3455927507";
  const email = settings?.supportEmail || settings?.siteEmail || "info@northluxetravels.com";

  const details = [
    {
      label: "Visit us",
      value: settings?.address || "Main Chowk Danyore, Gilgit-Baltistan",
      icon: MapPin,
    },
    {
      label: "Call us",
      value: phone,
      href: `tel:${phone.replace(/[^+\d]/g, "")}`,
      icon: Phone,
    },
    {
      label: "Email us",
      value: email,
      href: `mailto:${email}`,
      icon: Mail,
    },
    ...(settings?.businessHours
      ? [{ label: "Working hours", value: settings.businessHours, icon: Clock3 }]
      : []),
  ];

  return (
    <aside className="h-full rounded-2xl border border-theme bg-theme-surface p-5 shadow-[0_6px_18px_rgba(15,23,42,0.045)] sm:p-6">
      <div className="border-b border-theme pb-4">
        <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.26em] text-[var(--c-brand)] sm:text-[10px]">
          Concierge Desk
        </p>
        <h2 className="text-xl font-bold tracking-tight text-theme sm:text-2xl">
          Let&apos;s plan something memorable.
        </h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted">
          Reach out for bookings, route planning, and tailored travel support across Pakistan&apos;s northern regions.
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {details.map(({ label, value, href, icon: Icon }) => (
          <div key={label} className="flex items-start gap-3 py-3.5">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--c-brand)]/10">
              <Icon className="text-[var(--c-brand)]" size={16} strokeWidth={1.8} />
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted">{label}</p>
              {href ? (
                <a className="mt-1 block break-words text-sm leading-5 text-theme transition-colors hover:text-[var(--c-brand)]" href={href}>
                  {value}
                </a>
              ) : (
                <p className="mt-1 text-sm leading-5 text-theme">{value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

    </aside>
  );
};

export default ContactInfo;
