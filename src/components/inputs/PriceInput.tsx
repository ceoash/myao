import { ChangeEvent, FC, useEffect, useState } from "react";
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
  registerOptions?: RegisterOptions;
  pattern?: {
    value: RegExp;
    message: string;
  };
  optional?: boolean;
  sidebar?: boolean;
  status?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  register: UseFormRegister<FieldValues>;
}


const PriceInput: FC<InputProps> = ({
  id,
  sm,
  label,
  type,
  placeholder = "",
  disabled,
  formatPrice,
  required,
  errors,
  registerOptions,
  optional,
  sidebar,
  status,
  onChange,
  register
}) => {
  const [inputValue, setInputValue] = useState('');
  const [classes, setClasses] = useState('');
 useEffect(() => {
  if (inputValue.startsWith(".")) {
   setInputValue(`0${inputValue}`);
  }},[inputValue])

  useEffect(() => {
      switch (status) {
        case "accepted":
          setClasses("bg-green-50 border-green-100")
        case "completed":
          setClasses("bg-green-50 border-green-100")
        case "rejected":
          setClasses("bg-red-50 border-red-100")
        case "cancelled":
          setClasses("bg-red-50 border-red-100")
        case "negotiating":
          setClasses("bg-orange-alt border-orange-100")
        case "awaiting approval":
          setClasses("bg-gray-50 border-gray-200")
        default:
          setClasses("bg-orange-alt border-orange-100")
      }
  }, [status]);
  
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    let inputValue = event.target.value;
    const regex = /^[0-9]*[.,]?[0-9]{0,2}$/;

    if (inputValue.startsWith(".")) inputValue = `0${inputValue}`;
    
    const numberValue = parseFloat(inputValue);
    if (inputValue === "" || (regex.test(inputValue) && !isNaN(numberValue) && numberValue <= 5000000)) setInputValue(inputValue);
  };


  return (
    <div className="flex flex-col gap-0.5">
      <label htmlFor={id} className="mb-2 flex gap-1">
          {label} 
          { optional && <span className="italic text-gray-500 text-sm "> (Optional)</span> }
        </label>
      <div className={`flex items-center text-center border rounded-lg bg-white
      ${sidebar ?
      status === "accepted" ? "bg-green-50 border-green-100" :
      status === "completed" ? "bg-green-50 border-green-100" :
      status === "rejected" ? "bg-red-50 border-red-100" :
      status === "cancelled" ? "bg-red-50 border-red-100" :
      status === "negotiating" ? "  border-gray-200 " :
      status === "awaiting approval" ? " border-gray-200 " :
      " border-orange-100" : "border-gray-200"}`} >
        
        <div className={`flex border-r rounded-l-lg ${sidebar ?
          status === "accepted" ? 'bg-green-100 border-green-200' :
          status === "completed" ? 'bg-green-100 border-green-100' :
          status === "rejected" ? 'bg-red-100 border-red-200' :
          status === "cancelled" ? 'bg-red-100 border-red-200' :
          status === "negotiating" ? ' border-gray-200' :
          status === "awaiting approval" ? ' border-gray-200' :
          'bg-white border-gray-100' : ' border-gray-200'} 
          ${sm ? 'px-2 -py-3' : 'p-3'} h-full`}>
          {formatPrice && (
            <BiPound
              className={`left-2 ${sidebar ? 
                status === "accepted" ? ' text-green-500' :
                status === "completed" ? ' text-green-100' :
                status === "rejected" ? ' text-red-500' :
                status === "cancelled" ? ' text-red-500' :
                status === "negotiating" ? ' text-orange-300' :
                status === "awaiting approval" ? 'text-orange-300' :
                ' text-orange-300' : 'text-gray-500'} `}
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
            disabled:cursor-not-allowed
            disabled:opacity-50          
            rounded-r-lg
            py-3
            focus:bg-white
            active:bg-white
            transition-all
            h-12
            ${sm ? 'pl-4' : formatPrice ? "pl-6" : "pl-4"}
            ${errors && errors[id] && "!border-red-500" }
            ${errors && errors[id] ? "!text-red-500" : "text-gray-700"}
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

