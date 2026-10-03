import BlogCard from "./BlogCard";

const RelatedBlogs = ({ currentBlog, blogs, hideHeading = false, compact = false, className = "mt-20" }) => {
  const related = blogs
    .filter((b) => b.category === currentBlog.category && b.slug !== currentBlog.slug)
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section className={className}>
      {!hideHeading ? (
        <h3 className="mb-4 text-lg font-medium text-[var(--c-navy)]">
          Related articles
        </h3>
      ) : null}

      <div className={hideHeading ? "grid max-w-4xl gap-4 md:grid-cols-2 lg:grid-cols-3" : "grid gap-4 md:grid-cols-2 lg:grid-cols-3"}>
        {related.map((blog) => (
          <BlogCard key={blog.slug} blog={blog} compact={compact || hideHeading} />
        ))}
      </div>
    </section>
  );
};

export default RelatedBlogs;
