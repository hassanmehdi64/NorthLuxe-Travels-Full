import { useSettings } from "../../hooks/useCms";
import { getPageHeroImage } from "../../lib/siteTheme";

const PageHero = ({
  page,
  label,
  tag,
  title,
  accent,
  text,
  image,
}) => {
  const { data: settings } = useSettings(true);
  const heroImage = image || getPageHeroImage(settings, page);

  return (
    <section aria-label={label} className="public-page-hero relative isolate w-full overflow-hidden bg-theme-text">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${heroImage}')` }}
      />
      <div aria-hidden="true" className="public-page-hero-scrim absolute inset-0" />

      <div className="public-page-hero-content relative z-10 mx-auto w-full">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-3">
            <span className="public-page-eyebrow">
              {tag}
            </span>
          </div>

          <h1 className="public-page-title text-white">
            {title}
            {accent ? <span> {accent}</span> : null}
          </h1>

          <p className="max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
            {text}
          </p>
        </div>
      </div>
    </section>
  );
};

export default PageHero;
