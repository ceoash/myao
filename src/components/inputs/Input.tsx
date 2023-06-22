import React from "react";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
import { BiPound } from "react-icons/bi";
import { RegisterOptions } from "react-hook-form";

interface InputProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  formatPrice?: boolean;
  required?: boolean;
  errors?:   FieldErrors<FieldValues>;
  sm?: boolean;
  value?: string;
  modal?: boolean;
  register: UseFormRegister<FieldValues>;
  registerOptions?: RegisterOptions;
}

const Input: React.FC<InputProps> = ({
  id,
  label,
  type,
  placeholder = "",
  modal,
  disabled,
  formatPrice,
  required,
  errors,
  value,
  register,
  registerOptions,
}) => {
  return (
    <div>
    <div className="w-full  bg-white
          border-2
          rounded-md flex items-center px-2" >
      {formatPrice && (
        <BiPound
          className={` ${modal ? "top-10" : "top-4"} left-2 text-neutral-700`}
          size={24}
        />
      )}
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        disabled={disabled}
        placeholder={placeholder}
        type={type}
        value={value}
        style={{ zIndex: 0 }}
        className={`
          peer
          w-full
          font-light
         
          outline-none
          transition
          disabled:cursor-not-allowed
          disabled:opacity-50          
          my-2
          ${formatPrice ? "pl-10" : "pl-4"}
          ${errors && errors[id] ? "border-red-500" : "border-gray-200"}
          ${errors && errors[id] ? "text-red-500" : "text-gray-700"}
        `}
        {...register(id, {
          required: required && "This field is required",
          ...registerOptions,
        })}
      />
      {errors && errors[id] && <div className="absolute top-0 -mt-4">{String(errors[id]?.message)}</div>}
    </div>
    </div>
  );
};

export default Input;
