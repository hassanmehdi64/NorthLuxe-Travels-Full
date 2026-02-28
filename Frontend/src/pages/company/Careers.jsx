import FeaturePageHeader from "../../components/features/FeaturePageHeader";

const Careers = () => {
  return (
    <section className="bg-theme-bg py-20 min-h-[60vh]">
      <div className="max-w-4xl mx-auto px-6">
        <FeaturePageHeader
          eyebrow="Company"
          title="Join"
          highlight="Our Team"
          description="We are building a travel company focused on thoughtful experiences and reliable execution."
        />

        <div className="rounded-2xl border border-theme bg-theme-surface p-6 md:p-8 text-theme">
          <p className="leading-relaxed">
            We are always looking for people in operations, customer success, and travel planning.
            Share your profile and we will reach out when a suitable role opens.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Careers;
