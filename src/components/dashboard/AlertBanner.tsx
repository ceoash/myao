import React from "react";
import { AiFillWarning } from "react-icons/ai";
import { FaCheck, FaExclamation, FaInfo, FaTimes } from "react-icons/fa";
import { IoAlert } from "react-icons/io5";
import { MdDoNotDisturb } from "react-icons/md";
interface AlertBannerProps {
  text?: string;
  danger?: boolean;
  success?: boolean;
  primary?: boolean;
  secondary?: boolean;
  info?: boolean;
  button?: true;
  buttonText?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

const AlertBanner = ({
  text,
  danger,
  success,
  primary,
  secondary,
  info,
  button,
  buttonText,
  onClick,
  children,
}: AlertBannerProps) => {
  return (
    <div
      className={`
    col-span-12
    flex
    items-center
    justify-between
    p-4
    text-sm
    font-semibold
    rounded-lg
    mb-6
    xl:mb-0
    ${success && "border bg-green-100 border-green-400 text-green-500"}
    ${danger && "border border-red-200 text-red-500 bg-red-100"}
    ${info && "border bg-yellow-50 border-yellow-200 text-yellow-400"}
    ${primary && " border-orange-200 border bg-orange-100 text-orange-400"}
    ${secondary && "text-gray-600 border-gray-300 border bg-gray-100"}
    `}
    >
      <div className="flex items-center gap-2">
        <div
          className={`
            rounded-full p-2 
            ${success && "text-white border-green-300 bg-green-400 border"}
            ${danger && "text-white border-red-300 border bg-red-400"}
            ${info && "text-white border-yellow-300 border "}
            ${primary && "text-orange-400 border-orange-300 border "}
            ${secondary && "text-gray-500 border-gray-400 border bg-gray-100"}
        `}
        >
          {success && <FaCheck />}
          {danger && <FaTimes />}
          {info && <FaInfo />}
          {primary && <FaInfo />}
          {secondary && <FaInfo />}
        </div>
        <div className="flex gap-1">
          <span>{text} {children}</span>
          {button && (
            <button onClick={onClick} className=" underline">
              {buttonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertBanner;