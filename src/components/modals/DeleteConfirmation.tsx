"use client";

import React, { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import useDeleteConfirmationModal from "@/hooks/useDeleteConfirmationModal";
import Heading from "./Heading";
import axios from "axios";
import { useRouter } from "next/navigation";
import { on } from "events";
import { toast } from "react-hot-toast";

export interface ErrorResponse {
  error: string;
}

interface DeleteConfirmationProps {
  listingId: string;
}
const DeleteConfirmation = () => {
  const { isOpen, listingId, onClose } = useDeleteConfirmationModal();


  const router = useRouter();

  const handleDelete = async () => {
    try {
        await axios.post("/api/deleteListing", {
          listingId
        });
        onClose();
        router.push("/dashboard");
        toast.success("Offer deleted successfully");

        // You may want to navigate the user away from the listing page or refresh the page here,
        // as the listing they are viewing has been deleted.
      } catch (error) {
        console.error("Error deleting listing:", error);
        // Handle the error. Could be a toast notification, a text message, or however you prefer.
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
      body={bodyContent}
    />
  );
};

export default DeleteConfirmation;
