const OurStory = () => {
  return (
    <section className="bg-theme-bg pb-5 pt-7 sm:pt-8 lg:pt-9">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_5px_18px_rgba(6,27,58,0.055)]">
          <div className="grid grid-cols-1 items-stretch lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="h-full min-h-[240px] overflow-hidden bg-slate-100 sm:min-h-[300px] lg:min-h-[390px]">
                <img
                  src="https://skardutrekkers.com/wp-content/uploads/2024/07/Deosai-National-Park01.png"
                  alt="Boutique travel in Gilgit Baltistan"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="p-5 sm:p-6 lg:col-span-7 lg:p-8">
              <div className="inline-flex items-center gap-3">
                <span className="h-px w-8 bg-[var(--c-brand)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.34em] text-[var(--c-brand)]">
                  Our Story
                </span>
              </div>

              <h2 className="mt-3 text-2xl md:text-3xl font-bold text-theme tracking-tight">
                Built on Trust, Local Knowledge, and Comfortable Travel
              </h2>

              <div className="mt-4 space-y-3">
                <p className="text-sm md:text-base text-muted leading-relaxed">
                  North Luxe Travels was created to make travel in the North simple,
                  comfortable, and well managed. We focus on planning trips that are
                  smooth from start to end, so you can enjoy the journey without stress.
                </p>

                <p className="text-sm md:text-base text-muted leading-relaxed">
                  We design each trip based on your needs—whether it’s a family tour,
                  a relaxing getaway, or an adventure. With the help of our trusted
                  local team, we make sure everything runs properly and you get a
                  real experience of the place.
                </p>

                <p className="text-sm md:text-base text-muted leading-relaxed">
                  From planning to execution, we stay with you at every step. Our goal
                  is to give you a safe, reliable, and memorable travel experience
                  that you can enjoy with complete peace of mind.
                </p>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--c-brand)]">
                    Local Network
                  </p>
                  <p className="mt-1 text-xs font-semibold text-theme">
                    Trusted local partners
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--c-brand)]">
                    Safety First
                  </p>
                  <p className="mt-1 text-xs font-semibold text-theme">
                    Support throughout the trip
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--c-brand)]">
                    Tailored Plans
                  </p>
                  <p className="mt-1 text-xs font-semibold text-theme">
                    Trips made your way
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurStory;
