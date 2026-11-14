import { useEffect, useMemo, useState } from "react";
import { Edit2, FileText, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { useSearchParams } from "@/lib/router";
import {
  useAdminContentList,
  useCreateContent,
  useDeleteContent,
  useUpdateContent,
} from "../../hooks/useCms";
import { useToast } from "../../context/ToastContext";
import { getApiErrorMessage } from "../../lib/apiError";
import {
  Badge,
  Button,
  Checkbox,
  Drawer,
  EmptyState,
  ErrorState,
  Field,
  IconButton,
  Input,
  PageHeader,
  RowActions,
  Select,
  SkeletonRows,
  StatusBadge,
  Tabs,
  Textarea,
  useConfirm,
} from "../ui";

const contentTypes = [
  { value: "destination", label: "Destinations" },
  { value: "activity", label: "Activities" },
  { value: "service", label: "Services" },
  { value: "season", label: "Seasonal journeys" },
  { value: "career", label: "Careers" },
  { value: "faq", label: "FAQs" },
  { value: "help-center", label: "Help center" },
  { value: "privacy-policy", label: "Privacy policy" },
  { value: "terms-of-service", label: "Terms of service" },
];

const initialForm = {
  title: "",
  slug: "",
  eyebrow: "",
  highlight: "",
  shortDescription: "",
  description: "",
  content: "",
  image: "",
  galleryImages: "",
  location: "",
  category: "",
  duration: "",
  level: "",
  question: "",
  answer: "",
  highlights: "",
  features: "",
  includes: "",
  deliverables: "",
  bestTime: "",
  idealFor: "",
  weather: "",
  destinations: "",
  terms: "",
  heroSliderImages: "",
  activityHighlightsImages: "",
  status: "published",
  featured: false,
  sortOrder: 0,
};

const parseCommaList = (value) =>
  String(value || "")
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);

const toCommaList = (arr) => (Array.isArray(arr) ? arr.join(", ") : "");
const toLineList = (arr) => (Array.isArray(arr) ? arr.filter(Boolean).join("\n") : "");
const dedupeList = (items) => Array.from(new Set(items.filter(Boolean)));
const appendMediaItems = (currentValue, nextItems) => dedupeList([...parseCommaList(currentValue), ...nextItems]).join("\n");

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });

const ImageCollectionField = ({ label, value, onChange, placeholder, helperText }) => {
  const images = parseCommaList(value);

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    try {
      const uploaded = await Promise.all(files.map(readFileAsDataUrl));
      onChange(appendMediaItems(value, uploaded));
    } catch {
      // Keep manual URLs usable even if one file read fails.
    }

    event.target.value = "";
  };

  const removeImage = (target) => {
    onChange(images.filter((item) => item !== target).join("\n"));
  };

  return (
    <div className="space-y-2 sm:col-span-2">
      <Field
        label={label}
        hint={helperText}
        labelAction={(
          <label className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-control border border-line-strong bg-surface px-2.5 text-xs font-semibold text-navy-900 hover:bg-canvas focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand">
            <Upload size={14} aria-hidden="true" />
            Upload images
            <input type="file" accept="image/*" multiple className="sr-only" onChange={handleFiles} />
          </label>
        )}
      >
        <Textarea
          rows={3}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </Field>
      {images.length ? (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {images.map((image, index) => (
            <li key={`${image.slice(0, 24)}-${index}`} className="relative overflow-hidden rounded-control border border-line bg-canvas">
              <img src={image} alt={`${label} ${index + 1}`} className="aspect-[4/3] w-full object-cover" />
              <IconButton
                label={`Remove image ${index + 1}`}
                icon={X}
                size="sm"
                iconSize={14}
                variant="secondary"
                className="absolute right-1 top-1 h-7 w-7"
                onClick={() => removeImage(image)}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

const buildPayloadByType = (type, form) => {
  const base = {
    type,
    slug: form.slug || undefined,
    status: form.status,
    sortOrder: Number(form.sortOrder || 0),
    featured: Boolean(form.featured),
  };

  if (type === "destination") {
    const gallery = parseCommaList(form.galleryImages);
    return {
      ...base,
      title: form.title,
      shortDescription: form.shortDescription,
      description: form.description,
      content: form.content,
      image: form.image || gallery[0] || "",
      gallery,
      location: form.location,
      highlights: parseCommaList(form.highlights),
      features: parseCommaList(form.features),
      meta: {
        bestTime: form.bestTime,
        idealFor: form.idealFor,
      },
    };
  }

  if (type === "activity") {
    const heroGallery = parseCommaList(form.heroSliderImages);
    const highlightGallery = parseCommaList(form.activityHighlightsImages);
    return {
      ...base,
      title: form.title,
      shortDescription: form.shortDescription,
      description: form.description,
      content: form.content,
      image: form.image || heroGallery[0] || highlightGallery[0] || "",
      gallery: heroGallery,
      location: form.location,
      duration: form.duration,
      level: form.level,
      includes: parseCommaList(form.includes),
      meta: {
        heroSliderImages: heroGallery,
        activityHighlightsImages: highlightGallery,
      },
    };
  }

  if (type === "service") {
    const gallery = parseCommaList(form.galleryImages);
    return {
      ...base,
      title: form.title,
      shortDescription: form.shortDescription,
      description: form.description,
      content: form.content,
      image: form.image || gallery[0] || "",
      gallery,
      category: form.category,
      deliverables: parseCommaList(form.deliverables),
    };
  }

  if (type === "season") {
    return {
      ...base,
      title: form.title,
      highlight: form.highlight,
      shortDescription: form.shortDescription,
      description: form.description,
      content: form.content,
      image: form.image,
      includes: parseCommaList(form.includes),
      deliverables: parseCommaList(form.deliverables),
      highlights: parseCommaList(form.highlights),
      features: parseCommaList(form.features),
      meta: {
        bestTime: form.bestTime,
        idealFor: form.idealFor,
        weather: form.weather,
        destinations: parseCommaList(form.destinations),
        terms: parseCommaList(form.terms),
      },
    };
  }

  if (type === "career") {
    return {
      ...base,
      title: form.title,
      eyebrow: form.eyebrow,
      highlight: form.highlight,
      shortDescription: form.shortDescription,
      content: form.content,
    };
  }

  if (type === "faq") {
    return {
      ...base,
      title: form.question?.trim() || form.title?.trim() || "FAQ",
      question: form.question,
      answer: form.answer,
      featured: false,
    };
  }

  return {
    ...base,
    title: form.title,
    eyebrow: form.eyebrow,
    highlight: form.highlight,
    shortDescription: form.shortDescription,
    content: form.content,
    featured: false,
  };
};

const typeText = {
  destination: "Destination",
  activity: "Activity",
  service: "Service",
  season: "Season",
  career: "Career",
  faq: "FAQ",
  "help-center": "Help center",
  "privacy-policy": "Privacy policy",
  "terms-of-service": "Terms of service",
};

const pluralText = Object.fromEntries(contentTypes.map((type) => [type.value, type.label]));

const FORM_ID = "content-entry-form";

/** A titled group of fields inside the drawer; separated by a hairline, never a nested box. */
const Section = ({ title, children }) => (
  <fieldset className="border-t border-line pt-4 first:border-t-0 first:pt-0">
    <legend className="float-left mb-3 w-full text-sm font-semibold text-navy-900">{title}</legend>
    <div className="clear-both grid gap-4 sm:grid-cols-2">{children}</div>
  </fieldset>
);

const ContentManagement = ({ fixedType = null }) => {
  const toast = useToast();
  const confirm = useConfirm();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedType, setSelectedType] = useState(fixedType || "destination");
  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const activeType = fixedType || selectedType;

  const { data: items = [], isLoading, isError, refetch } = useAdminContentList(activeType);
  const createContent = useCreateContent();
  const updateContent = useUpdateContent();
  const deleteContent = useDeleteContent();
  const isSaving = createContent.isPending || updateContent.isPending;

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

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const q = search.toLowerCase();
        return (
          !q ||
          [item.title, item.slug, item.status, item.location, item.category, item.type]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(q)
        );
      }),
    [items, search],
  );

  const resetForm = () => {
    setEditing(null);
    setForm(initialForm);
    setIsFormOpen(false);
  };

  const isDestination = activeType === "destination";
  const isActivity = activeType === "activity";
  const isService = activeType === "service";
  const isSeason = activeType === "season";
  const isCareer = activeType === "career";
  const isFaq = activeType === "faq";
  const isStaticPolicy =
    activeType === "help-center" ||
    activeType === "privacy-policy" ||
    activeType === "terms-of-service";

  const onSubmit = async (e) => {
    e.preventDefault();

    const payload = buildPayloadByType(activeType, form);

    try {
      if (editing) {
        await updateContent.mutateAsync({ id: editing.id, ...payload });
        toast.success(
          `${typeText[activeType] || "Content"} updated`,
          form.status === "published"
            ? "The item is updated on the public site."
            : "Saved as draft. It will not appear publicly until published.",
        );
      } else {
        await createContent.mutateAsync(payload);
        toast.success(
          `${typeText[activeType] || "Content"} created`,
          form.status === "published"
            ? "The item is now available on the public site."
            : "Saved as draft. It will not appear publicly until published.",
        );
      }
      resetForm();
    } catch (error) {
      toast.error("Save failed", getApiErrorMessage(error, "Could not save content."));
    }
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      ...initialForm,
      ...item,
      image: item.image || item.coverImage || "",
      galleryImages: toLineList(item.gallery),
      highlights: toCommaList(item.highlights),
      features: toCommaList(item.features),
      includes: toCommaList(item.includes),
      deliverables: toCommaList(item.deliverables),
      bestTime: item.meta?.bestTime || "",
      idealFor: item.meta?.idealFor || "",
      weather: item.meta?.weather || "",
      destinations: toCommaList(item.meta?.destinations),
      terms: toCommaList(item.meta?.terms),
      heroSliderImages: toLineList(item.meta?.heroSliderImages || item.gallery),
      activityHighlightsImages: toLineList(item.meta?.activityHighlightsImages || item.gallery),
    });
    setIsFormOpen(true);
  };

  const removeItem = async (item) => {
    const ok = await confirm({
      title: `Delete ${String(typeText[activeType] || "entry").toLowerCase()}?`,
      description: `“${item.title || "This entry"}” will be permanently removed. This cannot be undone.`,
      confirmLabel: "Delete",
      cancelLabel: "Keep it",
    });
    if (!ok) return;
    deleteContent.mutate(item.id, {
      onSuccess: () => toast.success("Deleted", "The item has been removed."),
      onError: (error) =>
        toast.error("Delete failed", getApiErrorMessage(error, "Could not delete content.")),
    });
  };

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setIsFormOpen(true);
  };

  const singular = typeText[activeType] || "Content";
  const addLabel = `Add ${singular.toLowerCase()}`;
  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));
  const showFeatured = isDestination || isActivity || isService;

  const actionsFor = (item) => [
    { label: "Edit", icon: Edit2, onClick: () => openEdit(item) },
    { label: "Delete", icon: Trash2, danger: true, onClick: () => removeItem(item) },
  ];

  let body;
  if (isLoading) {
    body = <SkeletonRows rows={6} />;
  } else if (isError) {
    body = <ErrorState description="These entries could not be loaded." onRetry={() => refetch()} />;
  } else if (!filtered.length) {
    body = items.length ? (
      <EmptyState
        icon={Search}
        title="No entries match your search"
        action={<Button size="sm" onClick={() => setSearch("")}>Clear search</Button>}
      />
    ) : (
      <EmptyState
        icon={FileText}
        title={`No ${String(pluralText[activeType] || "entries").toLowerCase()} yet`}
        description="Entries you add here appear on the public site once published."
        action={<Button variant="primary" size="sm" icon={Plus} onClick={openCreate}>{addLabel}</Button>}
      />
    );
  } else {
    body = (
      <>
        <ul className="divide-y divide-line md:hidden">
          {filtered.map((item) => (
            <li key={item.id} className="flex items-start gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <button type="button" onClick={() => openEdit(item)} className="block max-w-full truncate text-left text-sm font-semibold text-navy-900 hover:text-brand-700">
                  {item.title}
                </button>
                {item.slug && <p className="mt-0.5 truncate text-xs text-subtle">/{item.slug}</p>}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <StatusBadge status={item.status} />
                  {item.featured && <Badge tone="brand">Featured</Badge>}
                </div>
              </div>
              <RowActions actions={actionsFor(item)} />
            </li>
          ))}
        </ul>
        <div className="admin-table-wrap hidden md:block">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Title</th>
                <th scope="col">Status</th>
                <th scope="col" className="w-24">Order</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td className="max-w-md">
                    <button type="button" onClick={() => openEdit(item)} className="cell-primary block max-w-full truncate text-left hover:text-brand-700">
                      {item.title}
                    </button>
                    {item.slug && <p className="mt-0.5 truncate text-xs text-subtle">/{item.slug}</p>}
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1.5">
                      <StatusBadge status={item.status} />
                      {item.featured && <Badge tone="brand">Featured</Badge>}
                    </div>
                  </td>
                  <td className="tabular-nums">{Number(item.sortOrder || 0)}</td>
                  <td className="w-px"><RowActions actions={actionsFor(item)} /></td>
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
      <PageHeader
        title={fixedType ? pluralText[activeType] || "Content" : "Content"}
        description={fixedType
          ? `Add, update and manage ${String(pluralText[activeType] || "content").toLowerCase()} shown on the public site.`
          : "Destinations, activities, services, seasonal journeys, careers and support pages."}
        actions={<Button variant="primary" icon={Plus} onClick={openCreate}>{addLabel}</Button>}
      />

      {!fixedType ? (
        <Tabs
          ariaLabel="Content type"
          value={selectedType}
          onValueChange={(value) => {
            setSelectedType(value);
            resetForm();
          }}
          items={contentTypes}
        />
      ) : null}

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search size={15} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
          <Input
            type="search"
            aria-label="Search entries"
            className="pl-9"
            placeholder="Search title, slug, location or status"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {!isLoading && !isError && items.length > 0 && (
          <p className="text-[13px] text-subtle sm:ml-auto">{filtered.length} of {items.length} entries</p>
        )}
      </div>

      <div className="overflow-hidden rounded-card border border-line bg-surface">{body}</div>

      <Drawer
        open={isFormOpen}
        onOpenChange={(open) => { if (!open) resetForm(); }}
        size="xl"
        title={editing ? `Edit ${singular.toLowerCase()}` : addLabel}
        description={editing ? editing.title : "Published entries appear on the public site."}
        footer={(
          <>
            <Button onClick={resetForm}>Cancel</Button>
            <Button type="submit" form={FORM_ID} variant="primary" loading={isSaving}>
              {editing ? "Save changes" : addLabel}
            </Button>
          </>
        )}
      >
        <form id={FORM_ID} onSubmit={onSubmit} className="space-y-5">
          <Section title="Basics">
            {!isFaq ? (
              <Field label="Title" required>
                <Input value={form.title} onChange={set("title")} />
              </Field>
            ) : null}
            <Field label="Slug" hint="Leave blank to generate it from the title.">
              <Input value={form.slug} onChange={set("slug")} />
            </Field>
            {isCareer || isStaticPolicy ? (
              <>
                <Field label="Eyebrow"><Input value={form.eyebrow} onChange={set("eyebrow")} /></Field>
                <Field label="Highlight"><Input value={form.highlight} onChange={set("highlight")} /></Field>
              </>
            ) : null}
            {isFaq ? (
              <>
                <Field label="Question" className="sm:col-span-2"><Input value={form.question} onChange={set("question")} /></Field>
                <Field label="Answer" className="sm:col-span-2"><Textarea rows={4} value={form.answer} onChange={set("answer")} /></Field>
              </>
            ) : null}
          </Section>

          {isDestination || isActivity || isService || isSeason || isCareer || isStaticPolicy ? (
            <Section title="Text">
              <Field label="Short description" className="sm:col-span-2">
                <Textarea rows={2} value={form.shortDescription} onChange={set("shortDescription")} />
              </Field>
              {isDestination || isActivity || isService || isSeason ? (
                <Field label="Description" className="sm:col-span-2">
                  <Textarea rows={3} value={form.description} onChange={set("description")} />
                </Field>
              ) : null}
              {isDestination || isService || isSeason || isCareer || isStaticPolicy ? (
                <Field label="Main content" className="sm:col-span-2">
                  <Textarea rows={6} value={form.content} onChange={set("content")} />
                </Field>
              ) : null}
              {isActivity ? (
                <Field label="Detailed description" className="sm:col-span-2">
                  <Textarea rows={6} placeholder="A fuller activity description for the details page." value={form.content} onChange={set("content")} />
                </Field>
              ) : null}
            </Section>
          ) : null}

          {isDestination || isActivity || isService || isSeason ? (
            <Section title="Images">
              <Field label="Cover image URL" className="sm:col-span-2">
                <Input value={form.image} onChange={set("image")} placeholder="https://…" />
              </Field>
              {isDestination ? (
                <ImageCollectionField label="Gallery images" value={form.galleryImages} onChange={(value) => setForm((p) => ({ ...p, galleryImages: value }))} placeholder="Image URLs, separated by commas or new lines" helperText="Paste URLs or upload several images. The first can be used as the main slider image." />
              ) : null}
              {isService ? (
                <ImageCollectionField label="Service slider images" value={form.galleryImages} onChange={(value) => setForm((p) => ({ ...p, galleryImages: value }))} placeholder="Image URLs, separated by commas or new lines" helperText="Paste URLs or upload several images. These appear in the service details slider." />
              ) : null}
              {isActivity ? (
                <>
                  <ImageCollectionField label="Hero slider images" value={form.heroSliderImages} onChange={(value) => setForm((p) => ({ ...p, heroSliderImages: value }))} placeholder="Image URLs, separated by commas or new lines" helperText="Paste URLs or upload several hero images for the activity slider." />
                  <ImageCollectionField label="Activity highlight images" value={form.activityHighlightsImages} onChange={(value) => setForm((p) => ({ ...p, activityHighlightsImages: value }))} placeholder="Image URLs, separated by commas or new lines" helperText="Paste URLs or upload images for the activity highlights or gallery area." />
                </>
              ) : null}
            </Section>
          ) : null}

          {isDestination || isActivity || isService || isSeason ? (
            <Section title="Details">
              {isDestination || isActivity ? (
                <Field label="Location"><Input value={form.location} onChange={set("location")} /></Field>
              ) : null}
              {isService ? (
                <Field label="Category"><Input value={form.category} onChange={set("category")} /></Field>
              ) : null}
              {isActivity ? (
                <>
                  <Field label="Duration"><Input value={form.duration} onChange={set("duration")} /></Field>
                  <Field label="Level"><Input value={form.level} onChange={set("level")} /></Field>
                </>
              ) : null}
              {isDestination || isSeason ? (
                <>
                  <Field label="Best time"><Input value={form.bestTime} onChange={set("bestTime")} /></Field>
                  <Field label="Ideal for"><Input value={form.idealFor} onChange={set("idealFor")} /></Field>
                </>
              ) : null}
              {isSeason ? (
                <Field label="Weather feel" className="sm:col-span-2"><Input value={form.weather} onChange={set("weather")} /></Field>
              ) : null}
            </Section>
          ) : null}

          {isDestination || isActivity || isService || isSeason ? (
            <Section title="Lists">
              <p className="-mt-1 text-xs text-subtle sm:col-span-2">Separate items with commas.</p>
              {isDestination || isSeason ? (
                <>
                  <Field label={isSeason ? "Why go" : "Highlights"} className="sm:col-span-2"><Input value={form.highlights} onChange={set("highlights")} /></Field>
                  <Field label={isSeason ? "Planning notes" : "Features"} className="sm:col-span-2"><Input value={form.features} onChange={set("features")} /></Field>
                </>
              ) : null}
              {isActivity || isSeason ? (
                <Field label={isSeason ? "Activities" : "Includes"} className="sm:col-span-2"><Input value={form.includes} onChange={set("includes")} /></Field>
              ) : null}
              {isService || isSeason ? (
                <Field label={isSeason ? "Services" : "Deliverables"} className="sm:col-span-2"><Input value={form.deliverables} onChange={set("deliverables")} /></Field>
              ) : null}
              {isSeason ? (
                <>
                  <Field label="Top regions" className="sm:col-span-2"><Input value={form.destinations} onChange={set("destinations")} /></Field>
                  <Field label="Season tags" className="sm:col-span-2"><Input placeholder="spring, blossom, april" value={form.terms} onChange={set("terms")} /></Field>
                </>
              ) : null}
            </Section>
          ) : null}

          <Section title="Publishing">
            <Field label="Status">
              <Select value={form.status} onChange={set("status")}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
            </Field>
            <Field label="Sort order" hint="Lower numbers show first.">
              <Input type="number" value={form.sortOrder} onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))} />
            </Field>
            {showFeatured ? (
              <Checkbox
                className="sm:col-span-2"
                label="Featured"
                description="Highlight this entry in featured sections of the site."
                checked={form.featured}
                onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))}
              />
            ) : null}
          </Section>
        </form>
      </Drawer>
    </div>
  );
};

export default ContentManagement;
