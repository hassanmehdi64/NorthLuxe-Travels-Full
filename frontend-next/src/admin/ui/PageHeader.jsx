import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/lib/router";

/** Page title row. Also sets the browser tab title. */
export const PageHeader = ({ title, description, actions, back, documentTitle }) => {
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.title = `${documentTitle || title} · North Luxe Admin`;
  }, [title, documentTitle]);

  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        {back && (
          <Link to={back.to} className="mb-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-subtle hover:text-navy-900">
            <ArrowLeft size={14} aria-hidden="true" />
            {back.label}
          </Link>
        )}
        <h1 className="text-[22px] font-bold leading-tight tracking-[-0.01em] text-navy-900">{title}</h1>
        {description && <p className="mt-1 text-sm leading-relaxed text-subtle">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
};
