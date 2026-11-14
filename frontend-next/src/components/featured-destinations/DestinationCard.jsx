import { ArrowUpRight } from "lucide-react";
import { Link } from "@/lib/router";
import SafeImage from "../common/SafeImage";

/**
 * Destination card.
 * - overlay (default for grids): photo tile with the name over a soft gradient.
 * - card: photo on top, name and a two-line description below.
 */
const DestinationCard = ({ destination, overlay = false, showDescription = true }) => {
  const href = destination?.href || "/destinations";
  const title = destination?.title || "Destination";

  if (overlay) {
    return (
      <Link
        to={href}
        className="group relative block aspect-[4/3] overflow-hidden rounded-card bg-navy-900 sm:aspect-[16/11]"
      >
        <div className="media media-zoom absolute inset-0">
          <SafeImage src={destination?.image} alt="" loading="lazy" decoding="async" />
        </div>
        <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/15 to-transparent" />
        <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 sm:inset-x-4 sm:bottom-3.5">
          <h3 className="text-[15px] font-semibold leading-tight text-white sm:text-base">{title}</h3>
          <ArrowUpRight size={16} aria-hidden="true" className="shrink-0 text-white/80 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
      </Link>
    );
  }

  return (
    <Link to={href} className="card card-hover group flex flex-col overflow-hidden">
      <div className="media media-zoom aspect-[16/10]">
        <SafeImage src={destination?.image} alt="" label="Photo coming soon" loading="lazy" decoding="async" />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="heading-3">{title}</h3>
        {showDescription && destination?.description && (
          <p className="line-clamp-2 text-[13px] leading-relaxed text-subtle">{destination.description}</p>
        )}
      </div>
    </Link>
  );
};

export default DestinationCard;
