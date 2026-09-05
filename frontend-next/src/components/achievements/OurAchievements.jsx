import { Award, Globe2, ShieldCheck, Users2 } from "lucide-react";

const stats = [
  {
    icon: Users2,
    value: "100+",
    label: "Happy Travelers",
    note: "Verified guest experiences across Pakistan",
  },
  {
    icon: Globe2,
    value: "30+",
    label: "Destinations Covered",
    note: "Scenic, cultural, and adventure routes",
  },
  {
    icon: ShieldCheck,
    value: "99%",
    label: "Safe Trip Record",
    note: "Reliable operations and trusted partners",
  },
  {
    icon: Award,
    value: "5+",
    label: "Years Experience",
    note: "Premium planning and ground support",
  },
];

const OurAchievements = () => {
  return (
    <section className="bg-theme-bg py-6 sm:py-7 lg:py-8">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="mb-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-3">
              <span className="h-px w-8 bg-[var(--c-brand)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.35em] text-[var(--c-brand)]">
                Trust Signals
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-theme md:text-3xl">
              Our <span className="text-[var(--c-brand)]">Achievements</span>
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-muted md:text-[15px]">
              Measurable results from our journeys, service quality, and
              traveler satisfaction.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.label}
                className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-[0_3px_12px_rgba(6,27,58,0.045)] sm:p-4">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(var(--c-brand-rgb),0.08)] text-[var(--c-brand)]">
                  <Icon size={14} />
                </div>
                <p className="mt-2.5 text-xl font-black tracking-tight text-theme sm:text-2xl">
                  {item.value}
                </p>
                <p className="mt-1 text-xs font-semibold text-theme sm:text-sm">
                  {item.label}
                </p>
                <p className="mt-1 hidden text-[11px] leading-relaxed text-muted sm:block">
                  {item.note}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default OurAchievements;
