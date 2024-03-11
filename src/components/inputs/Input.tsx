import React from 'react';
import Button from "../dashboard/Button";
import { FieldError, FieldValues, UseFormRegister, RegisterOptions, useController, UseControllerProps } from "react-hook-form";

interface InputProps extends Partial<UseControllerProps<FieldValues>> {
  id: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  label?: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  formatPrice?: boolean;
  required?: boolean;
  errors?: any;
  sm?: boolean;
  value?: string;
  modal?: boolean;
  register?: UseFormRegister<FieldValues>;
  registerOptions?: RegisterOptions;
  username?: boolean;
  onChange?: (e?: React.ChangeEvent<HTMLInputElement>) => void;
  inline?: boolean;
  onClick?: () => void;
  btnText?: string | React.ReactNode;
  optional?: boolean;
}

const InputWithController: React.FC<InputProps> = ({
  control,
  ...props
}) => {
  if (control) {
    const {
      field,
      fieldState: { error },
    } = useController({ 
      name: props.id,
      control,
      rules: props.rules,
    });

    return <Input {...props} field={field} error={error} />;
  } else {
    // Fallback to Input without controller if control is not provided
    return <Input {...props} />;
  }
};

const Input: React.FC<InputProps & { field?: any; error?: FieldError }> = ({
  id,
  label,
  type = "text",
  placeholder = "",
  disabled,
  required,
  errors,
  register,
  registerOptions,
  btnText,
  onClick,
  inline,
  optional,
  onKeyDown,
  field,
  value,
  onChange,
  error,
}) => {
  // Prepare inputProps based on the provided props or register
  let inputProps = register ? register(id, registerOptions) : {};
  if (value) {
    inputProps = { ...inputProps, value };
  }
  if (onChange) {
    inputProps = { ...inputProps, onChange };
  }
  if (field) {
    inputProps = { ...inputProps, ...field };
  }

  return (
    <div className={`flex ${!inline && "pt-3"}`}>
      <div className="w-full relative flex flex-col gap-[1px]">
        {label && (
          <label htmlFor={id} className="mb-3 flex gap-1">
            {label}
            {optional && <span className="italic text-gray-500 text-sm"> (Optional)</span>}
          </label>
        )}

        <input
          id={id}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          onKeyDown={onKeyDown}
          {...inputProps} // Apply inputProps which includes register or field
          className={`peer w-full font-light border px-3 text-gray-600 ${errors && errors[id] ? "border-red-500" : "border-gray-200"} outline-none transition disabled:cursor-not-allowed disabled:bg-gray-50 py-2 flex-1 ${inline ? `rounded-l-xl` : `rounded-xl`}`}
        />
        {errors && errors[id] && (
          <div className="absolute top-0 ml-2 text-xs mt-3 text-red-500">
            {errors[id]?.message}
          </div>
        )}
      </div>
      {inline && btnText && (
        <Button
          label={btnText}
          onClick={onClick}
          className="ml-2 my-auto"
          inline={inline}
        />
      )}
    </div>
  );
};

export default InputWithController;
