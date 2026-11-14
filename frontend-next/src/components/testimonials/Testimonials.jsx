import TestimonialCard from "./TestimonialCard";
import { usePublicTestimonials } from "../../hooks/useCms";
import { Star } from "lucide-react";
import SectionHeading from "../common/SectionHeading";
import Carousel from "../media/Carousel";
import Reveal from "../motion/Reveal";

const Testimonials = () => {
  const { data: testimonials = [] } = usePublicTestimonials();
  const stories = testimonials;

  const avgRating = stories.length
    ? (
        stories.reduce((sum, item) => sum + Number(item?.rating || 5), 0) /
        stories.length
      ).toFixed(1)
    : "5.0";

  return (
    <section className="section" aria-labelledby="guest-reviews-title">
      <div className="container-site">
        <SectionHeading id="guest-reviews-title" eyebrow="Guest reviews" title="What travellers say">
          {stories.length > 0 && (
            <span className="chip">
              <Star size={13} className="fill-sand text-sand" aria-hidden="true" />
              {avgRating} average · {stories.length} {stories.length === 1 ? "review" : "reviews"}
            </span>
          )}
        </SectionHeading>

        {stories.length ? (
          <Reveal>
            <Carousel label="Guest reviews" slideClassName="basis-[88%] sm:basis-1/2 lg:basis-1/3" dots>
              {stories.map((testimonial) => (
                <TestimonialCard
                  key={testimonial.id}
                  name={testimonial.name}
                  role={testimonial.role}
                  avatar={testimonial.avatar}
                  message={testimonial.message}
                  rating={testimonial.rating}
                  date={testimonial.date}
                  location={testimonial.locationLabel}
                />
              ))}
            </Carousel>
          </Reveal>
        ) : (
          <p className="empty-state">Guest reviews will appear here.</p>
        )}
      </div>

    </section>
  );
};

export default Testimonials;
