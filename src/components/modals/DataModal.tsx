"use client";
import Modal from "./Modal";
import useDataModal from "@/hooks/useDataModal";
import { useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

export interface ErrorResponse {
  error: string;
}

interface ModalProps {
  children?: React.ReactNode;
  title?: string | undefined;
}

const DataModal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      message: "",
    },
  });

  const { isOpen, onClose, children, title } = useDataModal();

  const onSubmit: SubmitHandler<FieldValues> = async (data: any) => {
  };

  let bodyContent = (
    <div className="flex flex-col">
      {children}
    </div>
  );

  return (
    <Modal
      title={title}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
     /*  actionLabel={"Save"} */
      body={bodyContent}
      isLoading={isLoading}
    />
  );
};
export default DataModal;
