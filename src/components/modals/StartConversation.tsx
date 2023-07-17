"use client";

import React, { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import Heading from "./Heading";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import Input from "../inputs/Input";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { User } from "@prisma/client";
import { BiArrowToRight, BiChevronRight } from "react-icons/bi";
import useStartConversation from "@/hooks/useStartConversation";
import { set } from "date-fns";

export interface ErrorResponse {
  error: string;
}

interface StartConversationProps {
  onAssignUser?: (user: User) => void;
  buyer?: User;
  url?: string;
  setSellerId?: (newSellerId: string | null) => void; //
}
const StartConversation = ({}: StartConversationProps) => {
  const { data: session, status } = useSession(); 
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const setActiveConversation = useStartConversation((state) => state.setActiveConversation);
  const setUsername = useStartConversation((state) => state.setUsername);
  const [notFoundUser, setNotFoundUser] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      email: "",
    },
  });

  const startConversaton = useStartConversation();

  const onSubmit: SubmitHandler<FieldValues> = async (data: any) => {

    await axios
    .get(`/api/getUserByUsernameApi?username=${data.username}`)
    .then((response) => {
      const user: User | ErrorResponse = response.data;
      if ("error" in user) {
        setFoundUser(null);
        setNotFoundUser(data.username);
      } else {
        setFoundUser(user);
      }

      reset();
    })
    .catch((err) => {
      toast.error(`${data.username} not found!}`);
      setFoundUser(null);
      setNotFoundUser(data.username);
    })
    .finally(() => {
      setIsLoading(false);
    });
};
  const data = {
    userId: session?.user?.id,
    recipientId: foundUser?.id,
  };

  const onSendMessage: SubmitHandler<FieldValues> = async (data: any) => {
    data.message = data.message;
    data.userId = session?.user?.id;
    data.recipientId = data.recipientId;
    data.username = notFoundUser;
  
    axios
      .post("/api/newConversation", data)
      .then((response) => {
        if (response.status === 200) {
          const newConversation = response.data;
          setActiveConversation((prevConversation: any) => {
            return { ...newConversation, directMessages: prevConversation.directMessages };
          });
          setUsername(newConversation.participant2.username);
          toast.success("New conversation started!");
        }
      })
      .catch((err) => {
        console.log("Something went wrong!");
      })
      .finally(() => {
        startConversaton.onClose();
        reset();
      });
  };
  

  const handleUserSelect = (user: any) => {
    setSelectedUser(user);
    axios
      .get("/api/checkConversation", {
        params: {       
          userId: data.userId,
          recipientId: data.recipientId,
        },
      })
      .then((response) => {
        const conversationExists = response.data;

        if (conversationExists) {
          setActiveConversation(conversationExists);
          setUsername(conversationExists.participant2.username);
        } else {
          axios
            .post("/api/newConversation", data)
            .then((response) => {
              if (response.status === 200) {
                const newConversation = response.data;
                setActiveConversation(newConversation);
                setUsername(newConversation.participant2.username);
               
                toast.success("New conversation started!");
              }
            })
            .catch((err) => {
              console.log("Something went wrong!");
            });
        }
      })
      .catch((err) => {
        console.log("Error checking conversation:", err);
        toast.error("Something went wrong!");
      }).finally(() => {
        startConversaton.onClose();
        reset();
      });
  };

  let bodyContent = (
    <div className="flex flex-col">
      <Heading
        title="Start a conversation"
        description="Select a user to start a conversation with"
      />
      
      {!notFoundUser ? (
        <>
        <Input
         id="username"
         label="Enter Username"
         type="text"
         required
         register={register}
       />
        </>
        
      ) : (
        <>
        <div className="flex mb-4">
        <input type="text" disabled value={notFoundUser} className="border border-gray-200 rounded-md px-4 py-2 w-full"/>
        <button onClick={() => setNotFoundUser("")} className="bg-orange-400 px-4 py-2 text-white flex-1 rounded-r-md">Change</button>
            
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
        <textarea
        className="w-full h-20 border border-gray-200 rounded-md px-4 py-2 mb-4"
        placeholder="Enter a message" {...register("message")} />

        <button
        onClick={handleSubmit(onSendMessage)}
          type="button"
          className="p-2 bg-orange-400 rounded-md text-xs text-white">
            Send message
        </button>

        </form>
        
        </>
      )
    }
     

      {foundUser && (
        <>
        <div className="flex justify-between items-center">
          {foundUser.username}
          <button
            onClick={() => handleUserSelect(foundUser)}
            className="p-2 bg-orange-400 rounded-md text-xs text-white"
          >
            Select user
          </button>
        </div>
        <div>

            
        </div>
        
        </>

      )}

     
    </div>
  );

  return (
    <Modal
      title="Search for a user"
      isOpen={startConversaton.isOpen}
      onClose={startConversaton.onClose}
      onSubmit={handleSubmit(onSubmit)}
      actionLabel={"Search"}
      body={bodyContent}
    />
  );
};

export default StartConversation;
