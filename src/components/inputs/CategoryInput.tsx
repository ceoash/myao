"use client";

import { IconType } from "react-icons/lib";
import { UseFormRegister } from "react-hook-form";
import { ImCheckboxChecked, ImCheckboxUnchecked } from "react-icons/im";

type FormData = {
  [key: string]: string | boolean | number | any;
};

interface CategoryInputProps {
  icon?: IconType;
  name: string;
  selected?: boolean;
  onClick: (value: string) => void;
  register: UseFormRegister<FormData>;
  value?: string;
}

const CategoryInput: React.FC<CategoryInputProps> = ({
  icon: Icon,
  name,
  selected,
  onClick,
}) => {
  return (
    <div
      onClick={() => onClick(name)}
      className={`
            text-[14px]
            cursor-pointer
            transition
            duration-200
            rounded
            px-2
            py-[2px]
            flex
            items-center
            gap-4
            ${selected ? "bg-orange-100" : ""} 
        `}
    >
      {!selected ? (
        <ImCheckboxUnchecked className="" />
      ) : (
        <ImCheckboxChecked className="text-orange-default " />
      )}
      <div className="text-md">{name}</div>
    </div>
  );
};

export default CategoryInput;
