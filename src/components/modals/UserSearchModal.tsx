"use client";

import React, { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import useSearchModal from "@/hooks/useSearchModal";
import Heading from "./Heading";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import Input from "../inputs/Input";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { User } from "@prisma/client";
import { BiArrowToRight, BiChevronRight } from "react-icons/bi";
import assignUserToListing from "@/actions/assignUserToListing";

export interface ErrorResponse {
  error: string;
}

interface searchModalProps {
  onAssignUser?: (user: User) => void;
  buyer?: User;
  url?: string;
  setSellerId?: (newSellerId: string | null) => void; // 
  setStatus?: (newStatus: string | null) => void; // 

}
const SearchModal = ({ onAssignUser, buyer, url, setSellerId, setStatus }: searchModalProps) => {
  const { isOpen, listingId, onClose } = useSearchModal();

  const { data: session, status } = useSession();
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [notFoundUser, setNotFoundUser] = useState("");
  const [invitationSent, setInvitationSent] = useState(false);

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
    },
  });

  interface SearchModalProps {
    onAssignUser: (user: User) => void;
  }

  const SearchModal = useSearchModal();

  const onSubmit: SubmitHandler<FieldValues> = async (data: any) => {

    data.username = data.username.toLowerCase();
    
    await axios
      .post("/api/searchUserByUsername", data)
      .then((response) => {
        const user: User | ErrorResponse = response.data;
        if ("error" in user) {
          toast.error("User not found!");
          setFoundUser(null);
          setNotFoundUser(data.username);
        } else {
          setFoundUser(user);
        }

        reset();
      })
      .catch((err) => {
        toast.error("Something went wrong!");
        setFoundUser(null);
        setNotFoundUser(data.username);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  const handleUserSelect = (user: any) => {
    setSelectedUser(user);
    if (setSellerId) {
      setSellerId(user.id || null);
    }
    axios
      .post("/api/assignUserToListing", {
        listingId: listingId, 
        userId: user.id,
      })
      .then((response) => {
        router.refresh();

        if (response.status === 200) {
          toast.success("User assigned successfully!");
          SearchModal.onClose();
        }
      })
      .catch((err) => {
        console.log("Something went wrong!");
        toast.error("Something went wrong!");
      });
  };

  const handleEmailSubmit = async () => {
    await axios
      .post("/api/email/sendUserEmailInvitation", {
        email: notFoundUser,
        buyer: buyer,
        url: url,
      })
      .then((response) => {
        if (response.status === 200) {
          setInvitationSent(true);
        }
        reset();
      })
      .catch((err) => {
        console.log("user not found");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  let bodyContent = (
    <div className="flex flex-col">
      <Heading
        title="Search for a user"
        description="Search for a user to send the offer to"
      />
      <Input
        id="username"
        label="Enter Username"
        type="text"
        required
        register={register}
        username={true}
      />
      {foundUser ? (
        <div className="px-4 py-2 flex rounded border-gray-200 justify-between">
          <div>{foundUser.name ? foundUser.name : foundUser.email}</div>
          <div>
            <button
              onClick={() => handleUserSelect(foundUser)}
              className="
        bg-orange-400 
        px-2 rounded-md 
        text-sm py-1 
        text-white 
        flex 
        gap-2 
        items-center
        "
            >
              Assign <BiChevronRight />
            </button>
          </div>
        </div>
      ) : (
        <div>
          {notFoundUser !== "" && (
            invitationSent ? (
              <p className="font-bold mt-2">Invitation sent to {notFoundUser}</p>
            ) :
            <>
              <p className="font-bold mt-2">No user found</p>
              <div className="flex justify-between">
                <div>
                  Send an invitation to{" "}
                  <span className="font-bold">{notFoundUser}</span>
                </div>{" "}
                <button
                  className=" 
                    bg-orange-400 
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
          )}
        </div>
      )}
    </div>
  );

  return (
    <Modal
      title="Search for a user"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      actionLabel={"Search"}
      body={bodyContent}
    />
  );
};

export default SearchModal;
