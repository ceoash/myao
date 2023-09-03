import React from "react";
import { FaCheck, FaInfo } from "react-icons/fa";
import { BiBlock } from "react-icons/bi";

interface AlertBannerProps {
  text?: string;
  danger?: boolean;
  success?: boolean;
  primary?: boolean;
  secondary?: boolean;
  info?: boolean;
  button?: true;
  buttonText?: string;
  secondaryActionLabel?: string;
  onClick?: () => void;
  secondaryAction?: () => void;
  children?: React.ReactNode;
}

const AlertBanner = ({
  text,
  danger,
  success,
  primary,
  secondary,
  info,
  children,
}: AlertBannerProps) => {
  return (
    <div className={`
        items-center
        justify-between
        p-2
        text-sm
        font-semibold
        rounded-lg
        col-span-12
       mt-4
        ${success && "border bg-green-100 border-green-200 text-green-500"}
        ${danger && "border border-red-200 text-red-500 bg-red-100"}
        ${info && "border bg-yellow-50 border-yellow-200 text-yellow-400"}
        ${primary && " border-orange-200 border bg-orange-100 text-orange-default"}
        ${secondary && "text-gray-600 border-gray-300 border bg-gray-100"}
      `}
    >
      <div className="flex gap-2 items-center">
        <div
          className={`
            rounded-full 
            p-1 
            ${success && "text-white border-green-300 bg-green-400 border"}
            ${danger && "text-white border-red-300 border bg-red-400"}
            ${info && "text-white border-yellow-300 border "}
            ${primary && "text-orange-default border-orange-300 border "}
            ${secondary && "text-gray-500 border-gray-400 border !bg-white"}
          `}
        >
          {success && <FaCheck />}
          {danger && <BiBlock />}
          {info && <FaInfo />}
          {primary && <FaInfo />}
          {secondary && <FaInfo />}
        </div>
        <div className="w-full">
          {text} 
          {children}
        </div>
      </div>
    </div>
  );
};

export default AlertBanner;
