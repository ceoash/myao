import React, { useEffect, useState } from "react";
import Input from "../inputs/Input";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { timeSince } from "@/utils/formatTime";
import EmojiPicker from "emoji-picker-react";

interface MessageProps {
  senderId: string;
  recipientId: string; // changed from recipeintId
  listingId: string;
  text: string;
}

const Timeline = ({ listing, user, disabled }: any) => {
  const [messages, setMessages] = useState<MessageProps[]>([]);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  // Fetch messages when the component mounts and when the listing changes
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `/api/getListingMessages?listingId=${listing.id}`
        );
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [listing]);

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

  const onSubmit: SubmitHandler<FieldValues> = async (data: any) => {
    try {
      // Send the message
      const response = await axios.post("/api/newBidMessage", {
        listingId: listing.id,
        senderId: user.id,
        recipientId: listing.recipientId,
        message: data.message,
      });

      // Check for successful response
      if (response.status === 200) {
        // Append new message to existing messages
        setMessages((oldMessages) => [
          ...oldMessages,
          {
            senderId: user.id,
            listingId: listing.id,
            recipientId: listing.recipientId,
            text: data.message,
          },
        ]);
      }

      reset();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col flex-auto flex-shrink-0  bg-white h-full p-4 mb-4">
      <div className="flex flex-col h-full overflow-x-auto mb-4">
        <div className="flex flex-col h-full">
          <div className="md:grid md:grid-cols-12 gap-y-2">
            {disabled && (
              <div className="col-span-12 bg-orange-100 p-4 rounded-md ">Assign a user to start negotiating</div>
            )}
            {messages?.map((message: any) => {
              const dateString = message.createdAt;

              return (
                <div
                  key={message.id}
                  className={
                    message.senderId === user.id
                      ? `col-start-6 col-end-13 p-3 roundedLg`
                      : `col-start-1 col-end-8 p-3 roundedLg`
                  }
                >
                  <div
                    className={
                      message.senderId === user.id
                        ? `flex items-center justify-start flex-row-reverse`
                        : `flex flex-row items-center`
                    }
                  >
                    <div className="flex items-center justify-center h-10 w-10 rounded-full text-white bg-orange-500 flex-shrink-0">
                      A
                    </div>
                    <div
                      className={`relative ml-3 text-sm ${
                        message.senderId === user.id
                          ? `bg-orange-100`
                          : `bg-white`
                      } py-2 px-4 shadow rounded-xl`}
                    >
                      {message.sender?.id === user.id ? (
                        <div className="font-bold">You</div>
                      ) : (
                        <div className="font-bold">A</div>
                      )}
                      <div className="mb-1">{message.text}</div>
                      <div className="text-xs text-gray-500">
                        <i>{timeSince(new Date(dateString))} ago</i>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex flex-row items-center h-16 rounded-xl bg-white w-full px-0">
        {/* <div>
          
          <button className="flex items-center justify-center text-gray-400 hover:text-gray-600">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              ></path>
            </svg>
          </button>
        </div> */}
        <div className="flex-grow ">
          <div className="relative w-full">
            <Input
              id="message"
              placeholder="Message"
              label=""
              register={register}
              disabled={disabled}
            />
            <button className="absolute flex items-center justify-center h-full w-12 right-0 top-0 text-gray-400 hover:text-gray-600" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </button>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={handleSubmit(onSubmit)}
            className={`flex items-center justify-center ${disabled ? `bg-gray-400`:`bg-orange-500 hover:bg-orange-600`} rounded-md text-white px-4 py-2 flex-shrink-0`}
            disabled={disabled}
          >
            <span className="hidden md:block">Send</span>
            <span className="ml-2">
              <svg
                className="w-4 h-4 transform rotate-45 -mt-px"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                ></path>
              </svg>
            </span>
          </button>
          {showEmojiPicker && (
            <div className="absolute right-0">
              <EmojiPicker onEmojiClick={(emoji) => console.log(emoji)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
