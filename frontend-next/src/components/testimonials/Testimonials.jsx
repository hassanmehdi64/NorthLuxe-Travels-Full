import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import TestimonialCard from "./TestimonialCard";
import { usePublicTestimonials } from "../../hooks/useCms";
import { Star } from "lucide-react";

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
    <section className="relative py-8 lg:py-10 bg-theme-bg overflow-hidden">
      <div className="relative mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-10 xl:px-0">
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-3">
                <span className="h-px w-8 bg-[var(--c-brand)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-[var(--c-brand)]">
                  Guest Reviews
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-theme tracking-tight">
                Moments That <span className="text-[var(--c-brand)]">Inspire</span>
              </h2>

              <p className="text-muted text-sm md:text-base max-w-xl leading-relaxed">
                Verified feedback from travelers who explored our premium routes across the North.
              </p>
            </div>

            <div className="flex self-center md:self-auto">
              <span className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[rgba(var(--c-brand-rgb),0.18)] bg-[rgba(var(--c-brand-rgb),0.045)] px-3.5 text-[10px] font-semibold text-[#061b3a]">
                <Star size={11} className="text-[var(--c-brand)] fill-[var(--c-brand)]" />
                {avgRating} average · {stories.length} verified reviews
              </span>
            </div>
          </div>
        </div>

        {stories.length ? (
          <div className="testimonial-swiper-container w-full overflow-hidden px-0.5 pb-1 pt-1">
            <Swiper
              modules={[Pagination, Autoplay]}
              spaceBetween={14}
              slidesPerView={1}
              loop={stories.length > 3}
              speed={650}
              autoplay={{ delay: 4300, disableOnInteraction: false, pauseOnMouseEnter: true }}
              pagination={{ clickable: true, dynamicBullets: true }}
              grabCursor
              breakpoints={{
                640: { slidesPerView: 2, spaceBetween: 16 },
                1024: { slidesPerView: 3, spaceBetween: 18 },
              }}
              className="!overflow-visible !pb-10"
            >
              {stories.map((testimonial) => (
                <SwiperSlide key={testimonial.id} className="h-auto flex justify-center">
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
          <div className="rounded-2xl border border-dashed border-theme py-16 text-center text-muted bg-theme-surface">
            <p className="text-sm font-medium tracking-wide">Guest stories arriving soon...</p>
          </div>
        )}
      </div>

      <style jsx>{`
        :global(.testimonial-swiper-container .swiper-pagination-bullet) {
          width: 5px;
          height: 5px;
          background: #061b3a;
          opacity: 0.2;
          transition: all 300ms ease;
        }
        :global(.testimonial-swiper-container .swiper-pagination-bullet-active) {
          background: var(--c-brand);
          opacity: 1;
          width: 20px;
          border-radius: 999px;
        }
        :global(.testimonial-message) {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
        }
        @media (max-width: 480px) {
          :global(.testimonial-message) {
            -webkit-line-clamp: 5;
          }
        }
      `}</style>
    </section>
  );
};

export default Testimonials;
