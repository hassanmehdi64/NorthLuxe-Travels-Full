const BookingDropdown = ({ value, onChange, options = [], placeholder = "Select an option", disabled = false }) => {
  const selectedOption = options.find((item) => String(item.value) === String(value ?? ""));
  return (
    <div className="min-w-0">
      <select className="ql-input booking-native-select" value={value ?? ""} disabled={disabled} onChange={(event) => {
        const option = options.find((item) => String(item.value) === event.target.value);
        onChange(option ? option.value : event.target.value);
      }}>
        {!options.some((item) => String(item.value) === "") && <option value="" disabled>{placeholder}</option>}
        {options.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
      {selectedOption?.description && <p className="mt-1 text-[11px] leading-5 text-muted">{selectedOption.description}</p>}
    </div>
  );
};

export default BookingDropdown;
