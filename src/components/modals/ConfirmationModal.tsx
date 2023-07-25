"use client";

import React from "react";
import Modal from "./Modal";
import useConfirmationModal from "@/hooks/useConfirmationModal";

export interface ErrorResponse {
  error: string;
}

interface ConfirmationModalProps {
  listingId: string;
}
const ConfirmationModal = () => {
    const { isOpen, onClose, confirmAction, text } = useConfirmationModal();
  
    let bodyContent = (
      <div className="flex flex-col">
        {text ? text : "Are you sure?"}
      </div>
    );
  
    return (
      <Modal
        title="Update offer status"
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={() => {
          confirmAction?.();
          onClose();
        }}
        actionLabel={"Yes"}
        secondaryAction={() => onClose()}
        secondaryActionLabel={"No"}
        body={bodyContent}
      />
    );
  };
  
  export default ConfirmationModal;
  
