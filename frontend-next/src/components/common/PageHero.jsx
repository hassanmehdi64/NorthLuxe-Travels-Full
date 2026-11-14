import { useSettings } from "../../hooks/useCms";
import { getPageHeroImage } from "../../lib/siteTheme";

/**
 * Compact photo header shared by inner pages (listings, about, contact…).
 * `tag` renders as the eyebrow; `accent` continues the title on the same line.
 */
const PageHero = ({ page, label, tag, title, accent, text, image, children }) => {
  const { data: settings } = useSettings(true);
  const heroImage = image || getPageHeroImage(settings, page);

  return (
    <section aria-label={label || title} className="relative isolate overflow-hidden bg-navy-900">
      {heroImage && (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: `url('${heroImage}')` }}
        />
      )}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-950/85 via-navy-950/60 to-navy-950/25" />

      <div className="container-site py-10 sm:py-14">
        <div className="hero-enter max-w-2xl">
          {tag && <p className="eyebrow eyebrow-light mb-3">{tag}</p>}
          <h1 className="heading-1 text-white">
            {title}
            {accent ? <span className="text-sand-300"> {accent}</span> : null}
          </h1>
          {text && <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/85">{text}</p>}
          {children}
        </div>
      </div>
    </section>
  );
};

export default PageHero;
