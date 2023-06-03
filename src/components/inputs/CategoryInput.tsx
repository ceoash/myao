"use client";

import { IconType } from "react-icons/lib";
import { UseFormRegister } from "react-hook-form";
import { BiCheck } from "react-icons/bi";
import { IoCheckbox } from "react-icons/io5";

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
            text-sm
            cursor-pointer
            transition
            duration-200
            rounded
            px-2
            py-[1px]
            flex
            items-center
            gap-2
            ${selected ? "bg-neutral-100" : ""} 
        `}
    >
    <IoCheckbox className={`${selected && 'text-orange-default'}`}/> 
      <div className="text-sm">{name}</div>
    </div>
  );
};

export default CategoryInput;
