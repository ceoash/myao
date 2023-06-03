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
    <div className="w-full relative">
      {formatPrice && (
        <BiPound
          className={`absolute ${modal ? "top-10" : "top-4"} left-2 text-neutral-700`}
          size={24}
        />
      )}
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        disabled={disabled}
        placeholder=" "
        type={type}
        value={value}
        className={`
          peer
          w-full
          p-2
          font-light
          bg-white
          border-2
          rounded-md
          outline-none
          transition
          disabled:cursor-not-allowed
          disabled:opacity-50
          my-2
          ${formatPrice ? "pl-10" : "pl-4"}
          ${errors ? "border-red-500" : "border-neutral-200"}
          ${errors ? "text-red-500" : "text-neutral-700"}
        `}
        {...register(id, {
          required: required && "This field is required",
          ...registerOptions,
        })}
      />
      {errors && errors[id] && <div>{String(errors[id]?.message)}</div>}
    </div>
  );
};

export default Input;
