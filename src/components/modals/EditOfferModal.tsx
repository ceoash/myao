import React, { useEffect } from "react";
import Modal from "./Modal";
import { FieldValues, SubmitHandler, UseFormReturn, useForm } from "react-hook-form";
import Input from "../inputs/Input";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface EditListingModalProps {
    editMode?: boolean;
    setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
    listingId?: string;
    initialData?: ListingFormValues; 
}

interface ListingFormValues {
  title: string;
  description: string;
  price: string;
}

const EditListingModal: React.FC<EditListingModalProps> = ({
    editMode = false,
    setEditMode,
    listingId,
    initialData,
  }) => {
    const router = useRouter();
    const {
      register,
      handleSubmit,
      formState: { errors },
      reset,
      setValue,
    } = useForm<ListingFormValues>({
      defaultValues: initialData,
    });
  
    const onSubmit: SubmitHandler<ListingFormValues> = async (data) => {
      try {
        await axios.put(`/api/listings/${listingId}`, data, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
        toast.success("Listing updated successfully!");
        router.push(`/listings/${listingId}`);
        onClose(); // Close the modal
      } catch (error) {
        console.error("Error updating listing:", error);
        toast.error("Something went wrong while updating the listing!");
      }
    };
  
    const onClose = () => {
      setEditMode(false); // Close the modal
    };
  
    return (
      <Modal
        isOpen={editMode}
        onClose={onClose}
        onSubmit={handleSubmit(onSubmit)}
        title="Edit Listing"
        actionLabel="Update"
      >
        {/* Render the input fields */}
        <Input id="title" label="Title" type="text" register={register} />
        <Input id="description" label="Description" type="text" register={register} />
        <Input id="price" label="Price" type="number" register={register} />
      </Modal>
    );
  };
  

export default EditListingModal;
