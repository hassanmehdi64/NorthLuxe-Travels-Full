import { SlidersHorizontal } from "lucide-react";
import BlogSearch from "./BlogSearch";
import BlogCategories from "./BlogCategories";

const BlogSidebar = ({ search, onSearch, categories, activeCategory, onCategoryChange }) => (
  <aside className="blog-filter-sidebar order-first lg:order-none" aria-label="Article filters">
    <div className="blog-filter-panel lg:sticky lg:top-20">
      <div className="blog-filter-heading">
        <span><SlidersHorizontal size={14} aria-hidden="true" />Filter articles</span>
        {(search || activeCategory !== "All") && <button type="button" onClick={() => { onSearch(""); onCategoryChange("All"); }}>Reset</button>}
      </div>
      <BlogSearch value={search} onChange={onSearch} />
      <BlogCategories categories={categories} active={activeCategory} onChange={onCategoryChange} />
    </div>
  </aside>
);

export default BlogSidebar;
