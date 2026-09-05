import FeaturedDestinations from "../components/featured-destinations/FeaturedDestinations";
import PopularTours from "../components/popular-tours/PopularTours";
import WhyChooseUs from "../components/why-choose-us/WhyChooseUs";
import TourMain from "../components/TourBooking/TourMain";
import Testimonials from "../components/testimonials/Testimonials";
import CTASection from "../components/CTASection/CTASection";
import GallerySection from "../components/about/GallerySection";

const Home = () => {
  return (
    <>
      <TourMain />
      <PopularTours />
      <FeaturedDestinations />
      <WhyChooseUs />
      <Testimonials />
      <GallerySection />
      <CTASection />
    </>
  );
};

export default Home;
