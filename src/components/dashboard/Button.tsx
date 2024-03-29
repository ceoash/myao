import Link from "next/link";
import Spinner from "../Spinner";
import { FaTimes } from "react-icons/fa";

interface ButtonProps {
  onClick?: () => void;
  label?: string | React.ReactNode;
  submit?: boolean;
  icon?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  link?: string;
  className?: string;
  isLoading?: boolean;
  cancel?: boolean;
  accept?: boolean;
  inline?: boolean;
  outline?: boolean;
  primary?: boolean;
  secondary?: boolean;
  type?: "button" | "submit" | "reset";
  options?: {
    color?: string;
    span?: string;
    size?: string;
    secondary?: boolean;
    primary?: boolean;
    dark?: boolean;
    light?: boolean;
    mute?: boolean;
    outline?: boolean;
    only?: {
      mobile?: boolean;
      tablet?: boolean;
      desktop?: boolean;
      screen?: boolean;
    };
    
  };
}

const Button = ({
  onClick,
  label,
  options,
  disabled,
  submit,
  children,
  link,
  className,
  isLoading,
  cancel,
  accept,
  inline,
  outline,
  primary,
  secondary,
  type, 
}: ButtonProps) => {
  if (link) {
    return (
      <Link
        href={link}
        className={`
            items-center
            justify-center
            py-2
            px-3
            ${inline ? `rounded-r-xl` : `rounded-xl`}
            ${
              options?.size == "xs"
                ? `text-xs`
                : options?.size == "lg"
                ? "text-lg"
                : options?.size == "xl"
                ? "text-xl"
                : options?.size == "2xl"
                ? "text-2xl"
                : "text-sm"
            }
            font-semibold
            transition
            hover:shadow
            ${ cancel && " border-red-500 !bg-red-400 text-white hover:bg-white hover:text-red-100  "}
            ${ accept && `text-white !bg-green-50 border-green-500  hover:bg-green-50`}
            ${ cancel === false && options?.outline
              ? options?.color
                  ? options.color
                  : options?.primary
                  ? "bg-white border border-orange-default text-orange-default hover:text-white hover:bg-orange-default"
                  : options?.secondary
                  ? "bg-white border border-orange-200 text-gray-800 hover:text-white hover:bg-orange-200"
                  : options?.dark
                  ? "bg-gray-800 border border-white text-white hover:text-white hover:bg-gray-800"
                  : options?.light &&
                    "border border-orange-300 text-orange-300 hover:text-white hover:bg-gray-200"
                : options?.color
                ? options.color
                : options?.primary
                ? "bg-orange-default text-white border border-orange-default hover:opacity-90 hover:text-orange-200"
                : options?.secondary
                ? "bg-orange-200 text-gray-800 border border-orange-200 hover:bg-white"
                : options?.dark
                ? "bg-gray-800 text-white border border-gray-800 hover:bg-white hover:text-gray-800"
                : options?.light
                ? "bg-gray-100 text-gray-200 border border-gray-100 hover:bg-white"
                : options?.mute
                ? "text-gray-300 bg-white text-[12px] border-gray-300 border"
                : "bg-white text-gray-800 border border-gray-300 hover:bg-gray-200"
            }
            ${className}
        `}
      >
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            {label}
            {cancel === true && <FaTimes />}

            {children}
          </>
        )}
      </Link>
    );
  }

  const mobile = options?.only?.mobile && `sm:inline-flex`
  const tablet = options?.only?.tablet && `md:inline-flex`
  const desktop = options?.only?.desktop && `lg:inline-flex`
  const xl = options?.only?.screen && `xl:inline-flex`
  const show = options?.only && mobile || tablet || desktop || xl

  return (
    <button
      onClick={onClick}
      type={submit ? "submit" : type ? type : "button"}
      className={`
            ${show ? `hidden ${show}` : "inline-flex"}
            items-center
            justify-center
            ${options?.size == "lg" ? `px-4 py-4 w-full` : `px-3 py-2`}
            ${options?.size == "sm" && `px-4 py-2` }
            ${inline ? `rounded-r-xl` : `rounded-xl`}
            ${options?.size == "xs" ? `text-xs` : "text-sm"}
            font-semibold
            transition
            ${disabled && "opacity-50 cursor-not-allowed"}
          
            ${
              cancel === false && options?.outline
                ? options?.color
                  ? options.color
                  : options?.primary
                  ? "bg-white border border-orange-default text-orange-default hover:text-white hover:bg-orange-default"
                  : options?.secondary
                  ? "bg-white border border-orange-200 text-gray-800 hover:text-white hover:bg-orange-200"
                  : options?.dark
                  ? "bg-gray-800 border border-white text-white hover:text-white hover:bg-gray-800"
                  : options?.light &&
                    "border border-orange-300 text-orange-300 hover:text-white hover:bg-gray-200"
                : options?.color
                ? options.color
                : options?.primary
                ? "bg-gradient-to-b from-orange-400 to-orange-300 border border-orange-400/30 shadow-sm text-white hover:bg-orange-50 hover:opacity-90"
                : options?.secondary
                ? "bg-orange-200 text-gray-800 border border-orange-200 hover:bg-white"
                : options?.dark
                ? "bg-gray-800 text-white border border-gray-800 hover:bg-white hover:text-gray-800"
                : options?.light
                ? "bg-gray-100 text-gray-200 border border-gray-100 hover:bg-white"
                : options?.mute
                ? "text-gray-300 bg-white text-[12px] border-gray-300 border"
                : "bg-white text-gray-800 border border-gray-300 hover:bg-gray-200"
            }
         
            ${
              cancel && outline ? 
              "text-red-500  border border-orange-100  hover:!bg-red-500 hover:text-red-50 w-full" : 
              cancel ? 
              ` border-red-400 !bg-red-400 hover:!bg-red-400 text-white hover:text-red-100 w-full` :
              ""
            }
            ${
              accept && outline ? 
              "text-green-500  border border-green-200 bg-green-50 hover:!bg-green-500 hover:text-green-50 w-full" : 
              accept ? 
              ` border-green-500 !bg-green-400 hover:!bg-green-400 text-white hover:text-green-100 w-full` :
              ""
            }
            
            ${
              secondary ? 
              "text-white  border border-orange-alt !bg-orange-alt hover:bg-orange-alt hover:text-orange-50" : 
              primary ? 
              `  !bg-orange-default text-white hover:bg-white hover:text-orange-100 ` :
              ""
            }


        `}
      disabled={disabled}
    >
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          {label}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
