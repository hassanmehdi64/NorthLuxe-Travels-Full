import DatePickerField from "../forms/DatePickerField";

/** Custom-trip date input: the shared styled date picker (no native browser date box). */
const BookingDateField = ({ value, onChange, placeholder = "Select date", minDate, ...rest }) => (
  <DatePickerField value={value || ""} onChange={onChange} placeholder={placeholder} minDate={minDate} aria-label={placeholder} {...rest} />
);

export default BookingDateField;
