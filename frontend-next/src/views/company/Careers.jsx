import FeaturePageHeader from "../../components/features/FeaturePageHeader";
import { usePublicContentList } from "../../hooks/useCms";

const Careers = () => {
  const { data: careers = [] } = usePublicContentList("career");
  const career = careers[0];

  return (
    <section className="compact-info-page bg-theme-bg py-6 sm:py-8 min-h-[60vh]">
      <div className="site-page-container mx-auto">
        <FeaturePageHeader
          eyebrow={career?.eyebrow || "Company"}
          title={career?.title?.split(" ").slice(0, 1).join(" ") || "Join"}
          highlight={career?.highlight || "Our Team"}
          description={career?.shortDescription || "We are building a travel company focused on thoughtful experiences and reliable execution."}
        />

        <div className="rounded-lg border border-theme bg-theme-surface p-4 sm:p-5 text-theme">
          <p className="leading-relaxed">
            {career?.content ||
              "We are always looking for people in operations, customer success, and travel planning. Share your profile and we will reach out when a suitable role opens."}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Careers;
