const Loader = ({ label = "Loading data", className = "", fullPage = false }) => (
  <div role="status" aria-live="polite" aria-busy="true" className={`${fullPage ? "min-h-[55vh] bg-theme-bg" : "min-h-40"} flex items-center justify-center ${className}`}>
    <span aria-hidden="true" className="brand-dot-loader">
      {[0, 1, 2, 3].map((dot) => <span key={dot} className="brand-dot-loader-dot" />)}
    </span>
    <span className="sr-only">{label}</span>
  </div>
);

export default Loader;
