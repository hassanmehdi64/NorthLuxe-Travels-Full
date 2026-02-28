import FeaturePageHeader from "../../components/features/FeaturePageHeader";

const HelpCenter = () => {
  return (
    <section className="bg-theme-bg py-20 min-h-[60vh]">
      <div className="max-w-4xl mx-auto px-6">
        <FeaturePageHeader
          eyebrow="Support"
          title="Help"
          highlight="Center"
          description="Need assistance with a booking, itinerary, or payment? We are here to help."
        />

        <div className="rounded-2xl border border-theme bg-theme-surface p-6 md:p-8 space-y-3 text-theme">
          <p>Email: support@northluxetravels.com</p>
          <p>Business Hours: Monday to Saturday, 9:00 AM to 7:00 PM</p>
          <p>For urgent booking changes, contact us directly through the Contact page.</p>
        </div>
      </div>
    </section>
  );
};

export default HelpCenter;
