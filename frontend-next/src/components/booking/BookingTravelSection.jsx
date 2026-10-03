import BookingDropdown from "./BookingDropdown";
import BookingDateField from "./BookingDateField";

const BookingTravelSection = ({
  form,
  setForm,
  visibleHotelOptions,
  visibleVehicleOptions,
  isTravelSectionValid,
  onBack,
  onNext,
}) => (
  <div className="space-y-4 py-1 sm:space-y-5">
    <div className="space-y-1">
      <p className="text-[15px] font-semibold text-theme">When and how?</p>
      <p className="mt-1 text-xs text-muted">Choose your dates, group size and travel preferences.</p>
    </div>
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        <label>
          <span className="ql-label">Start Date</span>
          <BookingDateField
            placeholder="Select start date"
            value={form.travelDate}
            onChange={(nextValue) =>
              setForm((p) => ({ ...p, travelDate: nextValue }))
            }
          />
        </label>
        <label>
          <span className="ql-label">End Date</span>
          <BookingDateField
            disabled={form.flexibleDates}
            placeholder="Select end date"
            value={form.endDate}
            onChange={(nextValue) =>
              setForm((p) => ({ ...p, endDate: nextValue }))
            }
          />
          {form.travelDate && form.endDate && form.endDate < form.travelDate ? (
            <span className="mt-1 block text-xs text-red-500">End date cannot be before travel date.</span>
          ) : null}
        </label>
        <label className="booking-check-field md:col-span-2">
          <input
            type="checkbox"
            className="ql-check"
            checked={form.flexibleDates}
            onChange={(e) =>
              setForm((p) => ({ ...p, flexibleDates: e.target.checked }))
            }
          />
          <span>My travel dates are flexible</span>
        </label>
      </div>
    </div>

    <div className="border-t border-booking pt-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="space-y-2">
          <span className="ql-label mb-0 text-[10px] normal-case tracking-[0.08em]">Departure Time</span>
          <BookingDropdown
            value={form.travelTime}
            placeholder="No Preference"
            onChange={(nextValue) =>
              setForm((p) => ({ ...p, travelTime: nextValue }))
            }
            options={[
              { value: "", label: "No Preference" },
              { value: "early_morning", label: "Early Morning (6am - 9am)" },
              { value: "morning", label: "Morning (9am - 12pm)" },
              { value: "afternoon", label: "Afternoon (12pm - 4pm)" },
              { value: "evening", label: "Evening (4pm - 8pm)" },
            ]}
          />
        </label>

        <label className="space-y-2">
          <span className="ql-label mb-0 text-[10px] normal-case tracking-[0.08em]">Adults</span>
          <input
            type="number"
            min={1}
            className="ql-input"
            value={form.adults}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                adults: Number(e.target.value || 1),
              }))
            }
          />
        </label>

        <label className="space-y-2">
          <span className="ql-label mb-0 text-[10px] normal-case tracking-[0.08em]">Child Below 3</span>
          <input
            type="number"
            min={0}
            className="ql-input"
            value={form.children}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                children: Number(e.target.value || 0),
              }))
            }
          />
        </label>
      </div>
    </div>

    <div className="space-y-4 border-t border-booking pt-4">
      <label className="booking-check-field">
        <input
          type="checkbox"
          className="ql-check"
          checked={form.facilities.hotelEnabled}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              facilities: {
                ...p.facilities,
                hotelEnabled: e.target.checked,
              },
            }))
          }
        />
        <span>Include hotel stay</span>
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label>
          <span className="ql-label">Hotel Category</span>
          <BookingDropdown
            value={form.facilities.hotelType}
            disabled={!form.facilities.hotelEnabled}
            onChange={(nextValue) =>
              setForm((p) => ({
                ...p,
                facilities: {
                  ...p.facilities,
                  hotelType: nextValue,
                },
              }))
            }
            options={visibleHotelOptions.map((item) => ({
              value: item.key,
              label: item.label,
            }))}
          />
        </label>

        <label>
          <span className="ql-label">Vehicle Type</span>
          <BookingDropdown
            value={form.facilities.vehicleType}
            onChange={(nextValue) =>
              setForm((p) => ({
                ...p,
                facilities: {
                  ...p.facilities,
                  vehicleType: nextValue,
                },
              }))
            }
            options={visibleVehicleOptions.map((item) => ({
              value: item.key,
              label: item.label,
            }))}
          />
        </label>
      </div>
    </div>

    <label className="block">
      <span className="ql-label">Special Requirements</span>
      <textarea
        className="ql-textarea"
        rows={3}
        placeholder="Dietary preferences, accessibility needs, or trip notes."
        value={form.specialRequirements}
        onChange={(e) =>
          setForm((p) => ({ ...p, specialRequirements: e.target.value }))
        }
      />
    </label>

    <div className="flex flex-col-reverse gap-3 border-t border-booking pt-4 sm:flex-row sm:justify-between">
      <button
        type="button"
        className="ql-btn-secondary w-full sm:w-auto"
        onClick={onBack}
      >
        Back
      </button>
      <button
        type="button"
        className="ql-btn-primary w-full sm:w-auto"
        disabled={!isTravelSectionValid}
        onClick={onNext}
      >
        Continue
      </button>
    </div>
  </div>
);

export default BookingTravelSection;
