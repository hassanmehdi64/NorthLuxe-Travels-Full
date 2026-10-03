import FeaturePageHeader from "../components/features/FeaturePageHeader";

const Guidelines = () => {
  return (
    <section className="compact-info-page bg-theme-bg py-6 sm:py-8 min-h-[60vh]">
      <div className="site-page-container mx-auto">
        <FeaturePageHeader
          eyebrow="Before You Travel"
          title="Booking"
          highlight="Guidelines"
          description="Quick guidance to make your planning and booking process smooth."
        />

        <div className="rounded-lg border border-theme bg-theme-surface p-4 sm:p-5 space-y-4 text-theme">
          <p>Keep your passport and visa details ready before confirming an international booking.</p>
          <p>Review inclusions, exclusions, and cancellation terms on each tour page.</p>
          <p>Share dietary, accessibility, or special requirements during checkout.</p>
          <p>For custom trips, submit your request early to get the best route and stay options.</p>
        </div>
      </div>
    </section>
  );
};

export default Guidelines;
