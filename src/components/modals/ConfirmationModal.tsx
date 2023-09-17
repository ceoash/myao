"use client";

import useConfirmationModal from "@/hooks/useConfirmationModal";
import Alert from "./Alert";

export interface ErrorResponse {
  error: string;
}

const ConfirmationModal = () => {
    const { isOpen, onClose, confirmAction, text } = useConfirmationModal();
  
    let bodyContent = (
      <div className="flex flex-col">
        {text ? text : "Are you sure?"}
      </div>
    );
  
    return (
      
      <Alert
        title="Are you sure?"
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
        auto
        confirmation
      />
    );
  };
  
  export default ConfirmationModal;
  
