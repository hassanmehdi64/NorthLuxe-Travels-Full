import SelectMenu from "../forms/SelectMenu";

/** Custom-trip form dropdown: the shared SelectMenu plus the chosen option's description. */
const BookingDropdown = ({ value, onChange, options = [], placeholder = "Select an option", disabled = false, ...rest }) => {
  const selectedOption = options.find((item) => String(item.value) === String(value ?? ""));
  return (
    <div className="min-w-0">
      <SelectMenu value={value} onChange={onChange} options={options} placeholder={placeholder} disabled={disabled} {...rest} />
      {selectedOption?.description && <p className="mt-1.5 text-xs leading-5 text-subtle">{selectedOption.description}</p>}
    </div>
  );
};

export default BookingDropdown;
