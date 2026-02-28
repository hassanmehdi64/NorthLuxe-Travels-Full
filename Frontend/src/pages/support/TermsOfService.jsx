import FeaturePageHeader from "../../components/features/FeaturePageHeader";

const TermsOfService = () => {
  return (
    <section className="bg-theme-bg py-20 min-h-[60vh]">
      <div className="max-w-4xl mx-auto px-6">
        <FeaturePageHeader
          eyebrow="Legal"
          title="Terms of"
          highlight="Service"
          description="Key terms that apply to bookings and use of our services."
        />

        <div className="rounded-2xl border border-theme bg-theme-surface p-6 md:p-8 space-y-4 text-theme">
          <p>Bookings are subject to destination-specific availability and supplier confirmation.</p>
          <p>Cancellation and refund terms vary by package and are shared before payment.</p>
          <p>Travelers are responsible for valid documents and compliance with local regulations.</p>
        </div>
      </div>
    </section>
  );
};

export default TermsOfService;
