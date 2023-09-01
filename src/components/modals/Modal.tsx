'use client';

import { useCallback, useEffect, useState } from "react";
import { FieldErrors, FieldValues, set } from "react-hook-form";
import { IoClose } from "react-icons/io5"
import Button from "@/components/dashboard/Button";

interface ModalProps {
    isOpen?: boolean;
    onClose?: () => void;
    onSubmit?: () => void;
    title?: string;
    body?: React.ReactNode;
    footer?: string;
    actionLabel?: string | React.ReactNode;
    disabled?: boolean;
    secondaryAction?: () => void;
    secondaryActionLabel?: string | React.ReactNode;
    listingId?: string;
    children?: React.ReactNode;
    errors?: FieldErrors<FieldValues> | undefined;
    isLoading?: boolean;
    auto?: boolean;
    confirmation?: boolean;
    buttonsLeft?: boolean

}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    title,
    body,
    footer,
    actionLabel,
    disabled,
    secondaryAction,
    secondaryActionLabel,
    listingId,
    errors,
    isLoading,
    auto,
    confirmation,
    buttonsLeft
}) => {
    const [showModal, setShowModal] = useState(isOpen);

    useEffect(() => {
        setShowModal(isOpen)
    }, [isOpen]);

   

    const handleClose = useCallback(() => {
        setShowModal(false);
        if (onClose) onClose();
      }, [disabled, onClose]);

    const handleSubmit = useCallback(() => {
        if (disabled) return;
        if (typeof onSubmit === 'function') {
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
      
          if (error instanceof Object && "message" in error && typeof error.message === 'string') {
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
        items-end
        md:items-center
        flex
        overflow-x-hidden
        overflow-y-auto
        fixed
        inset-0
        z-50
        outline-none
        focus:outline-none
       ${showModal && 'backdrop-blur-md bg-neutral-800/70'}
        `}
    >
        <div 
            className={`
            relative
            ${auto ? 'w-full md:w-auto' : 'w-full md:w-4/6 lg:w-3/6 xl:w-2/5'}
            mx-auto
            h-full pt-32
            lg:h-auto
            md:h-auto        
    `}>
            {/* CONTENT */}
            <div
            className={`
            translate
            duration-300
            h-full
            ${showModal ? 'opacity-100' : 'opacity-0'}
            ${showModal ? 'translate-y-0' : 'translate-y-full'}         
            `}>
                <div 
                    className="
                    
                    translate
                    h-full
                    lg:h-auto
                    md:h-auto
                    border-0
                    rounded-t-lg
                    md:rounded-lg
                    shadow-lg
                    relative
                    flex
                    flex-col
                    w-full
                    bg-white
                    outline-none
                    focus:outline-none
                ">
                    {/* HEADER */}
                    <div 
                        className="
                            flex
                            items-center
                            px-6 py-4
                            rounded-t
                            justify-between
                            relative
                            border-b
                            border-gray-200
                        ">
                        <div className="
                            text-md
                            font-medium
                            first-letter:uppercase
                            text-gray-500
                        ">
                            {title}
                        </div>
                        <button 
                            onClick={handleClose}
                            className="
                            p-1
                            border-0
                            hover:opacity-75
                            transition
                            text-gray-500
                            hover:text-orange-default
                            
                        ">
                            <IoClose size={18}  />
                        </button>
                    </div>
                    {/* BODY */}
                    <div className="relative p-6 flex-auto">
                        {body}
                    </div>
                    {/* FOOTER */}
                    {actionLabel && (
                    <div className="flex flex-col gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                        <div className={`flex flex-row items-center gap-2 w-full ${!auto && 'justify-between'}`}>
                            <div className={`${auto && !buttonsLeft && 'ml-auto'}`}>
                            { secondaryActionLabel  && !isLoading && <Button label={secondaryActionLabel || 'Back'}  onClick={secondaryAction} options={{size: "xl"}}  /> }
                            </div>
                            <div className={`${!auto && !buttonsLeft && 'ml-auto'}`}>
                           <Button disabled={disabled} isLoading={isLoading} label={actionLabel || 'Submit'} onClick={handleSubmit} options={{size: "xl"}} cancel={confirmation} />

                            </div>
                        </div>
                        {footer}
                    </div>
                    )}
                </div>
            </div>
        </div>
    </div>
    </>
  )
}

export default Modal