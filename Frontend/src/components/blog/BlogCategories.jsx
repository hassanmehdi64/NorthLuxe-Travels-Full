const BlogCategories = ({ categories, active, onChange }) => {
  return (
    <div>
      <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted mb-4">
        Categories
      </h4>
      <ul className="space-y-2.5">
        {categories.map((cat) => (
          <li key={cat}>
            <button
              onClick={() => onChange(cat)}
              className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                active === cat
                  ? "bg-[var(--c-brand)]/15 text-theme font-semibold"
                  : "text-muted hover:bg-theme-bg hover:text-theme"
              }`}
            >
              {cat}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BlogCategories;
