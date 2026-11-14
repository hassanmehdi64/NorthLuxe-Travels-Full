import { useId } from "react";
import SelectMenu from "../forms/SelectMenu";

const BlogCategories = ({ categories, active, onChange }) => {
  const labelId = useId();
  return (
    <div className="mt-4">
      <p id={labelId} className="mb-1.5 text-[13px] font-semibold text-navy-900">Category</p>
      <SelectMenu
        size="sm"
        aria-labelledby={labelId}
        value={active}
        onChange={onChange}
        options={categories.map((category) => ({ value: category, label: category === "All" ? "All articles" : category }))}
      />
    </div>
  );
};

export default BlogCategories;
