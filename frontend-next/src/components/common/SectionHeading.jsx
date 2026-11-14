import { Link } from "@/lib/router";
import Reveal from "../motion/Reveal";

/**
 * The one section header used across the site.
 * eyebrow → small uppercase label, title → h2, description → one or two lines,
 * link/to → "View all" style link aligned to the right; children render on the right too.
 */
export default function SectionHeading({ eyebrow, title, description, link, to, id, children, as: Heading = "h2", className = "" }) {
  return (
    <Reveal className={`section-head ${className}`}>
      <div className="min-w-0 max-w-2xl">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <Heading id={id} className="heading-2">{title}</Heading>
        {description && <p className="mt-2 text-sm leading-relaxed text-subtle sm:text-[15px]">{description}</p>}
      </div>
      {(link || children) && (
        <div className="flex shrink-0 items-center gap-3">
          {children}
          {link && to && (
            <Link className="link-arrow" to={to}>
              {link}
            </Link>
          )}
        </div>
      )}
    </Reveal>
  );
}
