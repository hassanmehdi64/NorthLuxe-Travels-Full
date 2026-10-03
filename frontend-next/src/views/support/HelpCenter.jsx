import FeaturePageHeader from "../../components/features/FeaturePageHeader";
import { usePublicContentList, useSettings } from "../../hooks/useCms";

const HelpCenter = () => {
  const { data: items = [] } = usePublicContentList("help-center");
  const { data: settings } = useSettings(true);
  const help = items[0];
  const contentLines = String(help?.content || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <section className="compact-info-page bg-theme-bg py-6 sm:py-8 min-h-[60vh]">
      <div className="site-page-container mx-auto">
        <FeaturePageHeader
          eyebrow={help?.eyebrow || "Support"}
          title="Help"
          highlight={help?.highlight || "Center"}
          description={help?.shortDescription || "Need assistance with a booking, itinerary, or payment? We are here to help."}
        />

        <div className="rounded-lg border border-theme bg-theme-surface p-4 sm:p-5 space-y-3 text-theme">
          {contentLines.length ? (
            contentLines.map((line) => <p key={line}>{line}</p>)
          ) : (
            <>
              <p>Email: {settings?.supportEmail || settings?.siteEmail || "support@northluxetravels.com"}</p>
              <p>Phone: {settings?.sitePhone || "+92 300 1234567"}</p>
              <p>Business Hours: {settings?.businessHours || "Monday to Saturday, 9:00 AM to 7:00 PM"}</p>
              <p>For urgent booking changes, contact us directly through the Contact page.</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default HelpCenter;
