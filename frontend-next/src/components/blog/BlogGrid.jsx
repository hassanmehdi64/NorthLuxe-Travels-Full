import BlogCard from "./BlogCard";

const BlogGrid = ({ blogs, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading articles" aria-busy="true">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="h-40 animate-pulse bg-slate-200" />
            <div className="space-y-2.5 p-4">
              <div className="h-2.5 w-20 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!blogs.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-sm text-slate-500">
        No articles match your current filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 items-stretch gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
      {blogs.map((blog) => (
        <BlogCard key={blog.id} blog={blog} />
      ))}
    </div>
  );
};

export default BlogGrid;
