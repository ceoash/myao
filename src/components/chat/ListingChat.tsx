import React, { useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { useRef } from "react";
import ImageTextArea from "../inputs/ImageTextArea";
import ChatMessage from "./ChatMessage";

import io, { Socket } from "socket.io-client";
import { config } from "@/config";
import { Listing, User } from "@prisma/client";
import { is } from "date-fns/locale";

interface MessageProps {
  buyerId: string;
  sellerId: string;
  listingId: string;
  text: string;
  id: string;
}

interface SafeListing extends Listing{
  messages: MessageProps[];
  buyer: User;
  seller: User;
}

interface ListingChatProps {
  listing: SafeListing;
  user: any;
  disabled?: boolean;
  session: any;
  messages: MessageProps[];
  setMessages: React.Dispatch<React.SetStateAction<MessageProps[]>>;
  socketRef: React.MutableRefObject<Socket | undefined>;

}

const ListingChat = ({ listing, user, disabled, session, messages, setMessages, socketRef }: ListingChatProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const now = new Date();

  const {
    register,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      message: "",
      image: "",
    },
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (image: string, text: string) => {
    try {
      // Send message
      const response = await axios.post("/api/newBidMessage", {
        listingId: listing.id,
        buyerId: listing.buyerId,
        sellerId: listing.sellerId,
        message: text,
        image: image,
        userId: session.user.id,
      });

      if (response.status === 200) {
        const listing = response.data;
        const newMessage = listing.messages[listing.messages.length - 1];
        console.log(newMessage);
        socketRef.current?.emit("new_listing_message", newMessage);
      }

      reset();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <>
    <div className="flex flex-col flex-auto flex-shrink-0  bg-white h-full p-4 pt-6 border border-gray-200 rounded-lg">
      <div className="flex flex-col h-full mb-4">
        <div className="flex flex-col h-full">
          <div className="md:grid md:grid-cols-12 gap-y-2">
            <div className="col-span-12 flex justify-between items-center my-2">
              <div className="border-t border-gray-200 h-1 w-full"></div>
              <div className="lg:w-auto lg:whitespace-nowrap text-center mx-4 text-sm text-gray-500 hidden lg:block">
                We are here to protect you from fraud please do not share your
                personal information
              </div>
              <div className="border-t border-gray-200 w-full hidden lg:block"></div>
            </div>
            {isLoading ? <div className="col-span-12 flex justify-between items-center"> Loading... </div> : !messages ? (
              <div className="col-span-12 flex justify-between items-center">
                No messages yet
              </div>
            ) : (
              <div
                id="messages"
                className="flex flex-col space-y-4 p-3 overflow-y-auto scrollbar-thumb-orange scrollbar-thumb-rounded scrollbar-track-orange-lighter scrollbar-w-2 scrolling-touch bg-white col-span-12 rounded-lg"
                style={{ height: "calc(100vh - 28rem)" }}
              >
                {messages.map((message, index) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    session={session}
                    ref={index === messages.length - 1 ? messagesEndRef : null}
                    chat
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
      <div className="">

      <ImageTextArea onSubmit={handleSubmit} />
      </div>
      </>
  );
};

export default ListingChat;
