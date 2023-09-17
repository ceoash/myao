"use client";

import { useCallback, useEffect, useState } from "react";
import { FieldErrors, FieldValues } from "react-hook-form";
import { IoWarningOutline } from "react-icons/io5";

interface ModalProps {
  isOpen?: boolean;
  title?: string;
  body?: React.ReactNode;
  footer?: string;
  actionLabel?: string | React.ReactNode;
  disabled?: boolean;
  secondaryActionLabel?: string | React.ReactNode;
  listingId?: string;
  children?: React.ReactNode;
  errors?: FieldErrors<FieldValues> | undefined;
  isLoading?: boolean;
  auto?: boolean;
  confirmation?: boolean;
  buttonsLeft?: boolean;
  onClose?: () => void;
  onSubmit?: () => void;
  secondaryAction?: () => void;
}

const Alert: React.FC<ModalProps> = ({
  auto,
  body,
  title,
  isOpen,
  errors,
  disabled,
  onClose,
  onSubmit,
  secondaryAction,
}) => {
  
  const [showModal, setShowModal] = useState(isOpen);

  useEffect(() => {
    setShowModal(isOpen);
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setShowModal(false);
    if (onClose) onClose();
  }, [disabled, onClose]);

  const handleSubmit = useCallback(() => {
    if (disabled) return;
    if (typeof onSubmit === "function") {
      onSubmit();
    }
  }, [disabled, onSubmit]);

  const handleSecondaryAction = useCallback(() => {
    if (disabled || !secondaryAction) return;
    secondaryAction();
  }, [disabled, secondaryAction]);

  if (!isOpen) return null;

  const renderErrorMessages = () => {
    if (!errors) return null;

    return Object.entries(errors).map(([fieldName, error]) => {
      if (typeof error === "string") {
        return (
          <div key={fieldName} className="text-red-500">
            {error}
          </div>
        );
      }

      if (
        error instanceof Object &&
        "message" in error &&
        typeof error.message === "string"
      ) {
        return (
          <div key={fieldName} className="text-red-500">
            {error.message}
          </div>
        );
      }

      return null;
    });
  };

  return (
    <>
      <div
        className={`
        justify-center
        items-center
        flex
        overflow-x-hidden
        overflow-y-auto
        fixed
        inset-0
        z-30
        outline-none
        focus:outline-none
       ${showModal && "backdrop-blur-md bg-neutral-800/70"}
        `}
      >
        <div
          className={`
            relative
            ${auto ? "w-full md:w-auto" : "w-full md:w-4/6 lg:w-3/6 xl:w-2/5"}
            my-6
            mx-auto
            h-full  
            lg:h-auto
            md:h-auto        
    `}
        >
          {/* CONTENT */}
          <div
            className={`
            translate
            duration-300
            h-full
            w-full
            ${showModal ? "opacity-100" : "opacity-0"}
            ${showModal ? "translate-y-0" : "translate-y-full"}         
            `}
          >
            <div
              className="w-full max-w-lg p-4 text-gray-500 bg-white rounded-lg shadow translate"
              role="alert"
            >
              <div className="flex">
                <div className="inline-flex items-center justify-center flex-shrink-0 mb-auto p-2 pt-0 text-red-400  rounded-full">
                  <IoWarningOutline className="text-6xl" />
                </div>
                <div className="ml-4 text-sm font-normal">
                  <span className="mb-4 text-lg font-semibold text-gray-900 mr-4">
                    {title}
                  </span>
                  <div className="mb-2 mt-2 text-sm font-normal max-w-[260px]">{body}</div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div>
                      <button
                        onClick={onSubmit}
                        className="inline-flex justify-center w-full px-2 py-1.5 text-xs font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none "
                      >
                        Yes
                      </button>
                    </div>
                    <div>
                      <button
                        onClick={secondaryAction}
                        className="inline-flex justify-center w-full px-2 py-1.5 text-xs font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 "
                      >
                        Not now
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="ml-auto -mx-1.5 -my-1.5 bg-white items-center justify-center flex-shrink-0 text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8"
                  onClick={secondaryAction}
                  aria-label="Close"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Alert;
