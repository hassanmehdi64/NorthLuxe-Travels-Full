import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "@/lib/router";
import { Eye, PencilLine, Send } from "lucide-react";
import { useAdminBlog, useCreateBlog, useUpdateBlog } from "../../hooks/useCms";
import { useToast } from "../../context/ToastContext";
import { getApiErrorMessage } from "../../lib/apiError";
import {
  Button,
  Card,
  ErrorState,
  Field,
  Input,
  PageHeader,
  Select,
  Skeleton,
  StatusBadge,
  Textarea,
} from "../ui";

const CATEGORIES = ["Travel Guide", "Photography", "Luxury Stay", "Adventure", "Culture"];
const FORM_ID = "blog-form";

const validate = (data) => {
  const errors = {};
  if (!data.title.trim()) errors.title = "Add a title.";
  if (!data.content.trim()) errors.content = "Write the post content.";
  if (!data.image.trim()) errors.image = "Add a featured image URL.";
  return errors;
};

const BlogForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [previewMode, setPreviewMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [submittingStatus, setSubmittingStatus] = useState("");
  const { data: blog, isLoading, isError, refetch } = useAdminBlog(id);
  const createBlog = useCreateBlog();
  const updateBlog = useUpdateBlog();
  const isSaving = createBlog.isPending || updateBlog.isPending;

  const [formData, setFormData] = useState({
    title: "",
    category: "Travel Guide",
    excerpt: "",
    content: "",
    image: "",
    status: "draft",
  });

  useEffect(() => {
    if (!blog) return;
    setFormData({
      title: blog.title || "",
      category: blog.category || "Travel Guide",
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      image: blog.image || "",
      status: blog.status || "draft",
    });
  }, [blog]);

  const setValue = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e, status) => {
    e.preventDefault();
    const nextErrors = validate(formData);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setPreviewMode(false);
      return;
    }
    setSubmittingStatus(status);
    const payload = { ...formData, status };
    try {
      if (id) {
        await updateBlog.mutateAsync({ id, ...payload });
        toast.success(
          "Blog updated",
          status === "published"
            ? "The post is published on the public site."
            : "Saved as draft. It will not appear publicly until published.",
        );
      } else {
        await createBlog.mutateAsync(payload);
        toast.success(
          "Blog created",
          status === "published"
            ? "The post is published on the public site."
            : "Saved as draft. It will not appear publicly until published.",
        );
      }
      navigate("/admin/blogs");
    } catch (error) {
      toast.error("Save failed", getApiErrorMessage(error, "Could not save blog."));
    } finally {
      setSubmittingStatus("");
    }
  };

  const isPublished = formData.status === "published";
  const categoryOptions = CATEGORIES.includes(formData.category) || !formData.category
    ? CATEGORIES
    : [formData.category, ...CATEGORIES];

  const header = (
    <PageHeader
      title={id ? "Edit post" : "New post"}
      description={id && blog ? blog.title : "Write a travel story for the public blog."}
      documentTitle={id ? "Edit post" : "New post"}
      back={{ to: "/admin/blogs", label: "Blog" }}
      actions={(
        <>
          <Button
            variant="ghost"
            icon={previewMode ? PencilLine : Eye}
            onClick={() => setPreviewMode(!previewMode)}
            disabled={id && isLoading}
          >
            {previewMode ? "Edit" : "Preview"}
          </Button>
          <Button
            onClick={(e) => handleSubmit(e, "draft")}
            loading={submittingStatus === "draft"}
            disabled={isSaving || (id && isLoading)}
          >
            {isPublished && id ? "Unpublish & save" : "Save draft"}
          </Button>
          <Button
            variant="primary"
            icon={Send}
            onClick={(e) => handleSubmit(e, "published")}
            loading={submittingStatus === "published"}
            disabled={isSaving || (id && isLoading)}
          >
            {id && isPublished ? "Update post" : "Publish"}
          </Button>
        </>
      )}
    />
  );

  if (id && isLoading) {
    return (
      <div className="mx-auto max-w-6xl">
        {header}
        <div aria-busy="true" aria-label="Loading" className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4 rounded-card border border-line bg-surface p-5">
            <Skeleton className="h-9 w-2/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-4 rounded-card border border-line bg-surface p-5">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (id && isError) {
    return (
      <div className="mx-auto max-w-6xl">
        {header}
        <div className="rounded-card border border-line bg-surface">
          <ErrorState description="This post could not be loaded." onRetry={() => refetch()} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl pb-10">
      {header}

      {!previewMode ? (
        <form
          id={FORM_ID}
          noValidate
          className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start"
          onSubmit={(e) => handleSubmit(e, "draft")}
        >
          <Card>
            <div className="space-y-5">
              <Field label="Title" required error={errors.title}>
                <Input
                  type="text"
                  placeholder="A week among the peaks of Hunza"
                  className="h-11 text-base font-semibold"
                  value={formData.title}
                  onChange={(e) => setValue("title", e.target.value)}
                />
              </Field>
              <Field label="Excerpt" hint="One or two sentences shown on the blog list and in search results.">
                <Textarea
                  rows={3}
                  placeholder="Write a short summary…"
                  value={formData.excerpt}
                  onChange={(e) => setValue("excerpt", e.target.value)}
                />
              </Field>
              <Field label="Content" required error={errors.content}>
                <Textarea
                  rows={18}
                  placeholder="Start writing your story here…"
                  className="leading-relaxed"
                  value={formData.content}
                  onChange={(e) => setValue("content", e.target.value)}
                />
              </Field>
            </div>
          </Card>

          <div className="space-y-5 lg:sticky lg:top-20">
            <Card title="Publishing">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-subtle">Current status</span>
                  <StatusBadge status={formData.status} />
                </div>
                <Field label="Category">
                  <Select value={formData.category} onChange={(e) => setValue("category", e.target.value)}>
                    {categoryOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Featured image URL" required error={errors.image}>
                  <Input
                    type="url"
                    placeholder="https://…"
                    value={formData.image}
                    onChange={(e) => setValue("image", e.target.value)}
                  />
                </Field>
                {formData.image && (
                  <img src={formData.image} alt="" className="aspect-[16/9] w-full rounded-control border border-line object-cover" />
                )}
                <p className="text-xs leading-relaxed text-subtle">
                  Drafts stay hidden from the public site until you publish them.
                </p>
              </div>
            </Card>
          </div>
        </form>
      ) : (
        <Card className="mx-auto max-w-3xl" bodyClassName="p-6 sm:p-10">
          <p className="text-[13px] font-semibold text-brand-700">{formData.category || "Category"}</p>
          <h2 className="mb-6 mt-2 text-3xl font-bold leading-tight text-navy-900">
            {formData.title || "Your title here"}
          </h2>
          {formData.image && (
            <img src={formData.image} className="mb-6 aspect-[16/9] w-full rounded-card object-cover" alt="" />
          )}
          <p className="mb-6 whitespace-pre-line text-lg leading-relaxed text-body">
            {formData.excerpt || "No excerpt yet…"}
          </p>
          <p className="whitespace-pre-line text-base leading-relaxed text-body">
            {formData.content || "No content written yet…"}
          </p>
        </Card>
      )}
    </div>
  );
};

export default BlogForm;
