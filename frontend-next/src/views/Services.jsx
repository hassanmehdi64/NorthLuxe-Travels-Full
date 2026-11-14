import ContentListingPage from "../components/features/ContentListingPage";

const Services = () => {
  return (
    <ContentListingPage
      type="service"
      route="services"
      heroTitle="Services shaped around"
      heroAccent="your journey"
      heroText="From itinerary planning to on-ground support, choose reliable services for a smoother Northern Pakistan experience."
      heading="Travel services"
      itemLabel="service"
      itemsLabel="services"
      emptyMessage="Published services will appear here automatically."
    />
  );
};

export default Services;
