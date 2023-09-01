import React from "react";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
import { RegisterOptions } from "react-hook-form";

interface TextAreaProps {
  id: string;
  label?: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  formatPrice?: boolean;
  required?: boolean;
  errors?: FieldErrors<FieldValues>;
  sm?: boolean;
  value?: string;
  register: UseFormRegister<FieldValues>;
  registerOptions?: RegisterOptions;
  username?: boolean;
  rows?: number;
  children?: React.ReactNode;
  clearErrors?: (name?: string | string[]) => void;
  optional?: boolean;
}

const TextArea: React.FC<TextAreaProps> = ({
  id,
  label,
  rows,
  placeholder = "",
  disabled,
  formatPrice,
  required,
  errors,
  value,
  register,
  registerOptions,
  username,
  children,
  clearErrors,
  optional
}) => {
  return (
    <div>
      <div className="w-full">
      <label htmlFor={id} className="flex gap-1">
          {label} 
          { optional && <span className="italic text-gray-500 text-sm "> (Optional)</span> }
        </label>
        <div className="relative mt-2">
        <textarea
          id={id}
          disabled={disabled}
          placeholder={placeholder}
          rows={rows || 3}
          value={value}
          style={{ zIndex: 0 }}
          className={`
          peer
          w-full
          font-light
          border
         border-gray-200
          outline-none
          transition
          disabled:cursor-not-allowed
          disabled:opacity-50          
          my-2
          rounded-lg
          py-2
          focus:border-0
          focus:ring-0
          focus:ring-offset-0
          focus:ring-offset-transparent
          ${username && "lowercase"}
          ${formatPrice ? "pl-10" : "pl-4"}
          ${
            errors && errors[id]
              ? "border-red-500 focus:border-red-500 hover:border-b-red-500"
              : "border-gray-200 hover:border-orange-300 focus:border-orange-300"
          }
          ${errors && errors[id] ? "text-red-500" : "text-gray-700"}
        `}
          {...register(id, {
            required: required && "This field is required",
            ...registerOptions,
            onChange: () => clearErrors && clearErrors(id),
          })}
        >
          {children}
        </textarea>
        {errors && errors[id] && <div className="absolute top-0 ml-2 text-xs mt-3 text-red-500 ">{String(errors[id]?.message)}</div>}

        </div>
      </div>
    </div>
  );
};

export default TextArea;
