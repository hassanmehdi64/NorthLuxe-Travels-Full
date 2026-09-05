import BlogSearch from "./BlogSearch";
import BlogCategories from "./BlogCategories";

const BlogSidebar = ({
  search,
  onSearch,
  categories,
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <aside className="order-first lg:order-none">
      <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-[0_3px_12px_rgba(6,27,58,0.04)] lg:sticky lg:top-20 lg:p-4">
        <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
          Filter Articles
        </p>
        <BlogSearch value={search} onChange={onSearch} />
        <BlogCategories
          categories={categories}
          active={activeCategory}
          onChange={onCategoryChange}
        />
      </div>
    </aside>
  );
};

export default BlogSidebar;
