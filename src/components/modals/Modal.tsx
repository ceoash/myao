'use client';

import Button from "@/components/dashboard/Button";
import { useCallback, useEffect, useRef, useState } from "react";
import { FieldErrors, FieldValues } from "react-hook-form";
import { IoClose } from "react-icons/io5"

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
    buttonsLeft?: boolean
    onClose?: () => void;
    onSubmit?: () => void;
    secondaryAction?: () => void; 
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    title,
    body,
    footer,
    errors,
    isLoading,
    auto,
    disabled,
    actionLabel,
    secondaryActionLabel,
    confirmation,
    buttonsLeft,
    onClose,
    onSubmit,
    secondaryAction,
}) => {
    const [showModal, setShowModal] = useState(isOpen);

    const ref = useRef<HTMLDivElement>(null);

    const handleClickOutside = (event: any) => {
        if (ref.current && !ref.current.contains(event.target)) {
            setShowModal(false);
            if (onClose) onClose();
        }
    };

    useEffect(() => {
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

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
        overflow-x-hidden
        overflow-y-auto
        flex
        fixed
        inset-0
        
        outline-none
        focus:outline-none
       ${showModal && 'backdrop-blur-md bg-neutral-800/70 backdrop-filter'}
        `}
        style={{zIndex: 9999}}
    >
        <div 
            ref={ref}
            className={`
            relative
            ${auto ? 'w-full md:w-auto' : 'w-full md:w-4/6 lg:w-3/6 xl:w-2/5'}
            mx-auto
           
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
                    overflow-none
                    overflow-y-none
                    z-50
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
                    <div className="relative p-6 h-full">
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