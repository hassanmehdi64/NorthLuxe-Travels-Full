import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import FeaturePageHeader from "../../components/features/FeaturePageHeader";
import { useCreateContact } from "../../hooks/useCms";
import { useToast } from "../../context/ToastContext";

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  destinations: "",
  travelWindow: "",
  guests: 2,
  budget: "",
  budgetTier: "balanced",
  budgetMode: "total_trip",
  hotelPreference: "4_star",
  vehiclePreference: "premium_suv",
  requirements: "",
};

const CustomPlanRequest = () => {
  const location = useLocation();
  const createContact = useCreateContact();
  const toast = useToast();
  const sourceTour = location.state?.sourceTour || null;
  const [form, setForm] = useState(() => ({
    ...INITIAL_FORM,
    destinations: sourceTour?.location || "",
    budget:
      sourceTour?.price && sourceTour?.currency
        ? `${sourceTour.currency} ${sourceTour.price}`
        : "",
  }));
  const [submitting, setSubmitting] = useState(false);

  const subject = useMemo(
    () =>
      sourceTour?.title
        ? `Custom Tour Plan Request - Based on ${sourceTour.title}`
        : "Custom Tour Plan Request",
    [sourceTour?.title],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error("Missing details", "Please fill name, email, and phone.");
      return;
    }

    const message = [
      `Source Tour: ${sourceTour?.title || "N/A"}`,
      `Preferred Destinations: ${form.destinations || "Flexible"}`,
      `Travel Window: ${form.travelWindow || "Flexible"}`,
      `Guests: ${Number(form.guests || 1)}`,
      `Budget: ${form.budget || "Not specified"}`,
      `Budget Mode: ${form.budgetMode}`,
      `Budget Tier: ${form.budgetTier}`,
      `Hotel Preference: ${form.hotelPreference}`,
      `Vehicle Preference: ${form.vehiclePreference}`,
      `Requirements: ${form.requirements || "None"}`,
    ].join("\n");

    setSubmitting(true);
    try {
      await createContact.mutateAsync({
        sender: form.name,
        email: form.email,
        subject,
        message,
      });
      toast.success("Request submitted", "Our travel specialist will contact you soon.");
      setForm(INITIAL_FORM);
    } catch (error) {
      toast.error(
        "Submission failed",
        error?.response?.data?.message || "Please try again in a moment.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-theme-bg min-h-[70vh]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <FeaturePageHeader
          eyebrow="Tailored Planning"
          title="Custom Tour"
          highlight="Plan Request"
          description="Share your budget and preferences to receive a tour plan tailored to your comfort and spending level."
        />

        <form onSubmit={handleSubmit} className="ql-form-shell p-7 grid md:grid-cols-2 gap-4">
          <label>
            <span className="ql-label">Full Name</span>
            <input
              className="ql-input"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </label>
          <label>
            <span className="ql-label">Email</span>
            <input
              type="email"
              className="ql-input"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
          </label>
          <label>
            <span className="ql-label">Phone</span>
            <input
              className="ql-input"
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </label>
          <label>
            <span className="ql-label">Travel Window</span>
            <input
              className="ql-input"
              placeholder="e.g. June 2026, 7-10 days"
              value={form.travelWindow}
              onChange={(e) => setForm((prev) => ({ ...prev, travelWindow: e.target.value }))}
            />
          </label>
          <label className="md:col-span-2">
            <span className="ql-label">Preferred Destinations</span>
            <input
              className="ql-input"
              placeholder="Hunza, Skardu, Fairy Meadows..."
              value={form.destinations}
              onChange={(e) => setForm((prev) => ({ ...prev, destinations: e.target.value }))}
            />
          </label>
          <label>
            <span className="ql-label">Guests</span>
            <input
              type="number"
              min={1}
              className="ql-input"
              value={form.guests}
              onChange={(e) => setForm((prev) => ({ ...prev, guests: Number(e.target.value || 1) }))}
            />
          </label>
          <label>
            <span className="ql-label">Estimated Budget</span>
            <input
              className="ql-input"
              placeholder="e.g. PKR 350,000"
              value={form.budget}
              onChange={(e) => setForm((prev) => ({ ...prev, budget: e.target.value }))}
            />
          </label>
          <label>
            <span className="ql-label">Budget Type</span>
            <select
              className="ql-select"
              value={form.budgetMode}
              onChange={(e) => setForm((prev) => ({ ...prev, budgetMode: e.target.value }))}
            >
              <option value="total_trip">Total Trip Budget</option>
              <option value="per_person">Per Person Budget</option>
            </select>
          </label>
          <label>
            <span className="ql-label">Budget Preference</span>
            <select
              className="ql-select"
              value={form.budgetTier}
              onChange={(e) => setForm((prev) => ({ ...prev, budgetTier: e.target.value }))}
            >
              <option value="budget_friendly">Budget Friendly</option>
              <option value="balanced">Balanced</option>
              <option value="premium">Premium Comfort</option>
              <option value="luxury">Luxury</option>
            </select>
          </label>
          <label>
            <span className="ql-label">Hotel Preference</span>
            <select
              className="ql-select"
              value={form.hotelPreference}
              onChange={(e) => setForm((prev) => ({ ...prev, hotelPreference: e.target.value }))}
            >
              <option value="no_hotel">No Hotel</option>
              <option value="3_star">3 Star</option>
              <option value="4_star">4 Star</option>
              <option value="5_star">5 Star</option>
            </select>
          </label>
          <label>
            <span className="ql-label">Vehicle Preference</span>
            <select
              className="ql-select"
              value={form.vehiclePreference}
              onChange={(e) => setForm((prev) => ({ ...prev, vehiclePreference: e.target.value }))}
            >
              <option value="standard_suv">Standard SUV</option>
              <option value="premium_suv">Premium SUV</option>
              <option value="hiace">Hiace / Van</option>
            </select>
          </label>
          <label className="md:col-span-2">
            <span className="ql-label">Special Requirements</span>
            <textarea
              rows={4}
              className="ql-textarea"
              placeholder="Tell us your travel style, activities, comfort needs, or route requests."
              value={form.requirements}
              onChange={(e) => setForm((prev) => ({ ...prev, requirements: e.target.value }))}
            />
          </label>
          <div className="md:col-span-2">
            <button type="submit" className="ql-btn-primary w-full" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Custom Plan Request"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default CustomPlanRequest;
