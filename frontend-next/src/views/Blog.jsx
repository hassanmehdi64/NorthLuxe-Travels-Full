import { useState, useMemo } from "react";
import PageHero from "../components/common/PageHero";
import BlogGrid from "../components/blog/BlogGrid";
import BlogSidebar from "../components/blog/BlogSidebar";
import BlogPagination from "../components/blog/BlogPagination";
import { usePublicBlogs } from "../hooks/useCms";

const POSTS_PER_PAGE = 6;

const BlogPage = () => {
  const { data: blogsData = [], isLoading } = usePublicBlogs();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);

  const categories = ["All", ...new Set(blogsData.map((blog) => blog.category).filter(Boolean))];

  /* Filter Blogs (Search + Category) */
  const filteredBlogs = useMemo(() => {
    return blogsData.filter((blog) => {
      const matchSearch = String(blog.title || "")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchCategory = category === "All" || blog.category === category;

      return matchSearch && matchCategory;
    });
  }, [blogsData, search, category]);

  /*  Pagination Logic */
  const totalPages = Math.ceil(filteredBlogs.length / POSTS_PER_PAGE);

  const paginatedBlogs = useMemo(() => {
    const start = (page - 1) * POSTS_PER_PAGE;
    return filteredBlogs.slice(start, start + POSTS_PER_PAGE);
  }, [filteredBlogs, page]);

  /*  Reset Page when Filter Changes */
  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setPage(1);
  };

  return (
    <main className="bg-theme-bg">
      <PageHero
        page="blog"
        image="/gb.jpg"
        label="Blog hero"
        tag="Blog"
        title="Travel"
        accent="Journal"
        text="Stories, guides, and field insights for planning unforgettable journeys across Gilgit-Baltistan."
      />

      <section className="mx-auto grid max-w-[1400px] gap-5 px-4 pb-9 pt-2 sm:px-6 sm:pb-10 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-7 lg:px-10 lg:pb-12">
        {/* Blog List */}
        <div>
          <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3 sm:mb-5">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Articles
            </p>
            <p className="text-[10px] font-semibold text-slate-500">
              {isLoading ? "Loading articles" : `${filteredBlogs.length} published`}
            </p>
          </div>
          <BlogGrid blogs={paginatedBlogs} isLoading={isLoading} />

          <BlogPagination
            currentPage={page}
            totalPages={totalPages}
            onChange={setPage}
          />
        </div>

        {/* Sidebar */}
        <BlogSidebar
          search={search}
          onSearch={handleSearch}
          categories={categories}
          activeCategory={category}
          onCategoryChange={handleCategoryChange}
        />
      </section>
    </main>
  );
};

export default BlogPage;
