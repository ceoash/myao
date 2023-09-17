"use client";

import Modal from "./Modal";
import Heading from "./Heading";
import axios from "axios";
import useMessageModal from "@/hooks/useMessageModal";
import { useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSocketContext } from "@/context/SocketContext";

export interface ErrorResponse {
  error: string;
}

const MessageModal = ({  }) => {

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

  const { isOpen, onClose, userId, recipientId } = useMessageModal();
  const socket = useSocketContext();

  const onSubmit: SubmitHandler<FieldValues> = async (data: any) => {
   
    data.recipientId = recipientId;
    data.userId = userId;

    await axios
    .post("/api/newConversation", data)
      .then((response) => {
        reset();
        setIsLoading(true);
        router.push("/dashboard/conversations");

        if(response.data){
          const {transactionResult, updatedConversation} = response.data;
          
          socket.emit(
            "update_activities",
            transactionResult,
            updatedConversation.participant1.id,
            updatedConversation.participant2.id
          );
        }
      })
      .catch((err) => { toast.error("Something went wrong!"); })
      .finally(() => {
        onClose();
        setIsLoading(false);
      });


  };
  
  let bodyContent = (
    <div className="flex flex-col">
      <Heading
        title="Send a message"
        description="Message the seller to make an offer"
      />
      <textarea
        id="message"
        rows={5}
        className={`
          peer
          w-full
          p-2
          font-light
          bg-white
          border-2
          rounded-md
          outline-none
          transition
          disabled:cursor-not-allowed
          disabled:opacity-50
        `}
        {...register("message")}
      />
      
    </div>
  );

  return (
    <Modal
      title="Send a message"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      actionLabel={"Send"}
      body={bodyContent}
      isLoading={isLoading}
    />
  );
};

export default MessageModal;
