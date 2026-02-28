import FeaturePageHeader from "../../components/features/FeaturePageHeader";

const PrivacyPolicy = () => {
  return (
    <section className="bg-theme-bg py-20 min-h-[60vh]">
      <div className="max-w-4xl mx-auto px-6">
        <FeaturePageHeader
          eyebrow="Legal"
          title="Privacy"
          highlight="Policy"
          description="How we collect, use, and protect your information."
        />

        <div className="rounded-2xl border border-theme bg-theme-surface p-6 md:p-8 space-y-4 text-theme">
          <p>We only collect information required to process bookings and provide support.</p>
          <p>Personal information is not sold to third parties.</p>
          <p>Payment details are handled by secure third-party payment providers.</p>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicy;
