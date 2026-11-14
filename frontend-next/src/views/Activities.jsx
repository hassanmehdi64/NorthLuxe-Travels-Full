import ContentListingPage from "../components/features/ContentListingPage";

const Activities = () => {
  return (
    <ContentListingPage
      type="activity"
      route="activities"
      heroTitle="Activities for every"
      heroAccent="travel style"
      heroText="Choose from guided adventures, cultural experiences, and relaxed moments across Northern Pakistan."
      heading="Activities"
      itemLabel="activity"
      itemsLabel="activities"
      emptyMessage="Published activities will appear here automatically."
    />
  );
};

export default Activities;
