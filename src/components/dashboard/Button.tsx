import React from "react";
import InfoCard from "./InfoCard";
import Link from "next/link";
import { FaTimes } from "react-icons/fa";

interface ButtonProps {
  label?: string;
  onClick?: () => void;
  icon?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  link?: string;
  className?: string;
  isLoading?: boolean;
  cancel?: boolean;
  accept?: boolean;
  inline?: boolean;
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
  icon,
  children,
  link,
  className,
  isLoading,
  cancel,
  accept,
  inline,
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
            ${cancel === true && ` border-red-500 !bg-red-400 text-white hover:bg-white hover:text-red-100  `}
            ${accept && `text-white !bg-green-400 border-green-500  hover:bg-green-400 `}
            ${cancel === false &&
              options?.outline
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
          <div role="status">
            <svg
              aria-hidden="true"
              className="w-8 h-8 mr-2 text-gray-200 animate-spin  fill-orange-400"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        ) : (
          <>
          
            {label}
          {cancel===true && (
              <FaTimes />
            )}
          
            {children}
          </>
        )}
      </Link>
    );
  }
  return (
    <button
      onClick={onClick}
      type="button"
      className={`
            inline-flex 
            items-center
            justify-center
            py-2
            px-3
            ${inline ? `rounded-r-xl` : `rounded-xl`}
            ${options?.size == "xs" ? `text-xs` : "text-sm"}
            font-semibold
            transition
            ${accept && `!bg-green-400 border-green-500 text-white hover:bg-green-400 hover:text-green-100`}
            ${cancel === false &&
              options?.outline
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
            ${cancel === true && ` border-red-500 !bg-red-400 text-white hover:bg-white hover:text-red-100 `}

        `}
      disabled={disabled}
    >
      {label}
      {children}
    </button>
  );
};

export default Button;
