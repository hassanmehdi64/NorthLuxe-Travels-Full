const BlogCategories = ({ categories, active, onChange }) => {
  return (
    <div>
      <h4 className="mb-2 text-[9px] font-bold uppercase tracking-[0.17em] text-slate-400">
        Categories
      </h4>
      <ul className="flex flex-wrap gap-1.5 lg:block lg:space-y-1.5">
        {categories.map((cat) => (
          <li key={cat}>
            <button
              onClick={() => onChange(cat)}
              className={`rounded-lg border px-2.5 py-1.5 text-left text-[11px] font-semibold transition-colors duration-150 lg:w-full lg:px-3 lg:py-2 ${
                active === cat
                  ? "border-[rgba(var(--c-brand-rgb),0.3)] bg-[rgba(var(--c-brand-rgb),0.09)] text-[var(--c-brand-dark)]"
                  : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-theme lg:border-transparent lg:bg-slate-50"
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
