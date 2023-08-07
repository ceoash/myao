import React, { useEffect } from "react";
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
  errors?: FieldErrors<FieldValues>;
  sm?: boolean;
  value?: string;
  modal?: boolean;
  register: UseFormRegister<FieldValues>;
  registerOptions?: RegisterOptions;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  pattern?: {
    value: RegExp;
    message: string;
  };
  optional?: boolean;
}


const PriceInput: React.FC<InputProps> = ({
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
  onChange,
  sm,
  optional
}) => {
  const [inputValue, setInputValue] = React.useState('');
 useEffect(() => {
  if (inputValue.startsWith(".")) {
   setInputValue(`0${inputValue}`);
  }},[inputValue])
  
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = event.target.value;
    const regex = /^[0-9]*[.,]?[0-9]{0,2}$/;

    if (inputValue.startsWith(".")) {
      inputValue = `0${inputValue}`;
     }
    
    const numberValue = parseFloat(inputValue);
  
    if (inputValue === "" || (regex.test(inputValue) && !isNaN(numberValue) && numberValue <= 5000000)) {
      setInputValue(inputValue);
    }
  };

  return (
    <div className="flex flex-col gap-0.5">
      <label htmlFor={id} className="mb-2 flex gap-1">
          {label} 
          { optional && <span className="italic text-gray-500 text-sm "> (Optional)</span> }
        </label>
      <div className="flex items-center text-center border border-gray-200 rounded-lg" >
        
        <div className={`flex border-r-2 border-gray-200  bg-gray-50 ${sm ? 'px-2 py-3' : 'p-3'} h-full`}>
          {formatPrice && (
            <BiPound
              className={`left-2 text-gray-500`}
              size={sm ? 20 : 24}
            />
          )}
        </div>

        <input
          id={id}
          disabled={disabled}
          placeholder={placeholder}
          type={type}
          value={inputValue.startsWith('.') ? '0.' + inputValue : inputValue}
          style={{ zIndex: 0 }}
          className={`
            peer
            w-full
            font-light
            outline-none
            transition
            disabled:cursor-not-allowed
            disabled:opacity-50          
            rounded-md
            py-3
            ${sm ? 'pl-4' : formatPrice ? "pl-6" : "pl-4"}
            ${errors && errors[id] ? "border-red-500" : "border-gray-200"}
            ${errors && errors[id] ? "text-red-500" : "text-gray-700"}
          `}
          {...register(id, {
            required: required && "This field is required",
            onChange: (e) => {
              handleInputChange(e),
              onChange && onChange(e)
            },
            ...registerOptions,
          })}
        />
        {errors && errors[id] && <div className="absolute top-0 -mt-4">{String(errors[id]?.message)}</div>}
      </div>
    </div>
  );
};

export default PriceInput;

