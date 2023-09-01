"use client";

import { set } from "date-fns";

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
  radio,

}) => {
  return (
    <div className="
      flex
      items-center
      mr-4
    ">
      <div
        id={id}
        className={`
          w-4
          h-4
          accent-red-500
          rounded
          !text-white
          !bg-white
          p-1
          border-2
          border-gray-400
          ${checked && "bg-red-500 border-red-500"}
          ${"rounded-full"}
          `}
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
