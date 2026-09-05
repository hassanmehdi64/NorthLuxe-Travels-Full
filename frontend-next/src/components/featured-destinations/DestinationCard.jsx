import { Link } from "@/lib/router";
import { motion } from "framer-motion";

const MotionLink = motion(Link);
const cardReveal = {
  hidden: { opacity: 0, y: 28, scale: 0.985 },
  visible: (delay) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.75,
      delay,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

const DestinationCard = ({ destination, index = 0, compact = false, small = false, seasonal = false }) => {
  const href = destination?.href || "/destinations";
  const cardDelay = Math.min(index * 0.08, 0.36);
  const heightClass = seasonal
    ? "h-[170px] sm:h-[185px] lg:h-[200px]"
    : small
    ? "h-[155px] min-[420px]:h-[175px] sm:h-[200px] lg:h-[220px]"
    : compact
      ? "h-[190px] sm:h-[205px] lg:h-[220px]"
      : "h-[250px] sm:h-[280px] lg:h-[300px]";

  return (
    <MotionLink
      to={href}
      variants={cardReveal}
      custom={cardDelay}
      initial="hidden"
      whileInView="visible"
      whileHover={{ y: -5, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } }}
      viewport={{ once: true, amount: 0.2 }}
      className={`group relative block w-full overflow-hidden rounded-[1.15rem] border border-slate-200/70 bg-[#061b3a] shadow-[0_8px_22px_rgba(6,27,58,0.08)] transition-[border-color,box-shadow] duration-500 will-change-transform hover:border-[rgba(var(--c-brand-rgb),0.55)] hover:shadow-[0_18px_36px_rgba(6,27,58,0.16)] ${heightClass}`}
    >
      <motion.img
        src={destination?.image || "/gb.jpg"}
        alt={destination?.title}
        loading="lazy"
        decoding="async"
        onError={(event) => {
          if (event.currentTarget.dataset.fallbackApplied) return;
          event.currentTarget.dataset.fallbackApplied = "true";
          event.currentTarget.src = "/gb.jpg";
        }}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,27,58,0.08)_10%,rgba(6,27,58,0.18)_46%,rgba(6,27,58,0.92)_100%)] transition-opacity duration-500 group-hover:opacity-95" />
      <div className={`absolute inset-0 flex flex-col justify-end ${seasonal ? "p-3.5 sm:p-4" : small ? "p-3 sm:p-4" : compact ? "p-3.5 sm:p-4" : "p-5"}`}>
        <div className="transition-transform duration-500 ease-out group-hover:-translate-y-0.5">
          <span className="mb-2 block h-0.5 w-8 rounded-full bg-[var(--c-brand)] transition-all duration-500 group-hover:w-12" />
          <h3 className={`${seasonal ? "text-base sm:text-lg" : small ? "text-[13px] sm:text-lg" : compact ? "text-base sm:text-[17px]" : "text-xl"} font-bold leading-tight tracking-tight text-white`}>
            {destination?.title}
          </h3>

        </div>
      </div>
    </MotionLink>
  );
};

export default DestinationCard;

