"use client";

import React, { useState } from "react";
import Modal from "./Modal";
import Heading from "./Heading";
import axios from "axios";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { User } from "@prisma/client";
import useConversationModal from "@/hooks/usePendingConversationModal";
import { time } from "console";
import { formatDistanceToNow } from "date-fns";
export interface ErrorResponse {
  error: string;
}

const PendingConversationModal = ({}) => {
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

  const { isOpen, onClose, userId, conversation, session } =
    useConversationModal();

  const updateStatus: SubmitHandler<FieldValues> = async (data: any) => {
    data.conversationId = conversation?.id;
    data.status = "accepted";
    data.userId = session?.user.id;

    await axios
      .post("/api/conversations/status", data)
      .then((response) => {
        reset();
        router.push("/dashboard/conversations");
        onClose();
      })
      .catch((err) => {
        toast.error("Something went wrong!");
      })
      .finally(() => {
      });
  };
  

  const participant =
    conversation?.participant1.id === session?.user.id
      ? conversation?.participant2
      : conversation?.participant1;

  let bodyContent = (
    <div className="flex flex-col">
      <div className="flex flex-col space-y-4">
        <div className="flex gap-2 items-center">
          <div className="w-12">
            <img
              src={
                participant?.profile?.image || "/images/placeholders/avatar.png"
              }
              alt=""
              className="rounded-full p-[1px] border-2 border-gray-200"
            />
          </div>
          <div className="font-bold">{participant?.username}</div>
        </div>
        {conversation?.directMessages?.map((message: any) => (
          <div key={message.id} className="px-4 py-2 border-2 border-gray-200 rounded-md mr-auto bg-gray-50">
            <div>{message.text}</div>
            <div className="text-gray-400 text-xs">
              {formatDistanceToNow(new Date(message.updatedAt), {
                addSuffix: true,
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Modal
      title="New Message Request"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit(updateStatus)}
      actionLabel={"Accept"}
      secondaryAction={handleSubmit(updateStatus)}
      secondaryActionLabel="Decline"
      body={bodyContent}
    />
  );
};

export default PendingConversationModal;
