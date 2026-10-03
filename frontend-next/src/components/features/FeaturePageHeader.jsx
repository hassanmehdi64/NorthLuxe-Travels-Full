const FeaturePageHeader = ({ eyebrow, title, highlight, description }) => (
  <header className="feature-page-header">
    {eyebrow ? <p className="feature-page-eyebrow">{eyebrow}</p> : null}
    <h1>{title} {highlight ? <span className="text-[var(--c-brand)]">{highlight}</span> : null}</h1>
    {description ? <p className="feature-page-description">{description}</p> : null}
  </header>
);

export default FeaturePageHeader;
