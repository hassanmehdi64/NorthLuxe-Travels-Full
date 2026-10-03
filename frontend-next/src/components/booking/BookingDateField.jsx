const BookingDateField = ({ value, onChange, placeholder = "Select date", disabled = false }) => (
  <input type="date" className="ql-input booking-native-date" value={value || ""} disabled={disabled} aria-label={placeholder} onChange={(event) => onChange(event.target.value)} />
);

export default BookingDateField;
