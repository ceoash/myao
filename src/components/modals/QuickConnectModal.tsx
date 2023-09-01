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
import { useSession } from "next-auth/react";
import Checkbox from "../inputs/Checkbox";
import Button from "../dashboard/Button";

export interface ErrorResponse {
  error: string;
}

const QuickConnectModal = () => {
  const { isOpen, onClose, foundUser } = useQuickConnect();
  const [foundUserStore, setFoundUserStore] = useState<User | null>(null);
  const [search, setSearch] = React.useState("");
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

 const [checked, setChecked] = useState({
    buyer: false,
    seller: false,
 });

  const {
    handleSubmit,
    formState: { errors },
    reset,
    register,
    setError,
    clearErrors,
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

  const onSearchUser = () => {
    if (!search) {
      toast.error("Please enter a username!");
      return;
    }
    setIsLoading(true);
    toast.success("Searching...");
    axios
      .get(`/api/getUserByUsernameApi?username=${search.toLowerCase()}`)
      .then((res) => {
        if (res.data.id && res.data.id === session?.user?.id) {
          toast.error("You can't create an offer with yourself");
          setFoundUserStore(null);
          setError("user", {
            message: "You can't create an offer with yourself",
          });
          setIsLoading(false);
        } else {
          setFoundUserStore(res.data);
          clearErrors("user");
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.log("error");
      })
      .catch((err) => {
        toast.error("Something went wrong!");
        setFoundUserStore(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleCheck = (check: string) => {
    if (check === "buyer") {
      setChecked({
        buyer: true,
        seller: false,
      });
    } else {
      setChecked({
        buyer: false,
        seller: true,
      });
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
      router.push("/dashboard/conversations");
      setIsLoading(false);
    }
  };

  const handleUserSelect = () => {
    setFoundUserStore(null);
    setIsLoading(false);
  };

  let bodyContent = (
    <div className="flex flex-col">
      {foundUserStore && foundUserStore?.id ? (
        <div className="px-4 py-2 flex flex-col rounded border-gray-200 justify-between">
          <div className="w-full mb-2">
            <div className="font-bold">Connect with:</div>
            <div className="flex gap-2">
              <div className="text-3xl font-bold text-orange-600 ">
                {foundUserStore.username
                  ? foundUserStore.username
                  : foundUserStore.email}
              </div>
              <button
                onClick={handleUserSelect}
                className="
                bg-gray-default 
                px-2 rounded-md 
                text-xs font-bold py-1 
                text-gray-800
                flex 
                gap-2 
                items-center
                my-auto
                "
              >
                Change <BiChevronRight />
              </button>
            </div>
          </div>

          <div className="w-full  ">
            <div>
              <div className="font-bold">Are you a</div>
              <div className="flex gap-2 my-4">
                <Checkbox
                  radio
                  id="buyer"
                  label="Buyer"
                  {...register("accountType" )}
                  checked={checked.buyer}
                  onClick={() => handleCheck}
                />

                <Checkbox
                  radio
                  id="seller"
                  label="Seller"
                  {...register("accountType")}
                  checked={checked.seller}
                  onClick={() => handleCheck}
                />
              </div>
              {errors.accountType &&
                typeof errors.accountType.message === "string" && (
                  <div className="text-red-500">
                    {errors.accountType.message}
                  </div>
                )}
            </div>
            <textarea
              className="w-full border-2 border-gray-200 rounded-md ring-0 active:ring-0 focus:ring-0 focus:outline-0 focus:ring-white p-2"
              id="message"
              rows={6}
              required
              placeholder="Write a quick message to send to the user"
              {...register("message", { required: true })}
            ></textarea>

            <div className="flex justify-end">
              <Button label="Send" onClick={handleSubmit(onSubmit)} />
            </div>

            {errors.description &&
              typeof errors.description.message === "string" && (
                <div className="text-red-500">{errors.description.message}</div>
              )}
          </div>
        </div>
      ) : (
        <>
          <SearchInput
            search={search}
            setSearch={setSearch}
            onSearch={handleSubmit(onSearchUser)}
            placeholder="Enter MYAO name to connect"
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );

  return (
    <Modal
      title="Quick Connect"
      isOpen={isOpen}
      body={bodyContent}
      disabled={!isFormValid || isLoading}
      isLoading={isLoading}
    />
  );
};

export default QuickConnectModal;
