import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "@/lib/router";
import { Map as MapIcon, Pencil, Plus, Printer, Search, Trash2 } from "lucide-react";
import { useAdminTours, useCreateTour, useDeleteTour, useSettings, useUpdateTour, useUpdateBooking } from "../../hooks/useCms";
import { useToast } from "../../context/ToastContext";
import { getApiErrorMessage } from "../../lib/apiError";
import { CURRENCY_OPTIONS, displayCurrency, formatCurrencyAmount } from "../../utils/currency";
import { html, safeUrl } from "../../lib/html.mjs";
import {
  Badge,
  Button,
  Card,
  Drawer,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  RowActions,
  SkeletonRows,
  StatusBadge,
  useConfirm,
} from "../ui";
import TourForm, { normalizeKeyList, parseGalleryText } from "./TourForm";

const initialForm = {
  title: "",
  location: "",
  durationDays: 5,
  price: 0,
  currency: "PKR",
  image: "",
  galleryText: "",
  placesText: "",
  shortDescription: "",
  description: "",
  status: "draft",
  featured: false,
  availableSeats: 20,
  hotelCategoryKeys: "",
  vehicleTypeKeys: [],
  itinerary: [{ day: 1, title: "", description: "" }],
};

const FORM_ID = "tour-form";

const normalizeGalleryText = (items) =>
  (Array.isArray(items) ? items : [])
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .join("\n");

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });

const isRecentlyAdded = (value) => {
  if (!value) return false;
  const created = new Date(value).getTime();
  if (Number.isNaN(created)) return false;
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
  return Date.now() - created <= threeDaysMs;
};

/** Show the currency the record actually carries; only known codes go through the shared formatter. */
const formatTourPrice = (tour) => {
  const code = String(tour?.currency || "").trim().toUpperCase();
  if (!code || CURRENCY_OPTIONS.some((item) => item.value === code)) return formatCurrencyAmount(tour?.price, code || undefined);
  return `${code} ${Number(tour?.price || 0).toLocaleString()}`;
};

const formatDuration = (tour) => tour?.durationLabel || (tour?.durationDays ? `${tour.durationDays} ${Number(tour.durationDays) === 1 ? "day" : "days"}` : "—");

const validateForm = (form) => {
  const errors = {};
  if (!String(form.title || "").trim()) errors.title = "Enter a tour title.";
  if (!String(form.location || "").trim()) errors.location = "Enter a location.";
  if (!String(form.image || "").trim()) errors.image = "Add a cover image URL or upload one.";
  return errors;
};

const TourManagement = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: tours = [], isLoading, isError, error: loadError, refetch } = useAdminTours();
  const { data: settings = {} } = useSettings();
  const createTour = useCreateTour();
  const updateTour = useUpdateTour();
  const deleteTour = useDeleteTour();
  const updateBooking = useUpdateBooking();

  const [editing, setEditing] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initialForm));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [sourceBookingId, setSourceBookingId] = useState("");
  const [sourceBookingCode, setSourceBookingCode] = useState("");
  const [query, setQuery] = useState("");

  const isSaving = createTour.isPending || updateTour.isPending || updateBooking.isPending;
  const defaultCurrency = displayCurrency(settings?.currency || "PKR");

  const openForm = (nextForm) => {
    setForm(nextForm);
    setBaseline(JSON.stringify(nextForm));
    setErrors({});
    setSubmitError("");
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setEditing(null);
    setIsFormOpen(false);
    setForm(initialForm);
    setErrors({});
    setSubmitError("");
    setSourceBookingId("");
    setSourceBookingCode("");
  };

  useEffect(() => {
    const prefill = location.state?.prefill;
    const nextBookingId = location.state?.sourceBookingId || "";
    const nextBookingCode = location.state?.sourceBookingCode || "";
    if (!prefill) return;

    const nextForm = {
      ...initialForm,
      ...prefill,
      currency: displayCurrency(prefill.currency || settings?.currency || "PKR"),
      galleryText: normalizeGalleryText(prefill.gallery),
      placesText: (prefill.places || []).join("\n"),
      hotelCategoryKeys: prefill.hotelCategoryKeys || "",
      vehicleTypeKeys: normalizeKeyList(prefill.vehicleTypeKeys),
      itinerary: Array.isArray(prefill.itinerary) && prefill.itinerary.length
        ? prefill.itinerary.map((item, index) => ({
            day: Number(item?.day || index + 1),
            title: item?.title || "",
            description: item?.description || "",
          }))
        : initialForm.itinerary,
    };
    setEditing(null);
    setSourceBookingId(nextBookingId);
    setSourceBookingCode(nextBookingCode);
    setForm(nextForm);
    setBaseline(JSON.stringify(nextForm));
    setErrors({});
    setSubmitError("");
    setIsFormOpen(true);
  }, [location.state, settings?.currency]);

  const sortedTours = useMemo(
    () =>
      [...tours].sort((a, b) => {
        const aTime = new Date(a?.createdAt || 0).getTime();
        const bTime = new Date(b?.createdAt || 0).getTime();
        return bTime - aTime;
      }),
    [tours],
  );

  const visibleTours = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return sortedTours;
    return sortedTours.filter((tour) =>
      [tour?.title, tour?.location].some((value) => String(value || "").toLowerCase().includes(term)),
    );
  }, [sortedTours, query]);

  const configuredVehicleOptions = useMemo(
    () =>
      (settings?.bookingPricing?.vehicleTypes || [])
        .filter((item) => item?.active !== false && String(item?.key || "").trim())
        .map((item) => ({
          key: String(item.key).trim(),
          label: String(item.label || item.key).trim(),
        })),
    [settings],
  );

  const vehicleOptions = useMemo(() => {
    const selectedKeys = normalizeKeyList(form.vehicleTypeKeys);
    const optionMap = new Map(configuredVehicleOptions.map((item) => [item.key, item]));

    selectedKeys.forEach((key) => {
      if (!optionMap.has(key)) optionMap.set(key, { key, label: key });
    });

    return Array.from(optionMap.values());
  }, [configuredVehicleOptions, form.vehicleTypeKeys]);

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const uploaded = await readFileAsDataUrl(file);
      setForm((prev) => ({ ...prev, image: uploaded }));
      setErrors((prev) => ({ ...prev, image: undefined }));
    } catch {
      toast.error("Upload failed", "Could not read the selected image.");
    }

    event.target.value = "";
  };

  const handleGalleryUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    try {
      const uploaded = await Promise.all(files.map((file) => readFileAsDataUrl(file)));
      setForm((prev) => ({
        ...prev,
        galleryText: normalizeGalleryText([...parseGalleryText(prev.galleryText), ...uploaded]),
      }));
    } catch {
      toast.error("Upload failed", "Could not read one or more selected gallery images.");
    }

    event.target.value = "";
  };

  const printTourPdf = (tour) => {
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    win.document.write(String(html`
      <html>
        <head>
          <title>${tour.title} - Tour PDF</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #2B2B2B; }
            h1 { margin-bottom: 8px; }
            .meta { margin: 18px 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
            .card { border: 1px solid #e2e8f0; border-radius: 16px; padding: 14px; }
            img { width: 100%; max-height: 340px; object-fit: cover; border-radius: 18px; margin: 18px 0; }
            .label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; }
            .value { font-size: 16px; font-weight: 700; margin-top: 6px; }
            p { line-height: 1.65; }
          </style>
        </head>
        <body>
          <h1>${tour.title}</h1>
          <p>${tour.shortDescription || "Custom designed tour package."}</p>
          ${safeUrl(tour.image) ? html`<img src="${safeUrl(tour.image)}" alt="${tour.title}" />` : ""}
          <div class="meta">
            <div class="card"><div class="label">Location</div><div class="value">${tour.location || "-"}</div></div>
            <div class="card"><div class="label">Duration</div><div class="value">${tour.durationLabel || html`${tour.durationDays} Days`}</div></div>
            <div class="card"><div class="label">Price</div><div class="value">${tour.currency} ${tour.price}</div></div>
            <div class="card"><div class="label">Seats</div><div class="value">${tour.availableSeats || "-"}</div></div>
          </div>
          <div class="card">
            <div class="label">Summary</div>
            <p>${tour.shortDescription || "No summary added yet."}</p>
          </div>
          ${Array.isArray(tour.itinerary) && tour.itinerary.length
            ? html`<div class="card" style="margin-top: 16px;"><div class="label">Itinerary</div>${tour.itinerary
                .map(
                  (item) => html`<div style="margin-top: 14px;"><p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#20b77a;">Day ${item.day || ""}${item.title ? html` - ${item.title}` : ""}</p><p style="margin:0;line-height:1.7;">${item.description || "No details added."}</p></div>`,
                )}</div>`
            : ""}
        </body>
      </html>
    `));
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 350);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setSubmitError("Please fix the highlighted fields.");
      return;
    }
    setSubmitError("");

    const syncedSeats = Math.max(0, Number(form.availableSeats || 0));
    const payload = {
      ...form,
      currency: displayCurrency(form.currency || settings?.currency || "PKR"),
      capacity: syncedSeats,
      availableSeats: syncedSeats,
      gallery: parseGalleryText(form.galleryText),
      places: form.placesText.split("\n").map((item) => item.trim()).filter(Boolean),
      itinerary: form.itinerary
        .map((item, index) => ({
          day: index + 1,
          title: String(item?.title || "").trim(),
          description: String(item?.description || "").trim(),
        }))
        .filter((item) => item.title || item.description),
      availableOptions: {
        hotelCategories: form.hotelCategoryKeys
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        vehicleTypes: normalizeKeyList(form.vehicleTypeKeys),
      },
    };

    try {
      if (editing) {
        await updateTour.mutateAsync({ id: editing.id, ...payload });
        toast.success(
          "Tour updated",
          form.status === "published"
            ? "The tour is updated on the public site."
            : "Saved as draft. It will not appear publicly until published.",
        );
      } else {
        const createdTour = await createTour.mutateAsync(payload);
        if (sourceBookingId) {
          await updateBooking.mutateAsync({ id: sourceBookingId, designedTour: createdTour.id });
        }
        toast.success(
          sourceBookingId ? "Itinerary created" : "Tour created",
          form.status === "published"
            ? "The tour is now available on the public site."
            : "Saved as draft. It will not appear publicly until published.",
        );
        if (sourceBookingId) {
          navigate(`/admin/bookings/${sourceBookingId}`, {
            replace: true,
            state: { createdTourId: createdTour.id, createdFromQuery: true },
          });
          return;
        }
      }
      resetForm();
    } catch (error) {
      const message = getApiErrorMessage(error, "Could not save tour.");
      setSubmitError(message);
      toast.error("Save failed", message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTour.mutateAsync(id);
      toast.success("Tour deleted", "The tour has been removed.");
    } catch (error) {
      toast.error("Delete failed", getApiErrorMessage(error, "Could not delete tour."));
    }
  };

  const confirmDelete = async (tour) => {
    const ok = await confirm({
      title: "Delete tour?",
      description: `This will remove ${tour.title} from the tour list. This cannot be undone.`,
      confirmLabel: "Delete tour",
      cancelLabel: "Keep tour",
    });
    if (ok) handleDelete(tour.id);
  };

  const openCreate = () => {
    setEditing(null);
    setSourceBookingId("");
    setSourceBookingCode("");
    openForm({ ...initialForm, currency: defaultCurrency });
  };

  const openEdit = (tour) => {
    setEditing(tour);
    setSourceBookingId("");
    setSourceBookingCode("");
    openForm({
      ...initialForm,
      ...tour,
      currency: displayCurrency(tour.currency || settings?.currency || "PKR"),
      image: tour.image,
      galleryText: normalizeGalleryText(tour.gallery),
      placesText: (tour.places || []).join("\n"),
      hotelCategoryKeys: tour.availableOptions?.hotelCategories?.join(", ") || "",
      vehicleTypeKeys: normalizeKeyList(tour.availableOptions?.vehicleTypes),
      itinerary: Array.isArray(tour.itinerary) && tour.itinerary.length
        ? tour.itinerary.map((item, index) => ({
            day: Number(item?.day || index + 1),
            title: item?.title || "",
            description: item?.description || "",
          }))
        : initialForm.itinerary,
    });
  };

  const requestClose = async () => {
    if (isSaving) return;
    if (JSON.stringify(form) !== baseline) {
      const discard = await confirm({
        title: "Discard changes?",
        description: "Your edits to this tour have not been saved.",
        confirmLabel: "Discard changes",
        cancelLabel: "Keep editing",
      });
      if (!discard) return;
    }
    resetForm();
  };

  const tourActions = (tour) => [
    { label: "Edit", icon: Pencil, onClick: () => openEdit(tour) },
    { label: "Print PDF", icon: Printer, onClick: () => printTourPdf(tour) },
    { label: "Delete", icon: Trash2, danger: true, onClick: () => confirmDelete(tour) },
  ];

  const tourBadges = (tour) => (
    <div className="flex flex-wrap items-center gap-1.5">
      <StatusBadge status={tour.status || "draft"} />
      {tour.featured ? <Badge tone="brand">Featured</Badge> : null}
      {isRecentlyAdded(tour?.createdAt) ? <Badge tone="info">New</Badge> : null}
    </div>
  );

  const drawerTitle = editing ? "Edit tour" : sourceBookingId ? "Create itinerary tour" : "Add tour";
  const saveLabel = editing ? "Save changes" : sourceBookingId ? "Create itinerary" : "Create tour";

  let body;
  if (isLoading) {
    body = <SkeletonRows rows={5} />;
  } else if (isError) {
    body = <ErrorState description={getApiErrorMessage(loadError, "The tour list could not be loaded.")} onRetry={() => refetch()} />;
  } else if (!sortedTours.length) {
    body = (
      <EmptyState
        icon={MapIcon}
        title="No tours yet"
        description="Create your first tour package to show it on the website."
        action={<Button variant="primary" icon={Plus} onClick={openCreate}>Add tour</Button>}
      />
    );
  } else if (!visibleTours.length) {
    body = (
      <EmptyState
        icon={Search}
        title="No matching tours"
        description={`Nothing matches “${query.trim()}”.`}
        action={<Button size="sm" onClick={() => setQuery("")}>Clear search</Button>}
      />
    );
  } else {
    body = (
      <>
        <ul className="divide-y divide-line md:hidden">
          {visibleTours.map((tour) => (
            <li key={tour.id} className="flex items-start gap-3 px-4 py-3.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-navy-900">{tour.title}</p>
                <p className="truncate text-[13px] text-subtle">{tour.location || "—"}</p>
                <p className="mt-1 text-[13px] text-body">
                  {formatTourPrice(tour)} <span className="text-subtle">per day · {formatDuration(tour)} · {tour.availableSeats ?? "—"} seats</span>
                </p>
                <div className="mt-2">{tourBadges(tour)}</div>
              </div>
              <RowActions actions={tourActions(tour)} />
            </li>
          ))}
        </ul>
        <div className="admin-table-wrap hidden md:block">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Tour</th>
                <th scope="col">Price per day</th>
                <th scope="col">Duration</th>
                <th scope="col">Seats</th>
                <th scope="col">Status</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {visibleTours.map((tour) => (
                <tr key={tour.id}>
                  <td className="max-w-80">
                    <p className="cell-primary truncate">{tour.title}</p>
                    <p className="truncate text-[13px] text-subtle">{tour.location || "—"}</p>
                  </td>
                  <td className="whitespace-nowrap font-medium text-navy-900">{formatTourPrice(tour)}</td>
                  <td className="whitespace-nowrap">{formatDuration(tour)}</td>
                  <td>{tour.availableSeats ?? "—"}</td>
                  <td>{tourBadges(tour)}</td>
                  <td><RowActions actions={tourActions(tour)} /></td>
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
        title="Tours"
        description="Manage the tour packages shown on the website."
        actions={<Button variant="primary" icon={Plus} onClick={openCreate}>Add tour</Button>}
      />

      <Card flush>
        {!isLoading && !isError && sortedTours.length ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
            <div className="relative w-full sm:w-72">
              <Search size={15} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
              <Input
                type="search"
                aria-label="Search tours"
                placeholder="Search by title or location"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9"
              />
            </div>
            <p className="text-[13px] text-subtle">
              {visibleTours.length === sortedTours.length ? `${sortedTours.length} tours` : `${visibleTours.length} of ${sortedTours.length} tours`}
            </p>
          </div>
        ) : null}
        {body}
      </Card>

      <Drawer
        open={isFormOpen}
        onOpenChange={(open) => { if (!open) requestClose(); }}
        size="xl"
        title={drawerTitle}
        description={editing ? editing.title : "Save as draft to review later, or publish when it is ready."}
        footer={
          <>
            <Button onClick={requestClose} disabled={isSaving}>Cancel</Button>
            <Button type="submit" form={FORM_ID} variant="primary" loading={isSaving}>{saveLabel}</Button>
          </>
        }
      >
        <TourForm
          id={FORM_ID}
          form={form}
          setForm={setForm}
          errors={errors}
          submitError={submitError}
          sourceBookingId={sourceBookingId}
          sourceBookingCode={sourceBookingCode}
          configuredVehicleOptions={configuredVehicleOptions}
          vehicleOptions={vehicleOptions}
          defaultCurrency={defaultCurrency}
          onImageUpload={handleImageUpload}
          onGalleryUpload={handleGalleryUpload}
          onSubmit={onSubmit}
        />
      </Drawer>
    </div>
  );
};

export default TourManagement;
