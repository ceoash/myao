"use client";

import React, { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-hot-toast";
import { User } from "@prisma/client";
import { BiChevronRight, BiSearch } from "react-icons/bi";
import useQuickConnect from "@/hooks/useQuickConnect";
import { useRouter } from "next/router";
import SearchInput from "../inputs/SearchInput";

export interface ErrorResponse {
  error: string;
}

const QuickConnectModal = () => {
  const { isOpen, onClose, foundUser } = useQuickConnect();
  const [foundUserStore, setFoundUserStore] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = React.useState("");



  const {
    handleSubmit,
    formState: { errors },
    reset,
    register,
  } = useForm<FieldValues>({
    defaultValues: {
      email: "",
    },
  });

  const QuickConnect = useQuickConnect();
  const router = useRouter();
  const isFormValid = Object.keys(errors).length === 0;

  useEffect(() => {
    setFoundUserStore(QuickConnect.foundUser);
  }, [QuickConnect.foundUser]);

  const onSearch = async () => {
    try {
      const response = await axios.get(
        `/api/getUserByUsernameApi?username=${search}`
      );
      setFoundUserStore(response.data);
    } catch (error) {
      console.log("Error while searching user:", error);
    }
  };

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    if (!foundUserStore) {
      toast.error("Please select a user!");
      return;
    }

    setIsLoading(true);

    const requestData = {
      ...data,
      recipientId: foundUserStore.id,
      userId: QuickConnect.sessionId,
    };

    try {
      await axios.post("/api/newConversation", requestData);
      reset();
      toast.success("Message sent successfully!");
      onClose();
      // router.push("/dashboard/conversations");
    } catch (error) {
      console.log("Error while submitting form:", error);
      toast.error("Something went wrong!");
    } finally {
      setIsLoading(false);
      router.push("/dashboard/conversations");
    }
  };

  const handleUserSelect = () => {
    setFoundUserStore(null);
    setIsLoading(false);
  };

  let bodyContent = (
    <div className="flex flex-col">
      {foundUserStore ? (
        <div className="px-4 py-2 flex flex-col rounded border-gray-200 justify-between">
          <div className="flex justify-between w-full mb-2">
            <div>
              <div className="font-bold">Found:</div>
              <div className="text-6xl font-bold text-orange-600 -mt-8">
                {foundUserStore.username
                  ? foundUserStore.username
                  : foundUserStore.email}
              </div>
            </div>
            <button
              onClick={handleUserSelect}
              className="
                bg-orange-500 
                px-2 rounded-md 
                text-sm py-1 
                text-white 
                flex 
                gap-2 
                items-center
                my-auto
                "
            >
              Change <BiChevronRight />
            </button>
          </div>

          <div className="w-full  ">
            <div>
              <div className="font-bold">Are you a</div>
              <div className="flex gap-2 -mt-2 mb-4">
                <label className="inline-flex items-center mt-3 gap-1">
                  Buyer
                  <input
                    type="radio"
                    className="form-radio h-5 w-5 text-orange-600 accent-orange-600"
                    value="buyer"
                    {...register("accountType", { required: true })}
                  />
                </label>
                <label className="inline-flex items-center mt-3 gap-1">
                  Seller
                  <input
                    type="radio"
                    className="form-radio h-5 w-5 text-orange-600 accent-orange-600"
                    value="seller"
                    {...register("accountType", { required: true })}
                  />
                </label>
              </div>
              {errors.accountType && typeof errors.accountType.message === "string" && (
              <div className="text-red-500">{errors.accountType.message}</div>
            )}
            </div>
            <textarea
              className="w-full border-2 border-gray-200 rounded-md"
              id="message"
              rows={6}
              required
              placeholder="Write a quick message to send to the user"
              {...register("message", { required: true })}
            ></textarea>

            {errors.description && typeof errors.description.message === "string" && (
              <div className="text-red-500">{errors.description.message}</div>
            )}
          </div>
        </div>
      ) : (
        <SearchInput 
          search={search} 
          setSearch={setSearch} 
          onSearch={onSearch} 
          placeholder="Enter MYAO name to connect" />
      )}
    </div>
  );

  return (
    <Modal
      title="Quick Connect"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      actionLabel={"Send"}
      body={bodyContent}
      disabled={!isFormValid || isLoading}
    />
  );
};

export default QuickConnectModal;
