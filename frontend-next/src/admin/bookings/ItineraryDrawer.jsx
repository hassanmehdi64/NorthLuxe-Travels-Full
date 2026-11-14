"use client";

import { ChevronDown, Plus, Printer, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Drawer, Field, IconButton, Input, Select, Textarea } from "../ui";

const FORM_ID = "booking-itinerary-form";

/**
 * Create/edit form for a booking's custom itinerary. Pure presentation: the
 * parent owns the form state, the save handler and the print handler.
 */
const ItineraryDrawer = ({
  open,
  onOpenChange,
  isEditing,
  form,
  setForm,
  openPlanDay,
  setOpenPlanDay,
  onSubmit,
  onPrint,
  saving,
  titleError,
  saveError,
}) => {
  const setField = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const updateDay = (index, key, value) =>
    setForm((prev) => ({
      ...prev,
      planDays: prev.planDays.map((dayItem, dayIndex) => (dayIndex === index ? { ...dayItem, [key]: value } : dayItem)),
    }));

  const addDay = () => {
    setForm((prev) => ({
      ...prev,
      planDays: [...prev.planDays, { title: "", plan: "" }],
    }));
    setOpenPlanDay(form.planDays.length);
  };

  const removeDay = (index) => {
    setForm((prev) => ({
      ...prev,
      planDays: prev.planDays.filter((_, dayIndex) => dayIndex !== index),
    }));
    setOpenPlanDay((prev) => {
      if (prev === index) return Math.max(0, index - 1);
      if (prev > index) return prev - 1;
      return prev;
    });
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        if (!saving) onOpenChange(next);
      }}
      size="xl"
      title={isEditing ? "Edit itinerary" : "Create itinerary"}
      description="Prefilled from the booking. Update the plan and save it to this booking."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            Close
          </Button>
          <Button icon={Printer} onClick={onPrint} disabled={saving || !String(form.title || "").trim()}>
            Print itinerary
          </Button>
          <Button variant="primary" type="submit" form={FORM_ID} loading={saving}>
            Save itinerary
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} noValidate className="space-y-6">
        {saveError ? (
          <p role="alert" className="rounded-control border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {saveError}
          </p>
        ) : null}

        <fieldset disabled={saving} className="grid gap-4 sm:grid-cols-2">
          <legend className="sr-only">Plan summary</legend>
          <Field label="Itinerary title" required error={titleError} className="sm:col-span-2">
            <Input value={form.title} onChange={setField("title")} />
          </Field>
          <Field label="Route">
            <Input value={form.route} onChange={setField("route")} />
          </Field>
          <Field label="Duration">
            <Input value={form.durationLabel} onChange={setField("durationLabel")} />
          </Field>
          <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-3">
            <Field label="Currency">
              <Input value={form.currency} onChange={setField("currency")} />
            </Field>
            <Field label="Final budget">
              <Input
                type="number"
                min="0"
                inputMode="decimal"
                value={form.finalBudget}
                onChange={(e) => setForm((prev) => ({ ...prev, finalBudget: Number(e.target.value || 0) }))}
              />
            </Field>
          </div>
          <Field label="Plan status">
            <Select value={form.status} onChange={setField("status")}>
              <option value="draft">Draft</option>
              <option value="final">Final</option>
            </Select>
          </Field>
          <Field label="Hotel plan">
            <Input value={form.hotelPlan} onChange={setField("hotelPlan")} />
          </Field>
          <Field label="Vehicle plan">
            <Input value={form.vehiclePlan} onChange={setField("vehiclePlan")} />
          </Field>
        </fieldset>

        <fieldset disabled={saving} aria-labelledby={`${FORM_ID}-days`}>
          <div className="mb-2 flex items-center justify-between gap-3">
            <h3 id={`${FORM_ID}-days`} className="text-[13px] font-semibold text-navy-900">Day-wise itinerary</h3>
            <Button size="sm" variant="ghost" icon={Plus} onClick={addDay}>
              Add day
            </Button>
          </div>
          <ol className="divide-y divide-line rounded-card border border-line">
            {form.planDays.map((item, index) => {
              const expanded = openPlanDay === index;
              const panelId = `${FORM_ID}-day-${index}`;
              return (
                <li key={`itinerary-day-${index}`}>
                  <div className="flex items-center gap-1 pr-2">
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={panelId}
                      onClick={() => setOpenPlanDay((prev) => (prev === index ? -1 : index))}
                      className="flex min-w-0 flex-1 items-center gap-2 px-4 py-3 text-left"
                    >
                      <ChevronDown
                        size={15}
                        aria-hidden="true"
                        className={cn("shrink-0 text-subtle transition-transform", expanded && "rotate-180")}
                      />
                      <span className="truncate text-sm font-medium text-navy-900">
                        {`Day ${index + 1}${item.title ? `: ${item.title}` : ""}`}
                      </span>
                    </button>
                    {form.planDays.length > 1 ? (
                      <IconButton label={`Remove day ${index + 1}`} icon={Trash2} variant="danger" size="sm" iconSize={15} onClick={() => removeDay(index)} />
                    ) : null}
                  </div>
                  {expanded ? (
                    <div id={panelId} className="space-y-3 px-4 pb-4">
                      <Field label="Day title">
                        <Input value={item.title} onChange={(e) => updateDay(index, "title", e.target.value)} placeholder="e.g. Arrival in Hunza" />
                      </Field>
                      <Field label="Plan">
                        <Textarea rows={4} value={item.plan} onChange={(e) => updateDay(index, "plan", e.target.value)} placeholder="Short day plan" />
                      </Field>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </fieldset>

        <fieldset disabled={saving}>
          <legend className="sr-only">Notes</legend>
          <Field label="Extra notes">
            <Textarea rows={4} value={form.planDetails} onChange={setField("planDetails")} placeholder="Anything else the customer should know" />
          </Field>
        </fieldset>
      </form>
    </Drawer>
  );
};

export default ItineraryDrawer;
