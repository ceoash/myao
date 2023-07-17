"use client";

import React, { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import useDeleteConfirmationModal from "@/hooks/useDeleteConfirmationModal";
import Heading from "./Heading";
import axios from "axios";
import { useRouter } from "next/navigation";
import {io } from "socket.io-client";
import { toast } from "react-hot-toast";
import { config } from "@/config";



export interface ErrorResponse {
  error: string;
}

interface DeleteConfirmationProps {
  listingId: string;
}
const DeleteConfirmation = () => {
  const { isOpen, listingId, onClose } = useDeleteConfirmationModal();
  const port = config.PORT;
  const socket = io(port);
  const router = useRouter();

  const handleDelete = async () => {
    try {
        await axios.post("/api/deleteListing", {
          listingId
        })
        .then((response) => {
            socket.emit('delete_listing', response.data);
            onClose();
            router.push("/dashboard");
            toast.success("Offer deleted successfully");
          }
        ).catch((error) => {
          console.log(error);
        });
        

      } catch (error) {
        console.error("Error deleting listing:", error);
      }
  };

  let bodyContent = (
    <div className="flex flex-col">
      
      Are you sure you want to delete this offer?
    </div>
  );

  return (
    <Modal
      title="Delete offer"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={() => handleDelete()}
      actionLabel={"Delete"}
      secondaryAction={() => onClose()}
      secondaryActionLabel={"Cancel"}
      body={bodyContent}
    />
  );
};

export default DeleteConfirmation;
