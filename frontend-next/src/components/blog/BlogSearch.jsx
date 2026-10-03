import { Search, X } from "lucide-react";

const BlogSearch = ({ value, onChange }) => (
  <div className="blog-filter-search">
    <Search size={14} aria-hidden="true" />
    <input type="search" aria-label="Search articles" placeholder="Search articles" value={value} onChange={(event) => onChange(event.target.value)} />
    {value && <button type="button" aria-label="Clear article search" onClick={() => onChange("")}><X size={13} /></button>}
  </div>
);

export default BlogSearch;
