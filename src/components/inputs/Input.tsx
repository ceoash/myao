import Button from "../dashboard/Button";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
import { RegisterOptions } from "react-hook-form";

interface InputProps {
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
  modal?: boolean;
  register: UseFormRegister<FieldValues>;
  registerOptions?: RegisterOptions;
  username?: boolean;
  onChange?: (e?: any) => void;
  inline?: boolean;
  onClick?: () => void;
  btnText?: string | React.ReactNode;
  optional?: boolean;
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
  username,
  onChange,
  onClick,
  inline,
  btnText,
  optional,
}) => {
  return (
    <div className={`flex ${!inline && "pt-3"}`}>
      <div className="w-full relative flex flex-col gap-[1px]">
        {label && (
          <label htmlFor={id} className="mb-3 flex gap-1">
            {label}
            {optional && (
              <span className="italic text-gray-500 text-sm "> (Optional)</span>
            )}
          </label>
        )}

        <div className="relative ">
          <input
            id={id}
            disabled={disabled}
            placeholder={placeholder}
            type={type || "text"}
            value={value}
            style={{ zIndex: 0 }}
            required={required}
            className={`
          peer
          w-full
          font-light
          border
         border-gray-200
          outline-none
          transition
          disabled:cursor-not-allowed
          disabled:bg-gray-50          
         
          py-2
          flex-1
          flex-grow
          ${inline ? `rounded-l-xl` : `rounded-xl`}
        
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
            })}
            onChange={onChange}
          />
          {errors && errors[id] && (
            <div className="absolute top-0 ml-2 text-xs mt-3 text-red-500">
              {String(errors[id]?.message)}
            </div>
          )}
        </div>
      </div>
      {inline && (
        <Button
          label={btnText}
          onClick={onClick}
          options={{ primary: true,  }}
          className="ml-2 my-auto"
          inline={inline}
        />
      )}
    </div>
  );
};

export default Input;
