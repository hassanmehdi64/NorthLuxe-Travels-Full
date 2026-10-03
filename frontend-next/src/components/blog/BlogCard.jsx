import { Link } from "@/lib/router";

const BlogCard = ({ blog, compact = false }) => {
  return (
    <Link
      to={`/blog/${blog.slug}`}
      className="luxe-blog-card group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_3px_12px_rgba(var(--c-brand-rgb),0.045)] transition-[border-color,box-shadow] duration-200 hover:border-[rgba(var(--c-brand-rgb),0.35)] hover:shadow-[0_8px_20px_rgba(var(--c-brand-rgb),0.08)]"
    >
      <img
        src={blog.image || "/gb.jpg"}
        alt={blog.title}
        loading="lazy"
        decoding="async"
        onError={(event) => {
          if (event.currentTarget.dataset.fallbackApplied) return;
          event.currentTarget.dataset.fallbackApplied = "true";
          event.currentTarget.src = "/gb.jpg";
        }}
        className={`${compact ? "h-32 sm:h-36 md:h-40" : "h-40 sm:h-44"} w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]`}
      />

      <div className={`${compact ? "p-4" : "p-4"} flex flex-1 flex-col`}>
        <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--c-brand)]">
          {blog.category}
        </span>

        <h3 className={`${compact ? "text-base" : "text-[15px] sm:text-base"} mt-2 line-clamp-2 font-bold tracking-tight text-theme transition-colors group-hover:text-[var(--c-brand)]`}>
          {blog.title}
        </h3>

        <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">{blog.excerpt}</p>

        <div className={`${compact ? "mt-4 pt-3" : "mt-auto pt-3"} border-t border-slate-100 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400`}>
          {new Date(blog.date).toLocaleDateString()}
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
