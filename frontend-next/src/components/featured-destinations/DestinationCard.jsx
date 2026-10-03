import { Link } from "@/lib/router";
import { motion, useReducedMotion } from "framer-motion";

const MotionLink = motion(Link);

const DestinationCard = ({ destination, index = 0, compact = false, small = false, seasonal = false, showDescription = true }) => {
  const reducedMotion = useReducedMotion();
  const imageClass = seasonal ? "luxe-destination-seasonal" : compact || small ? "luxe-destination-small" : "";
  return <MotionLink to={destination?.href || "/destinations"}
    initial={reducedMotion ? false : { opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: reducedMotion ? 0 : 0.4, delay: reducedMotion ? 0 : Math.min(index * 0.06, 0.3) }}
    viewport={{ once: true, amount: 0.2 }}
    className={`luxe-destination-card ${imageClass}`}>
    <div className="luxe-destination-cover"><img src={destination?.image || "/gb.jpg"} alt={destination?.title || "Travel destination"} loading="lazy" decoding="async"
      onError={(event) => { if (event.currentTarget.src.endsWith("/gb.jpg")) return; event.currentTarget.src = "/gb.jpg"; }} /></div>
    <h3>{destination?.title}</h3>
    {showDescription && destination?.description && <p>{destination.description}</p>}
  </MotionLink>;
};

export default DestinationCard;
