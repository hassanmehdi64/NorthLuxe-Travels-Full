import { useRef, useState } from "react";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { Button, Checkbox, Field, IconButton, Input, Select, Switch, Textarea } from "../ui";
import { CURRENCY_OPTIONS } from "../../utils/currency";
import { parseMediaList } from "../../lib/mediaList.mjs";

export const normalizeKeyList = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item || "").trim()).filter(Boolean);
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const mergeUniqueKeys = (...lists) => Array.from(new Set(lists.flatMap((list) => normalizeKeyList(list))));

export const parseGalleryText = (value) => parseMediaList(value);

/** Section inside the tour drawer: small heading, optional description, then fields. */
const Section = ({ title, description, actions, children }) => (
  <section className="border-t border-line pt-5 first:border-t-0 first:pt-0">
    <div className="mb-3 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-navy-900">{title}</h3>
        {description && <p className="mt-0.5 text-[13px] leading-relaxed text-subtle">{description}</p>}
      </div>
      {actions}
    </div>
    {children}
  </section>
);

/** Button that opens a hidden file picker. */
const UploadButton = ({ label, multiple = false, onChange }) => {
  const inputRef = useRef(null);
  return (
    <>
      <Button size="sm" icon={Upload} onClick={() => inputRef.current?.click()}>{label}</Button>
      <input ref={inputRef} type="file" accept="image/*" multiple={multiple} className="hidden" onChange={onChange} tabIndex={-1} aria-hidden="true" />
    </>
  );
};

/**
 * Body of the create/edit tour drawer. Purely presentational: state, payload
 * building and saving live in TourManagement.
 */
const TourForm = ({
  id,
  form,
  setForm,
  errors = {},
  submitError,
  sourceBookingId,
  sourceBookingCode,
  configuredVehicleOptions,
  vehicleOptions,
  defaultCurrency,
  onImageUpload,
  onGalleryUpload,
  onSubmit,
}) => {
  const [customVehicleInput, setCustomVehicleInput] = useState("");
  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));
  const setNumber = (key) => (e) => setForm((p) => ({ ...p, [key]: Number(e.target.value) }));

  const selectedVehicleKeys = normalizeKeyList(form.vehicleTypeKeys);
  const galleryCount = parseGalleryText(form.galleryText).length;

  const addVehicleOption = () => {
    const nextVehicle = String(customVehicleInput || "").trim();
    if (!nextVehicle) return;
    setForm((prev) => ({ ...prev, vehicleTypeKeys: mergeUniqueKeys(prev.vehicleTypeKeys, [nextVehicle]) }));
    setCustomVehicleInput("");
  };

  const toggleVehicle = (key, isSelected) =>
    setForm((prev) => ({
      ...prev,
      vehicleTypeKeys: isSelected
        ? normalizeKeyList(prev.vehicleTypeKeys).filter((item) => item !== key)
        : mergeUniqueKeys(prev.vehicleTypeKeys, [key]),
    }));

  const updateDay = (index, key, value) =>
    setForm((p) => ({
      ...p,
      itinerary: p.itinerary.map((entry, entryIndex) => (entryIndex === index ? { ...entry, [key]: value } : entry)),
    }));

  const customVehicleKeys = selectedVehicleKeys.filter((key) => !configuredVehicleOptions.some((item) => item.key === key));

  return (
    <form id={id} onSubmit={onSubmit} noValidate className="space-y-5">
      {submitError && (
        <div role="alert" className="rounded-control border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {submitError}
        </div>
      )}
      {sourceBookingId && (
        <div className="rounded-control border border-line bg-canvas px-3.5 py-2.5 text-[13px] leading-relaxed text-body">
          Creating an itinerary for custom request <strong className="text-navy-900">{sourceBookingCode || sourceBookingId}</strong>. After saving, it links back to the request automatically.
        </div>
      )}

      <Section title="Basics" description="The main information visitors see first.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" required error={errors.title} className="sm:col-span-2">
            <Input value={form.title} onChange={set("title")} placeholder="e.g. Hunza Valley escape" />
          </Field>
          <Field label="Location" required error={errors.location}>
            <Input value={form.location} onChange={set("location")} placeholder="e.g. Hunza, Gilgit-Baltistan" />
          </Field>
          <Field label="Duration (days)" required>
            <Input type="number" min={0} value={form.durationDays} onChange={setNumber("durationDays")} />
          </Field>
          <Field label="Status" hint="Drafts are hidden from the website.">
            <Select value={form.status} onChange={set("status")}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </Select>
          </Field>
          <div className="flex items-end pb-1">
            <Switch
              id="tour-featured"
              label="Featured"
              description="Give this tour homepage priority."
              checked={Boolean(form.featured)}
              onCheckedChange={(checked) => setForm((p) => ({ ...p, featured: checked }))}
            />
          </div>
        </div>
      </Section>

      <Section title="Pricing & capacity">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Price per day" required>
            <Input type="number" min={0} value={form.price} onChange={setNumber("price")} />
          </Field>
          <Field label="Currency">
            <Select value={form.currency || defaultCurrency} onChange={set("currency")}>
              {CURRENCY_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Seats per departure" hint="Seats are held for 48h when someone books a date, and released if unpaid.">
            <Input type="number" min={0} value={form.availableSeats} onChange={setNumber("availableSeats")} />
          </Field>
        </div>
      </Section>

      <Section title="Media">
        <div className="space-y-4">
          <Field
            label="Cover image"
            required
            error={errors.image}
            hint="Paste an image URL or upload the main tour image."
            labelAction={<UploadButton label="Upload" onChange={onImageUpload} />}
          >
            <Input value={form.image?.startsWith("data:") ? "Uploaded image" : form.image} readOnly={form.image?.startsWith("data:")} onChange={set("image")} placeholder="https://…" />
          </Field>
          {form.image ? (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- preview of a pasted URL or data URL */}
              <img src={form.image} alt="Tour cover preview" className="h-20 w-32 rounded-control border border-line object-cover" />
              <Button size="sm" variant="ghost" icon={X} onClick={() => setForm((p) => ({ ...p, image: "" }))}>Remove cover</Button>
            </div>
          ) : null}
          <Field
            label="Gallery images"
            hint={`One image URL per line. Shown in the website tour gallery${galleryCount ? ` (${galleryCount} added)` : ""}.`}
            labelAction={<UploadButton label="Upload" multiple onChange={onGalleryUpload} />}
          >
            <Textarea rows={3} value={form.galleryText} onChange={set("galleryText")} placeholder="https://…" />
          </Field>
        </div>
      </Section>

      <Section title="Description">
        <div className="space-y-4">
          <Field label="Short description" hint="Shown on tour cards and at the top of the tour page.">
            <Textarea rows={2} value={form.shortDescription} onChange={set("shortDescription")} />
          </Field>
          <Field label="Detailed description">
            <Textarea rows={5} value={form.description} onChange={set("description")} placeholder="Overview, highlights, inclusions and important notes" />
          </Field>
        </div>
      </Section>

      <Section
        title="Itinerary days"
        description="Break the journey into short day blocks."
        actions={
          <Button
            size="sm"
            icon={Plus}
            onClick={() =>
              setForm((p) => ({
                ...p,
                itinerary: [...p.itinerary, { day: p.itinerary.length + 1, title: "", description: "" }],
              }))
            }
          >
            Add day
          </Button>
        }
      >
        <ol className="divide-y divide-line rounded-card border border-line">
          {form.itinerary.map((item, index) => (
            <li key={`tour-itinerary-${index}`} className="flex gap-3 p-3">
              <span className="mt-2 w-12 shrink-0 text-[13px] font-semibold text-brand-700">Day {index + 1}</span>
              <div className="min-w-0 flex-1 space-y-2">
                <Input aria-label={`Day ${index + 1} title`} placeholder="Day title" value={item.title} onChange={(e) => updateDay(index, "title", e.target.value)} />
                <Textarea aria-label={`Day ${index + 1} plan`} rows={2} placeholder="Short day plan" value={item.description} onChange={(e) => updateDay(index, "description", e.target.value)} />
              </div>
              {form.itinerary.length > 1 ? (
                <IconButton
                  label={`Remove day ${index + 1}`}
                  icon={Trash2}
                  variant="danger"
                  size="sm"
                  iconSize={15}
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      itinerary: p.itinerary
                        .filter((_, itineraryIndex) => itineraryIndex !== index)
                        .map((entry, entryIndex) => ({ ...entry, day: entryIndex + 1 })),
                    }))
                  }
                />
              ) : (
                <span className="w-8 shrink-0" aria-hidden="true" />
              )}
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Places covered">
        <Field hint="One place per line. Shown as chips on the tour page; leave empty to hide the section.">
          <Textarea rows={4} aria-label="Places covered" value={form.placesText} onChange={set("placesText")} placeholder={"Altit Fort\nAttabad Lake"} />
        </Field>
      </Section>

      <Section title="What's included" description="Shown on the tour page. Leave empty to hide the section.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Included" hint="One item per line.">
            <Textarea rows={5} value={form.inclusionsText} onChange={set("inclusionsText")} placeholder={"Private vehicle with driver\nFuel and tolls"} />
          </Field>
          <Field label="Not included" hint="One item per line.">
            <Textarea rows={5} value={form.exclusionsText} onChange={set("exclusionsText")} placeholder={"Hotels and meals\nEntry tickets"} />
          </Field>
        </div>
      </Section>

      <Section title="Booking options" description="Which hotel categories and vehicles customers can choose for this tour.">
        <div className="space-y-4">
          <Field label="Hotel category keys" hint="Comma separated, e.g. 3_star, 4_star">
            <Input value={form.hotelCategoryKeys} onChange={set("hotelCategoryKeys")} />
          </Field>

          <fieldset className="min-w-0">
            <legend className="mb-1.5 text-[13px] font-semibold text-navy-900">Vehicle types</legend>
            {configuredVehicleOptions.length ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {configuredVehicleOptions.map((item) => {
                  const isSelected = selectedVehicleKeys.includes(item.key);
                  return (
                    <Checkbox key={item.key} label={item.label} checked={isSelected} onChange={() => toggleVehicle(item.key, isSelected)} />
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-subtle">No vehicle options in Settings › Pricing › Vehicles yet. You can still add custom vehicles for this tour.</p>
            )}

            {customVehicleKeys.length ? (
              <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Custom vehicles">
                {customVehicleKeys.map((key) => (
                  <li key={key} className="inline-flex h-7 items-center gap-1 rounded-full border border-line bg-canvas pl-2.5 pr-0.5 text-xs font-medium text-navy-900">
                    {vehicleOptions.find((item) => item.key === key)?.label || key}
                    <button
                      type="button"
                      aria-label={`Remove ${key}`}
                      onClick={() => toggleVehicle(key, true)}
                      className="grid h-6 w-6 place-items-center rounded-full text-subtle hover:bg-surface hover:text-navy-900"
                    >
                      <X size={12} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-3 flex items-center gap-2">
              <Input
                aria-label="Custom vehicle"
                className="min-w-0 flex-1"
                placeholder="Add a custom vehicle"
                value={customVehicleInput}
                onChange={(e) => setCustomVehicleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addVehicleOption();
                  }
                }}
              />
              <Button icon={Plus} onClick={addVehicleOption} disabled={!customVehicleInput.trim()}>Add</Button>
            </div>
          </fieldset>
        </div>
      </Section>
    </form>
  );
};

export default TourForm;
