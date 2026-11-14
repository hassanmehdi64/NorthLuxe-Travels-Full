import React, { useEffect, useState } from "react";
import { useSearchParams } from "@/lib/router";
import { Edit3, ImageIcon, ImagePlus, Plus, Search, Trash2, Upload } from "lucide-react";
import {
  useCreateGalleryItem,
  useDeleteGalleryItem,
  useGallery,
  useUpdateGalleryItem,
} from "../../hooks/useCms";
import { useToast } from "../../context/ToastContext";
import { getApiErrorMessage } from "../../lib/apiError";
import {
  ActionMenu,
  Button,
  Drawer,
  EmptyState,
  ErrorState,
  Field,
  Input,
  PageHeader,
  Select,
  Skeleton,
  StatusBadge,
  useConfirm,
} from "../ui";

const initialForm = {
  title: "",
  url: "",
  category: "Nature",
  alt: "",
  status: "published",
  sortOrder: 0,
};

const FORM_ID = "gallery-item-form";

const GalleryList = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(initialForm);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [fileError, setFileError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const { data: galleryItems = [], isLoading, isError, refetch } = useGallery();
  const createGallery = useCreateGalleryItem();
  const updateGallery = useUpdateGalleryItem();
  const deleteGallery = useDeleteGalleryItem();
  const isSaving = createGallery.isPending || updateGallery.isPending;

  useEffect(() => {
    const next = searchParams.get("search") || "";
    setSearch((current) => (current === next ? current : next));
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (search.trim()) params.set("search", search.trim());
    else params.delete("search");
    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [search, searchParams, setSearchParams]);

  const categories = ["All", ...new Set(galleryItems.map((item) => item.category).filter(Boolean))];
  const filteredItems = galleryItems.filter((item) => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesStatus = statusFilter === "All" || item.status === statusFilter.toLowerCase();
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [item.title, item.category, item.alt, item.status, item.url]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);

    return matchesCategory && matchesStatus && matchesSearch;
  });
  const hasFilters = activeCategory !== "All" || statusFilter !== "All" || Boolean(search.trim());

  const resetForm = () => {
    setForm(initialForm);
    setEditingId("");
    setFileError("");
    setIsFormOpen(false);
  };

  const openCreate = () => {
    setEditingId("");
    setForm(initialForm);
    setFileError("");
    setIsFormOpen(true);
  };

  const addNewImage = async (event) => {
    event.preventDefault();
    if (!form.url.trim()) return;

    const payload = {
      title: form.title.trim() || "Untitled",
      category: form.category,
      url: form.url.trim(),
      alt: form.alt.trim(),
      status: form.status,
      sortOrder: Number(form.sortOrder || 0),
    };

    try {
      if (editingId) {
        await updateGallery.mutateAsync({ id: editingId, ...payload });
        toast.success("Updated", "Gallery item updated successfully.");
      } else {
        await createGallery.mutateAsync(payload);
        toast.success("Created", "Gallery item added successfully.");
      }
      resetForm();
    } catch (error) {
      toast.error("Save failed", getApiErrorMessage(error, "Could not save gallery item."));
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setFileError("");
    setForm({
      title: item.title || "",
      url: item.url || "",
      category: item.category || "Nature",
      alt: item.alt || "",
      status: item.status || "published",
      sortOrder: Number(item.sortOrder || 0),
    });
    setIsFormOpen(true);
  };

  const deleteImage = async (item) => {
    const ok = await confirm({
      title: "Delete image?",
      description: `“${item.title || "Untitled"}” will be removed from the gallery. This cannot be undone.`,
      confirmLabel: "Delete image",
      cancelLabel: "Keep image",
    });
    if (!ok) return;
    deleteGallery.mutate(item.id, {
      onSuccess: () => toast.success("Deleted", "Gallery item removed."),
      onError: (error) =>
        toast.error("Delete failed", getApiErrorMessage(error, "Could not delete gallery item.")),
    });
  };

  const handleLocalFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileError("");
    if (!file.type.startsWith("image/")) {
      setFileError("Choose an image file.");
      event.target.value = "";
      return;
    }

    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      setFileError("Please select an image smaller than 2MB.");
      event.target.value = "";
      return;
    }

    setIsReadingFile(true);
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        url: typeof reader.result === "string" ? reader.result : prev.url,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ""),
      }));
      setIsReadingFile(false);
      event.target.value = "";
    };
    reader.onerror = () => {
      setIsReadingFile(false);
      setFileError("Could not read this file.");
      event.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const categoryOptions = categories.filter((item) => item !== "All");

  return (
    <div>
      <PageHeader
        title="Gallery"
        description="Images shown in the public gallery."
        actions={<Button variant="primary" icon={Plus} onClick={openCreate}>Add image</Button>}
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search size={15} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
          <Input
            type="search"
            aria-label="Search gallery"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title, category or alt text"
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Select aria-label="Filter by category" value={activeCategory} onChange={(event) => setActiveCategory(event.target.value)} className="sm:w-44">
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat === "All" ? "All categories" : cat}</option>
            ))}
          </Select>
          <Select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="sm:w-40">
            <option value="All">All statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </Select>
        </div>
        {!isLoading && !isError && galleryItems.length > 0 && (
          <p className="text-[13px] text-subtle sm:ml-auto">
            {filteredItems.length} of {galleryItems.length} images
          </p>
        )}
      </div>

      {isLoading ? (
        <div aria-busy="true" aria-label="Loading" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }, (_, index) => (
            <div key={index} className="overflow-hidden rounded-card border border-line bg-surface">
              <Skeleton className="aspect-[4/3] h-auto w-full rounded-none" />
              <div className="space-y-2 p-3">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-card border border-line bg-surface">
          <ErrorState description="The gallery could not be loaded." onRetry={() => refetch()} />
        </div>
      ) : !filteredItems.length ? (
        <div className="rounded-card border border-line bg-surface">
          {galleryItems.length ? (
            <EmptyState
              icon={Search}
              title="No images match these filters"
              description="Try a different search, category or status."
              action={hasFilters ? (
                <Button size="sm" onClick={() => { setSearch(""); setActiveCategory("All"); setStatusFilter("All"); }}>
                  Clear filters
                </Button>
              ) : null}
            />
          ) : (
            <EmptyState
              icon={ImageIcon}
              title="No images yet"
              description="Add the first image to the public gallery."
              action={<Button variant="primary" size="sm" icon={Plus} onClick={openCreate}>Add image</Button>}
            />
          )}
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredItems.map((item) => (
            <li key={item.id} className="min-w-0 overflow-hidden rounded-card border border-line bg-surface">
              <button
                type="button"
                onClick={() => startEdit(item)}
                aria-label={`Edit ${item.title || "image"}`}
                className="block w-full bg-canvas"
              >
                <img src={item.url} alt={item.alt || item.title || ""} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              </button>
              <div className="flex items-start gap-1 p-3 pr-1.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-navy-900" title={item.title}>{item.title || "Untitled"}</p>
                  <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="truncate text-xs text-subtle">{item.category || "Uncategorised"}</span>
                    <StatusBadge status={item.status} />
                  </div>
                </div>
                <ActionMenu
                  label={`Actions for ${item.title || "image"}`}
                  items={[
                    { label: "Edit", icon: Edit3, onClick: () => startEdit(item) },
                    { label: "Delete", icon: Trash2, danger: true, onClick: () => deleteImage(item) },
                  ]}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <Drawer
        open={isFormOpen}
        onOpenChange={(open) => { if (!open) resetForm(); }}
        title={editingId ? "Edit image" : "Add image"}
        description="Published images appear on the public gallery page."
        size="md"
        footer={(
          <>
            <Button onClick={resetForm}>Cancel</Button>
            <Button type="submit" form={FORM_ID} variant="primary" loading={isSaving} disabled={isReadingFile}>
              {editingId ? "Save changes" : "Add image"}
            </Button>
          </>
        )}
      >
        <form id={FORM_ID} onSubmit={addNewImage} className="space-y-4">
          <div>
            <div className="overflow-hidden rounded-card border border-line bg-canvas">
              {form.url ? (
                <img src={form.url} alt="" className="aspect-[4/3] w-full object-cover" />
              ) : (
                <div className="grid aspect-[4/3] w-full place-items-center text-subtle">
                  <ImagePlus size={24} aria-hidden="true" />
                </div>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
              <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-control border border-line-strong bg-surface px-3 text-[13px] font-semibold text-navy-900 hover:bg-canvas focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand">
                <Upload size={15} aria-hidden="true" />
                {isReadingFile ? "Reading file…" : "Upload from device"}
                <input type="file" accept="image/*" className="sr-only" onChange={handleLocalFileSelect} />
              </label>
              <span className="text-xs text-subtle">Image files up to 2MB.</span>
            </div>
            {fileError && <p role="alert" className="mt-1.5 text-xs font-medium text-red-700 dark:text-red-400">{fileError}</p>}
          </div>

          <Field label="Image URL" required hint="Paste a link, or upload a file above.">
            <Input
              type="url"
              placeholder="https://…"
              value={form.url}
              onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
            />
          </Field>
          <Field label="Title">
            <Input
              placeholder="Skardu Valley"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category">
              <Input
                list="gallery-category-options"
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                placeholder="Nature"
              />
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </Select>
            </Field>
          </div>
          <datalist id="gallery-category-options">
            {categoryOptions.map((item) => (
              <option key={item} value={item} />
            ))}
            <option value="Nature" />
            <option value="Hotels" />
            <option value="Adventure" />
          </datalist>
          <Field label="Alt text" hint="Describes the image for screen readers.">
            <Input
              placeholder="Snow peaks above a turquoise lake"
              value={form.alt}
              onChange={(e) => setForm((prev) => ({ ...prev, alt: e.target.value }))}
            />
          </Field>
          <Field label="Sort order" hint="Lower numbers show first.">
            <Input
              type="number"
              className="sm:w-32"
              value={form.sortOrder}
              onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: Number(e.target.value || 0) }))}
            />
          </Field>
        </form>
      </Drawer>
    </div>
  );
};

export default GalleryList;
