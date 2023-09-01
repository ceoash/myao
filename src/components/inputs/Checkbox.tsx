"use client";

interface CheckboxProps {
  id: string;
  label: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
  radio?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  id,
  label,
  checked,
  onChange,
  onClick,
  radio

}) => {
  return (
    <div className="
      flex
      items-center
      mr-4
    ">
      <input
        id={id}
        name={id}
        value={id}
        type={`${radio ? "radio" : "checkbox"}`}
        checked={checked}
        onChange={onChange}
        onClick={onClick}
        className="
          w-4
          h-4
          accent-pink-500
          bg-gray-100
          border-gray-300
          rounded
          focus:ring-orange-500
          focus:ring-2"
      />
      <label
      htmlFor={id}
      className="
        ml-2
        text-sm
        font-medium
        text-gray-900
      ">
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
