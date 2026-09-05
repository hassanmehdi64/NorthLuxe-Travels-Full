import { Quote, ShieldCheck } from "lucide-react";

const leadershipTeam = [
  {
    name: "Hassan Mehdi",
    role: "Founder & Managing Director",
    avatar: "/HM.png",
    message:
      "We craft journeys that inspire and comfort. Every trip reflects our dedication to trust, detail, and unforgettable experiences.",
    focusAreas: ["Guest Trust", "Service Standards", "Long-term Vision"],
  },
  {
    name: "Hassan Abbas",
    role: "Chief Executive & Travel Operations Lead",
    avatar: "/HA.jpeg",
    message:
      "Our tours are executed with precision and passion. Every itinerary is designed to ensure seamless, memorable experiences.",
    focusAreas: ["Tour Operations", "Route Planning", "On-ground Execution"],
  },
];

const TeamSection = () => {
  return (
    <section className="bg-theme-bg pb-10 pt-6 sm:pb-11 sm:pt-7 lg:pb-12 lg:pt-8">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="mb-5">
          <div className="mb-2 inline-flex items-center gap-3">
            <span className="h-px w-8 bg-[var(--c-brand)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.34em] text-[var(--c-brand)]">
              Leadership
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-theme md:text-3xl">
            Meet Our Team
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted md:text-[15px]">
            The people behind each itinerary, committed to dependable planning
            and personalized support.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          {leadershipTeam.map((leader) => (
            <article
              key={leader.name}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_14px_rgba(6,27,58,0.05)] sm:p-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <img
                  src={leader.avatar}
                  alt={leader.name}
                  className="h-12 w-12 rounded-xl border border-slate-200 bg-slate-50 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-bold tracking-tight text-theme">
                    {leader.name}
                  </h3>
                  <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--c-brand)]">
                    {leader.role}
                  </p>
                </div>
                <ShieldCheck size={16} className="shrink-0 text-[var(--c-brand)]" />
              </div>

              <div className="mt-4 flex items-start gap-3">
                <Quote size={15} className="mt-0.5 shrink-0 text-[var(--c-brand)]" />
                <p className="text-sm leading-6 text-muted">{leader.message}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {leader.focusAreas.map((area) => (
                  <span
                    key={area}
                    className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                    {area}
                  </span>
                ))}
              </div>

            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
