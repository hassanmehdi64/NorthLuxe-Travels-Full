import ContentListingPage from "../components/features/ContentListingPage";

const Services = () => {
  return (
    <ContentListingPage
      type="service"
      route="services"
      heroTag="Travel Support"
      heroTitle="Services shaped around"
      heroAccent="your journey"
      heroText="From itinerary planning to on-ground support, choose reliable services for a smoother Northern Pakistan experience."
      eyebrow="Premium services"
      heading="Thoughtful support from planning to return"
      itemLabel="service"
      itemsLabel="services"
      emptyMessage="Published services will appear here automatically."
    />
  );
};

export default Services;
