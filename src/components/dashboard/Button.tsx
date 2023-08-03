import React from "react";
import InfoCard from "./InfoCard";
import Link from "next/link";
import { FaTimes } from "react-icons/fa";
import Spinner from "../Spinner";

interface ButtonProps {
  label?: string;
  onClick?: () => void;
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
    
  };
}

const Button = ({
  label,
  onClick,
  options,
  disabled,
  submit,
  icon,
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
}: ButtonProps) => {
  if (link) {
    return (
      <Link
        href={link}
        className={`
            inline-flex 
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
                  ? "bg-white border border-orange-400 text-orange-400 hover:text-white hover:bg-orange-400"
                  : options?.secondary
                  ? "bg-white border border-orange-200 text-gray-800 hover:text-white hover:bg-orange-200"
                  : options?.dark
                  ? "bg-gray-800 border border-white text-white hover:text-white hover:bg-gray-800"
                  : options?.light &&
                    "border border-orange-300 text-orange-300 hover:text-white hover:bg-gray-200"
                : options?.color
                ? options.color
                : options?.primary
                ? "bg-orange-400 text-white border border-orange-400 hover:bg-orange-50 hover:text-orange-400"
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
  return (
    <button
      onClick={onClick}
      type={submit ? "submit" : "button"}
      className={`
            inline-flex 
            items-center
            justify-center
            ${options?.size == "lg" ? `px-4 py-4 w-full` : `px-3 py-2`}
            ${options?.size == "sm" && `px-4 py-2` }
            ${inline ? `rounded-r-xl` : `rounded-xl`}
            ${options?.size == "xs" ? `text-xs` : "text-sm"}
            font-semibold
            transition
            ${
              accept &&
              `!bg-green-50 border-green-200 text-green-500  hover:!bg-green-400 hover:!text-white w-full`
            }
            ${
              cancel === false && options?.outline
                ? options?.color
                  ? options.color
                  : options?.primary
                  ? "bg-white border border-orange-400 text-orange-400 hover:text-white hover:bg-orange-400"
                  : options?.secondary
                  ? "bg-white border border-orange-200 text-gray-800 hover:text-white hover:bg-orange-200"
                  : options?.dark
                  ? "bg-gray-800 border border-white text-white hover:text-white hover:bg-gray-800"
                  : options?.light &&
                    "border border-orange-300 text-orange-300 hover:text-white hover:bg-gray-200"
                : options?.color
                ? options.color
                : options?.primary
                ? "bg-orange-400 text-white border border-orange-400 hover:bg-orange-50 hover:text-orange-400"
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
              "text-red-500  border border-red-500 bg-red-50 hover:!bg-red-500 hover:text-red-50 w-full" : 
              cancel ? 
              ` border-red-500 !bg-red-400 hover:!bg-red-400 text-white hover:text-red-100 w-full` :
              ""
            }
            ${
              secondary ? 
              "text-orange-500  border border-orange-500 bg-orange-50 hover:bg-orange-500 hover:text-orange-50" : 
              primary ? 
              ` border-orange-500 !bg-orange-400 text-white hover:bg-white hover:text-orange-100 ` :
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
