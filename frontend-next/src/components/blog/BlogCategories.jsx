import { Check } from "lucide-react";

const BlogCategories = ({ categories, active, onChange }) => (
  <div className="blog-filter-categories">
    <p>Categories</p>
    <ul>
      {categories.map((category) => <li key={category}>
        <button type="button" aria-pressed={active === category} onClick={() => onChange(category)}>
          <span>{category === "All" ? "All articles" : category}</span>
          {active === category && <Check size={13} aria-hidden="true" />}
        </button>
      </li>)}
    </ul>
  </div>
);

export default BlogCategories;
