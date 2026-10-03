import { Link } from "@/lib/router";
import { CalendarCheck2, Headphones, ShieldCheck } from "lucide-react";

const CTASection = () => {
  return (
    <section className="bg-theme-bg py-8 lg:py-10">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(var(--c-brand-rgb),0.055)]">
          <span className="absolute inset-x-0 top-0 h-0.5 bg-[var(--c-brand)]" />

          <div className="relative grid lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="p-6 text-center sm:p-8 lg:p-9 lg:text-left">
              <div className="inline-flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="h-px w-8 bg-[var(--c-brand)]" />
                Personal Travel Planning
              </div>

              <h2 className="mx-auto mt-3 max-w-2xl text-2xl font-bold leading-tight tracking-tight text-[var(--c-navy)] sm:text-3xl lg:mx-0 lg:text-[34px]">
                Your Northern Pakistan journey,
                <span className="text-[var(--c-brand)]"> thoughtfully planned.</span>
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-[13px] leading-6 text-slate-500 sm:text-sm lg:mx-0">
                Share your dates, preferences, and budget. Our travel team will build a refined itinerary with trusted stays, safe routes, and dedicated support.
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
                <Link
                  to="/custom-booking"
                  className="ql-btn-primary ql-btn-compact border-[var(--c-brand)] shadow-none"
                >
                  Start Planning
                </Link>
                
                <Link
                  to="/tours"
                  className="ql-btn-secondary ql-btn-compact shadow-none"
                >
                  Explore Tours
                </Link>
              </div>
            </div>

            <div className="border-t border-slate-200/80 bg-[rgba(var(--c-brand-rgb),0.035)] p-6 sm:p-7 lg:border-l lg:border-t-0">
              <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                Included with every plan
              </h3>

              <div className="space-y-3.5">
                <Point icon={ShieldCheck} label="Verified travel partners" />
                <Point icon={CalendarCheck2} label="Flexible date planning" />
                <Point icon={Headphones} label="Fast premium support" />
              </div>

              <div className="mt-5 border-t border-slate-200/80 pt-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Typical response</p>
                <p className="mt-1 text-xs font-semibold text-[var(--c-navy)]">Within 30 to 60 minutes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Point = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-3">
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[rgba(var(--c-brand-rgb),0.12)] bg-white text-[var(--c-brand)]">
      <Icon size={14} />
    </span>
    <span className="text-xs font-medium text-slate-600">{label}</span>
  </div>
);

export default CTASection;
