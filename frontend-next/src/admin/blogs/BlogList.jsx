import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "@/lib/router";
import { CircleCheck, CircleDashed, Edit2, ExternalLink, FileText, Plus, Search, Trash2 } from "lucide-react";
import { useAdminBlogs, useDeleteBlog, useUpdateBlog } from "../../hooks/useCms";
import { useToast } from "../../context/ToastContext";
import { getApiErrorMessage } from "../../lib/apiError";
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  RowActions,
  Select,
  SkeletonRows,
  StatusBadge,
  useConfirm,
} from "../ui";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};

const BlogList = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const { data: blogs = [], isLoading, isError, refetch } = useAdminBlogs();
  const updateBlog = useUpdateBlog();
  const deleteBlog = useDeleteBlog();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState("All Posts");

  useEffect(() => {
    const next = searchParams.get("search") || "";
    setSearchQuery((current) => (current === next ? current : next));
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    else params.delete("search");
    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [searchQuery, searchParams, setSearchParams]);

  const toggleStatus = (id) => {
    const blog = blogs.find((item) => item.id === id);
    if (!blog) return;
    updateBlog.mutate({ id, status: blog.status === "published" ? "draft" : "published" });
  };

  const handleDelete = async (blog) => {
    const ok = await confirm({
      title: "Delete post?",
      description: `“${blog.title}” will be permanently removed. This cannot be undone.`,
      confirmLabel: "Delete post",
      cancelLabel: "Keep post",
    });
    if (!ok) return;
    deleteBlog.mutate(blog.id, {
      onSuccess: () => toast.success("Deleted", "Blog post removed successfully."),
      onError: (error) =>
        toast.error("Delete failed", getApiErrorMessage(error, "Could not delete this post.")),
    });
  };

  const filteredBlogs = useMemo(
    () =>
      blogs.filter((blog) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          [blog.title, blog.slug, blog.author, blog.excerpt, blog.status]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(query);
        const matchesStatus =
          statusFilter === "All Posts" || blog.status === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
      }),
    [blogs, searchQuery, statusFilter],
  );

  const actionsFor = (blog) => [
    { label: "Edit", icon: Edit2, to: `/admin/blogs/edit/${blog.id}` },
    { label: "View on site", icon: ExternalLink, to: `/blog/${blog.slug}`, hidden: blog.status !== "published" },
    blog.status === "published"
      ? { label: "Unpublish (move to draft)", icon: CircleDashed, onClick: () => toggleStatus(blog.id) }
      : { label: "Publish", icon: CircleCheck, onClick: () => toggleStatus(blog.id) },
    { label: "Delete", icon: Trash2, danger: true, onClick: () => handleDelete(blog) },
  ];

  const newPostButton = (
    <Button variant="primary" icon={Plus} to="/admin/blogs/new">New post</Button>
  );

  const hasFilters = Boolean(searchQuery.trim()) || statusFilter !== "All Posts";

  let body;
  if (isLoading) {
    body = <SkeletonRows rows={6} />;
  } else if (isError) {
    body = <ErrorState description="Blog posts could not be loaded." onRetry={() => refetch()} />;
  } else if (!filteredBlogs.length) {
    body = blogs.length ? (
      <EmptyState
        icon={Search}
        title="No posts match these filters"
        description="Try a different search or status."
        action={hasFilters ? (
          <Button size="sm" onClick={() => { setSearchQuery(""); setStatusFilter("All Posts"); }}>Clear filters</Button>
        ) : null}
      />
    ) : (
      <EmptyState
        icon={FileText}
        title="No blog posts yet"
        description="Write the first travel story for the public blog."
        action={<Button variant="primary" size="sm" icon={Plus} to="/admin/blogs/new">New post</Button>}
      />
    );
  } else {
    body = (
      <>
        {/* Phones: stacked cards */}
        <ul className="divide-y divide-line md:hidden">
          {filteredBlogs.map((blog) => (
            <li key={blog.id} className="flex items-start gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <Link to={`/admin/blogs/edit/${blog.id}`} className="block truncate text-sm font-semibold text-navy-900 hover:text-brand-700">
                  {blog.title}
                </Link>
                <p className="mt-0.5 truncate text-xs text-subtle">
                  {blog.category || "No category"} · Updated {formatDate(blog.updatedAt || blog.date)}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <StatusBadge status={blog.status} />
                  {blog.featured && <Badge tone="brand">Featured</Badge>}
                </div>
              </div>
              <RowActions actions={actionsFor(blog)} />
            </li>
          ))}
        </ul>

        {/* md+: table */}
        <div className="admin-table-wrap hidden md:block">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Post</th>
                <th scope="col">Category</th>
                <th scope="col">Status</th>
                <th scope="col">Updated</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {filteredBlogs.map((blog) => (
                <tr key={blog.id}>
                  <td className="max-w-md">
                    <Link to={`/admin/blogs/edit/${blog.id}`} className="cell-primary block truncate hover:text-brand-700">
                      {blog.title}
                    </Link>
                    <p className="mt-0.5 truncate text-xs text-subtle">/{blog.slug}</p>
                  </td>
                  <td className="whitespace-nowrap">{blog.category || "—"}</td>
                  <td>
                    <div className="flex flex-wrap gap-1.5">
                      <StatusBadge status={blog.status} />
                      {blog.featured && <Badge tone="brand">Featured</Badge>}
                    </div>
                  </td>
                  <td className="whitespace-nowrap">{formatDate(blog.updatedAt || blog.date)}</td>
                  <td className="w-px">
                    <RowActions actions={actionsFor(blog)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  return (
    <div>
      <PageHeader title="Blog" description="Travel stories published on the public blog." actions={newPostButton} />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search size={15} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
          <Input
            type="search"
            aria-label="Search posts"
            placeholder="Search title, author or slug"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          aria-label="Filter by status"
          className="sm:w-40"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All Posts">All posts</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
        </Select>
      </div>

      <div className="overflow-hidden rounded-card border border-line bg-surface">{body}</div>
    </div>
  );
};

export default BlogList;
