import React, { useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { useRef } from "react";
import ImageTextArea from "../inputs/ImageTextArea";
import ChatMessage from "./ChatMessage";

import io, { Socket } from "socket.io-client";
import { config } from "@/config";
import { Listing, User } from "@prisma/client";

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
  bidder: User;
}

interface ListingChatProps {
  listing: SafeListing;
  user: any;
  disabled?: boolean;
  session: any;

}

const ListingChat = ({ listing, user, disabled, session }: ListingChatProps) => {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMessages([...listing.messages].reverse());
    setIsLoading(false);
  }, [listing.messages]);



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

  const now = new Date();

  const socketRef = useRef<Socket>();

  useEffect(() => {
    socketRef.current = io(config.PORT);
    socketRef.current.on("new_listing_message", (newMessage: any) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

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
    <div className="flex flex-col flex-auto flex-shrink-0  bg-white h-full p-4 border-2 border-gray-200 rounded-lg">
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
            {messages.length === 0 ? (
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
                    key={index}
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
      <div className="bg-orange-50">

      <ImageTextArea onSubmit={handleSubmit} />
      </div>
      </>
  );
};

export default ListingChat;
