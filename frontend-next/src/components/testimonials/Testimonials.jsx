import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import TestimonialCard from "./TestimonialCard";
import { usePublicTestimonials } from "../../hooks/useCms";
import { Star } from "lucide-react";
import SectionHeading from "../common/SectionHeading";
import { useReducedMotion } from "framer-motion";

const Testimonials = () => {
  const { data: testimonials = [] } = usePublicTestimonials();
  const stories = testimonials;
  const reducedMotion = useReducedMotion();

  const avgRating = stories.length
    ? (
        stories.reduce((sum, item) => sum + Number(item?.rating || 5), 0) /
        stories.length
      ).toFixed(1)
    : "5.0";

  return (
    <section className="section overflow-hidden" aria-labelledby="guest-reviews-title">
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
          <div className="testimonial-swiper-container w-full">
            <Swiper
              modules={[Pagination, Autoplay]}
              spaceBetween={14}
              slidesPerView={1}
              loop={stories.length >= 6}
              speed={650}
              autoplay={reducedMotion ? false : { delay: 4300, disableOnInteraction: false, pauseOnMouseEnter: true }}
              pagination={{ clickable: true, dynamicBullets: true }}
              grabCursor
              breakpoints={{
                640: { slidesPerView: 2, spaceBetween: 16 },
                1024: { slidesPerView: 3, spaceBetween: 18 },
              }}
              className="!pb-9"
            >
              {stories.map((testimonial) => (
                <SwiperSlide key={testimonial.id} className="!h-auto">
                  <TestimonialCard
                    name={testimonial.name}
                    role={testimonial.role}
                    avatar={testimonial.avatar}
                    message={testimonial.message}
                    rating={testimonial.rating}
                    date={testimonial.date}
                    location={testimonial.locationLabel}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : (
          <p className="empty-state">Guest reviews will appear here.</p>
        )}
      </div>

      <style jsx>{`
        :global(.testimonial-swiper-container .swiper-pagination-bullet) {
          width: 6px;
          height: 6px;
          background: var(--color-navy-900);
          opacity: 0.2;
          transition: width 200ms ease, opacity 200ms ease;
        }
        :global(.testimonial-swiper-container .swiper-pagination-bullet-active) {
          width: 18px;
          border-radius: 999px;
          background: var(--color-brand);
          opacity: 1;
        }
      `}</style>
    </section>
  );
};

export default Testimonials;
