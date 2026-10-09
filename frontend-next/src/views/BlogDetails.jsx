import Loader from "../components/spinner/Loader";
import { useEffect, useMemo } from "react";
import { useParams, Link } from "@/lib/router";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Tag } from "lucide-react";
import RelatedBlogs from "../components/blog/RelatedBlogs";
import { usePublicBlog, usePublicBlogs } from "../hooks/useCms";
import { DetailState } from "../components/common/EditorialDetails";

const estimateReadingTime = (blog) => {
  const words = String(blog?.content || blog?.description || blog?.excerpt || "").trim().split(/\s+/).filter(Boolean).length;
  return words ? Math.max(1, Math.ceil(words / 200)) : 0;
};

const buildParagraphs = (blog) => {
  const raw = String(blog?.content || blog?.description || blog?.excerpt || "").trim();
  if (!raw) return [];
  const blocks = raw.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean);
  if (blocks.length > 1) return blocks;
  return raw.split(/(?<=[.!?])\s+/).reduce((groups, sentence) => {
    const last = groups.at(-1) || "";
    if (!last || last.length > 260) groups.push(sentence);
    else groups[groups.length - 1] = `${last} ${sentence}`;
    return groups;
  }, []);
};

const BlogDetails = () => {
  const { slug } = useParams();
  const { data: blog, isLoading } = usePublicBlog(slug);
  const { data: blogs = [] } = usePublicBlogs();

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [slug]);

  const index = blogs.findIndex((item) => item.slug === slug);
  const previous = index > 0 ? blogs[index - 1] : null;
  const next = index >= 0 ? blogs[index + 1] || null : null;
  const paragraphs = useMemo(() => buildParagraphs(blog), [blog]);
  const readingTime = useMemo(() => estimateReadingTime(blog), [blog]);

  if (isLoading) return <Loader fullPage label="Loading article" />;
  if (!blog) return <DetailState><p>Article not found or not published.</p><Link to="/blog" className="mt-4 inline-flex text-xs font-semibold text-[var(--c-brand)]">Back to blog</Link></DetailState>;

  const date = blog.date ? new Date(blog.date) : null;
  const formattedDate = date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : "";

  return (
    <main className="blog-detail-page bg-theme-bg pb-12 pt-5 sm:pb-14 sm:pt-7">
      <article className="mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 transition-colors hover:text-[var(--c-brand)]"><ChevronLeft size={14} />All articles</Link>

        <header className="blog-article-header mx-auto mt-5 max-w-[800px]">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-semibold text-slate-500">
            {blog.category ? <span className="inline-flex items-center gap-1.5 text-[var(--c-brand)]"><Tag size={12} />{blog.category}</span> : null}
            {formattedDate ? <span className="inline-flex items-center gap-1.5"><CalendarDays size={12} />{formattedDate}</span> : null}
            {readingTime ? <span className="inline-flex items-center gap-1.5"><Clock3 size={12} />{readingTime} min read</span> : null}
          </div>
          <h1 className="mt-3 text-[24px] font-medium leading-[1.3] text-[var(--c-navy)] sm:text-[30px]">{blog.title}</h1>
          {blog.excerpt && String(blog.content || blog.description || "").trim() !== blog.excerpt.trim() ? <p className="mt-3 text-[13px] leading-6 text-slate-500">{blog.excerpt}</p> : null}
        </header>

        {blog.image ? <div className="blog-article-cover mx-auto mt-5 max-w-[800px] overflow-hidden rounded-lg bg-slate-100"><img src={blog.image} alt={blog.title} decoding="async" onError={(event) => { if (event.currentTarget.dataset.fallbackApplied) return; event.currentTarget.dataset.fallbackApplied = "true"; event.currentTarget.src = "/gb.jpg"; }} className="h-[200px] w-full object-cover sm:h-[300px]" /></div> : null}

        {paragraphs.length && (blog.content || blog.description || !blog.excerpt) ? <div className="blog-article-body mx-auto mt-6 max-w-[800px] space-y-4">{paragraphs.map((paragraph, paragraphIndex) => <p key={`${paragraphIndex}-${paragraph.slice(0, 28)}`} className="whitespace-pre-line text-[13px] leading-7 text-slate-700 sm:text-[14px]">{paragraph}</p>)}</div> : null}

        {previous || next ? <nav className="mx-auto mt-7 grid max-w-[800px] gap-3 border-t border-slate-200 pt-6 sm:grid-cols-2" aria-label="Article navigation">
          {previous ? <Link to={`/blog/${previous.slug}`} className="group flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 transition hover:border-[rgba(var(--c-brand-rgb),0.35)]"><ChevronLeft size={16} className="shrink-0 text-[var(--c-brand)]" /><div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">Previous</p><p className="mt-1 line-clamp-2 text-xs font-medium text-[var(--c-navy)] group-hover:text-[var(--c-brand)]">{previous.title}</p></div></Link> : <span className="hidden sm:block" />}
          {next ? <Link to={`/blog/${next.slug}`} className="group flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 text-right transition hover:border-[rgba(var(--c-brand-rgb),0.35)]"><div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">Next</p><p className="mt-1 line-clamp-2 text-xs font-medium text-[var(--c-navy)] group-hover:text-[var(--c-brand)]">{next.title}</p></div><ChevronRight size={16} className="shrink-0 text-[var(--c-brand)]" /></Link> : null}
        </nav> : null}

        <RelatedBlogs currentBlog={blog} blogs={blogs} className="mx-auto mt-7 max-w-[800px] border-t border-slate-200 pt-5" compact />
      </article>
    </main>
  );
};

export default BlogDetails;
