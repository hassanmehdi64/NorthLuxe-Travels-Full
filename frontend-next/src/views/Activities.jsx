import ContentListingPage from "../components/features/ContentListingPage";

const Activities = () => {
  return (
    <ContentListingPage
      type="activity"
      route="activities"
      heroTag="Explore Experiences"
      heroTitle="Activities for every"
      heroAccent="travel style"
      heroText="Choose from guided adventures, cultural experiences, and relaxed moments across Northern Pakistan."
      eyebrow="Curated activities"
      heading="Make every day of your journey count"
      itemLabel="activity"
      itemsLabel="activities"
      emptyMessage="Published activities will appear here automatically."
    />
  );
};

export default Activities;
