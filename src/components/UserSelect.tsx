"use client";

import React, { useEffect, useMemo, useState } from "react";
import Modal from "@/components/modals/Modal";
import useSearchModal from "@/hooks/useSearchModal";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import Input from "@/components/inputs/Input";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { User } from "@prisma/client";
import { BiArrowToRight, BiCheck, BiChevronRight } from "react-icons/bi";
import assignUserToListing from "@/actions/assignUserToListing";
import { set } from "date-fns";

export interface ErrorResponse {
  error: string;
}

interface searchModalProps {
  onAssignUser?: (user: User) => void;
  sender?: User;
  url?: string;
  create?: boolean;
}
const UserSelect = ({
    onAssignUser,
    sender,
    url,
    create,
    formValues,
    updateFormValues,
  }: searchModalProps & {
    formValues: FieldValues;
    updateFormValues: (values: FieldValues) => void;
  }) => {
  const { isOpen, listingId, onClose } = useSearchModal();

  const { data: session, status } = useSession(); // Get the session and status from next-auth/react
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [notFoundUser, setNotFoundUser] = useState("");
  const [invitationSent, setInvitationSent] = useState(false);
  const [userAssigned, setUserAssigned] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);


  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<FieldValues>({
    defaultValues: {
      email: "",
      recipientId: "",
    },
  });

  const SearchModal = useSearchModal();

  const onSubmit: SubmitHandler<FieldValues> = async (data: any) => {
    if (status === "authenticated" && session?.user) {
      data.senderId = session.user.id;
      console.log("User authenticated");
    } else {
      // Handle the case when the user is unauthenticated or the session doesn't contain the user object
      // For example, you can redirect the user to the login page or show an error message
      console.log("User is not authenticated");
      return;
    }

    await axios
      .post("/api/searchUserByEmail", data)
      .then((response) => {
        const user: User | ErrorResponse = response.data;
        if ("error" in user) {
          // User not found
          toast.error("User not found!");
          setFoundUser(null);
          setNotFoundUser(data.email);
        } else {
          // User found
          toast.success("Search completed!");
          setFoundUser(user);
        }

        reset();
      })
      .catch((err) => {
        toast.error("Something went wrong!");
        setFoundUser(null);
        setNotFoundUser(data.email);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  

  const handleUserSelect = (user: User) => {
    setSelectedUser(foundUser);

    if (create) {

        const updatedFormValues = {
            ...formValues,
            recipientId: foundUser?.id,
        };

        updateFormValues(updatedFormValues);
        setUserAssigned(true)

      
    } else {
      axios
        .post("/api/assignUserToListing", {
          listingId: listingId, 
          userId: user.id,
        })
        .then((response) => {
          if (response.status === 200) {
            toast.success("User assigned successfully!");
            SearchModal.onClose();
            setUserAssigned(true)
          }
        })
        .catch((err) => {
          console.log("Something went wrong!");
          toast.error("Something went wrong!");
        });
    }
  };

  const handleEmailSubmit = async () => {
    if (create) {
        console.log("user assigned")
    } else {
    await axios
      .post("/api/email/sendUserEmailInvitation", {
        email: notFoundUser,
        sender: sender,
        url: url,
      })
      .then((response) => {
        if (response.status === 200) {
          toast.success("Invitation sent successfully!");
          console.log("Invitation sent successfully!");
          setInvitationSent(true);
        }
        reset();
      })
      .catch((err) => {
        toast.error("Something went wrong!");
        console.log("Something went wrong!");
      })
      .finally(() => {
        setIsLoading(false);
      });
    };
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-nowrap gap-2 items-center">
        {!userAssigned && (
          <>
            <Input
              id="email"
              label="Enter user email"
              type="email"
              required
              register={register}
            />
            <button
              className="bg-orange-500 px-2 my-auto rounded-md mr-auto text-sm py-2 text-white flex gap-2 items-center"
              onClick={handleSubmit(onSubmit)}
            >
              Search <BiChevronRight />
            </button>{" "}
          </>
        )}
      </div>
      {foundUser ? (
        <div className="px-4 py-2 flex rounded border-gray-200 justify-between">
          <div>{foundUser.name ? foundUser.name : foundUser.email}</div>
          <div className="flex gap-2">
            {userAssigned && (
                <button
                onClick={() => setUserAssigned(false)}
                className="
          bg-orange-500 
          px-2 rounded-md 
          text-sm py-1 
          text-white 
          flex 
          gap-2 
          items-center
          "
              >
               Change 
              </button>
            )}
            <button
              onClick={() => handleUserSelect(foundUser)}
              className="
        bg-orange-500 
        px-2 rounded-md 
        text-sm py-1 
        text-white 
        flex 
        gap-2 
        items-center
        "
            >
             {userAssigned ? `Assigned ` : `Assign`}  
            </button>
          </div>
        </div>
      ) : (
        <div>
          {notFoundUser !== "" &&
            (invitationSent ? (
              <p className="font-bold mt-2">
                Invitation sent to {notFoundUser}
              </p>
            ) : (
              <>
                <p className="font-bold mt-2">No user found</p>
                <div className="flex justify-between">
                  <div>
                    Send an invitation to{" "}
                    <span className="font-bold">{notFoundUser}</span>
                  </div>{" "}
                  <button
                    className=" 
                    bg-orange-500 
                    px-2 rounded-md 
                    text-sm py-1 
                    text-white 
                    flex 
                    gap-2 
                    items-center
                  "
                    onClick={() => handleEmailSubmit()}
                  >
                    Send <BiChevronRight />
                  </button>
                </div>
              </>
            ))}
        </div>
      )}
    </div>
  );
};

export default UserSelect;
