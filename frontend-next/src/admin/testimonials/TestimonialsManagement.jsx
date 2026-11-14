import { useMemo, useState } from "react";
import { Edit2, MessageSquareQuote, Plus, Star, Trash2 } from "lucide-react";
import {
  useAdminTestimonials,
  useCreateTestimonial,
  useDeleteTestimonial,
  useUpdateTestimonial,
} from "../../hooks/useCms";
import { useToast } from "../../context/ToastContext";
import { getApiErrorMessage } from "../../lib/apiError";
import {
  Button,
  Card,
  Drawer,
  EmptyState,
  ErrorState,
  Field,
  Input,
  PageHeader,
  RowActions,
  Select,
  SkeletonRows,
  StatusBadge,
  Textarea,
  useConfirm,
} from "../ui";

const initialForm = {
  name: "",
  role: "Guest",
  city: "",
  country: "",
  rating: 5,
  message: "",
  photo: "",
  date: "",
  status: "draft",
};

const FORM_ID = "testimonial-form";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
};

const initials = (name = "") =>
  String(name).trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("") || "NL";

const GuestAvatar = ({ item }) => {
  const src = item.photo || item.avatar;
  if (!src) {
    return (
      <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
        {initials(item.name)}
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />;
};

const Rating = ({ value }) => (
  <span className="inline-flex items-center gap-1 text-sm font-semibold text-navy-900">
    <Star size={14} fill="currentColor" aria-hidden="true" className="text-sand" />
    <span>{value}</span>
    <span className="sr-only">out of 5</span>
  </span>
);

const TestimonialsManagement = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const { data: testimonials = [], isLoading, isError, refetch } = useAdminTestimonials();
  const createTestimonial = useCreateTestimonial();
  const updateTestimonial = useUpdateTestimonial();
  const deleteTestimonial = useDeleteTestimonial();

  const [editingId, setEditingId] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const sortedItems = useMemo(
    () => [...testimonials].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [testimonials],
  );

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const resetForm = () => {
    setEditingId("");
    setForm(initialForm);
    setErrors({});
    setIsFormOpen(false);
  };

  const openCreate = () => {
    setEditingId("");
    setForm(initialForm);
    setErrors({});
    setIsFormOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.message.trim()) nextErrors.message = "Review text is required.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    try {
      if (editingId) {
        await updateTestimonial.mutateAsync({ id: editingId, ...form });
        toast.success("Updated", "Testimonial updated successfully.");
      } else {
        await createTestimonial.mutateAsync(form);
        toast.success("Created", "Testimonial saved.");
      }
      resetForm();
    } catch (error) {
      toast.error("Save failed", getApiErrorMessage(error, "Please try again."));
    }
  };

  const startEdit = (item) => {
    setIsFormOpen(true);
    setEditingId(item.id);
    setErrors({});
    setForm({
      name: item.name || "",
      role: item.role || "Guest",
      city: item.city || "",
      country: item.country || "",
      rating: item.rating || 5,
      message: item.message || "",
      photo: item.photo || item.avatar || "",
      date: item.date ? item.date.slice(0, 10) : "",
      status: item.status || "draft",
    });
  };

  const handleDelete = async (item) => {
    const ok = await confirm({
      title: "Delete testimonial?",
      description: `The review from ${item.name || "this guest"} will be removed from the website.`,
      confirmLabel: "Delete testimonial",
      cancelLabel: "Keep testimonial",
    });
    if (!ok) return;
    try {
      await deleteTestimonial.mutateAsync(item.id);
      toast.success("Deleted", "Testimonial removed.");
      if (editingId === item.id) resetForm();
    } catch (error) {
      toast.error("Delete failed", getApiErrorMessage(error, "Please try again."));
    }
  };

  const actionsFor = (item) => [
    { label: "Edit testimonial", icon: Edit2, onClick: () => startEdit(item) },
    { label: "Delete testimonial", icon: Trash2, danger: true, onClick: () => handleDelete(item) },
  ];

  const place = (item) => [item.city, item.country].filter(Boolean).join(", ") || item.role;
  const isSaving = createTestimonial.isPending || updateTestimonial.isPending;

  const renderBody = () => {
    if (isLoading) return <SkeletonRows rows={5} />;
    if (isError) return <ErrorState description="Testimonials could not be loaded." onRetry={() => refetch()} />;
    if (!sortedItems.length) {
      return (
        <EmptyState
          icon={MessageSquareQuote}
          title="No testimonials yet"
          description="Add a guest review to show it on the website."
          action={<Button variant="primary" icon={Plus} onClick={openCreate}>Add testimonial</Button>}
        />
      );
    }

    return (
      <>
        <ul className="divide-y divide-line md:hidden">
          {sortedItems.map((item) => (
            <li key={item.id} className="flex items-start gap-3 px-4 py-3">
              <GuestAvatar item={item} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-navy-900">{item.name}</p>
                {place(item) && <p className="truncate text-xs text-subtle">{place(item)}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Rating value={item.rating} />
                  <StatusBadge status={item.status} />
                  <span className="text-xs text-subtle">{formatDate(item.date || item.createdAt)}</span>
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
                <th scope="col">Guest</th>
                <th scope="col">Rating</th>
                <th scope="col">Date</th>
                <th scope="col">Status</th>
                <th scope="col" className="w-24"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="flex min-w-0 items-center gap-3">
                      <GuestAvatar item={item} />
                      <div className="min-w-0">
                        <p className="cell-primary truncate">{item.name}</p>
                        {place(item) && <p className="truncate text-xs text-subtle">{place(item)}</p>}
                      </div>
                    </div>
                  </td>
                  <td><Rating value={item.rating} /></td>
                  <td className="whitespace-nowrap">{formatDate(item.date || item.createdAt)}</td>
                  <td><StatusBadge status={item.status} /></td>
                  <td><RowActions actions={actionsFor(item)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  return (
    <div>
      <PageHeader
        title="Testimonials"
        description="Guest reviews shown in “What our guests say” on the website."
        actions={<Button variant="primary" icon={Plus} onClick={openCreate}>Add testimonial</Button>}
      />

      <Card flush>{renderBody()}</Card>

      <Drawer
        open={isFormOpen}
        onOpenChange={(open) => { if (!open) resetForm(); }}
        title={editingId ? "Edit testimonial" : "Add testimonial"}
        footer={
          <>
            <Button variant="secondary" onClick={resetForm}>Cancel</Button>
            <Button variant="primary" type="submit" form={FORM_ID} loading={isSaving}>
              {editingId ? "Save changes" : "Create testimonial"}
            </Button>
          </>
        }
      >
        <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name" required error={errors.name}>
            <Input value={form.name} onChange={(e) => setField("name", e.target.value)} />
          </Field>
          <Field label="Role">
            <Input value={form.role} onChange={(e) => setField("role", e.target.value)} />
          </Field>
          <Field label="City">
            <Input value={form.city} onChange={(e) => setField("city", e.target.value)} />
          </Field>
          <Field label="Country">
            <Input value={form.country} onChange={(e) => setField("country", e.target.value)} />
          </Field>
          <Field label="Rating" hint="From 1 to 5.">
            <Input
              type="number"
              min={1}
              max={5}
              value={form.rating}
              onChange={(e) => setField("rating", Number(e.target.value))}
            />
          </Field>
          <Field label="Review date">
            <Input type="date" value={form.date} onChange={(e) => setField("date", e.target.value)} />
          </Field>
          <Field label="Photo URL" hint="Optional." className="sm:col-span-2">
            <Input type="url" value={form.photo} onChange={(e) => setField("photo", e.target.value)} />
          </Field>
          <Field label="Review text" required error={errors.message} className="sm:col-span-2">
            <Textarea rows={5} value={form.message} onChange={(e) => setField("message", e.target.value)} />
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => setField("status", e.target.value)}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </Select>
          </Field>
        </form>
      </Drawer>
    </div>
  );
};

export default TestimonialsManagement;
