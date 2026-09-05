import { Search } from "lucide-react";

const BlogSearch = ({ value, onChange }) => {
  return (
    <div className="mb-3 lg:mb-5">
      <div className="relative">
        <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search articles..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-theme outline-none transition-colors placeholder:text-slate-400 focus:border-[var(--c-brand)] focus:bg-white focus:ring-2 focus:ring-[rgba(var(--c-brand-rgb),0.08)]"
        />
      </div>
    </div>
  );
};

export default BlogSearch;
