import React, { useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { useRef } from 'react';
import ImageTextArea from "../inputs/ImageTextArea";
import ChatMessage from "./ChatMessage";

interface MessageProps {
  buyerId: string;
  sellerId: string; // changed from recipeintId
  listingId: string;
  text: string;
  id: string;
}

const Timeline = ({ listing, user, disabled, session }: any) => {
  const [messages, setMessages] = useState<MessageProps[]>([]);

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
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      message: "",
      image: "",
    },
  });

  const now = new Date();
  const time = now.getHours() + ":" + now.getMinutes();

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (image: string, text: string) => {
        
    try {
      // Send the message
      const response = await axios.post("/api/newBidMessage", {
        listingId: listing.id,
        buyerId: user.id,
        sellerId: listing.sellerId,
        message: text,
        image: image,
        userId: session.user.id,
      });

      if (response.status === 200) {
        const newMessage = response.data;
        setMessages((oldMessages) => [
          ...oldMessages,
          {
            ...newMessage,
            createdAt: new Date(),
            buyerId: user.id,
            listingId: listing.id,
            sellerId: listing.sellerId,
            text: text,
            image: image,
            userId: session.user.id,
          },
        ]);
      }

      reset();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col flex-auto flex-shrink-0  bg-gray-100 h-full p-4 mb-4">
      <div className="flex flex-col h-full overflow-x-auto mb-4">
        <div className="flex flex-col h-full">
          <div className="md:grid md:grid-cols-12 gap-y-2">
            <div className="col-span-12 flex justify-between items-center">
              <div className="border-t border-gray-200 h-1 w-full"></div>
              <div className="lg:w-auto lg:whitespace-nowrap text-center mx-4 text-sm text-gray-500 hidden lg:block">
                We are here to protect you from fraud please do not share your personal information
              </div>
              <div className="border-t border-gray-200 w-full hidden lg:block"></div>
            </div>
            {disabled && (
              <div className="col-span-12 bg-orange-100 p-4 rounded-md ">
                Assign a user to start negotiating
              </div>
            )}
            {messages.length === 0 && !disabled && (
              <div
                className={`relative ml-3 text-sm col-span-4 border-2 border-orange-300 rounded-lg p-2 bg-orange-200`}
              >
                <div className="mb-1">
                  Write a message to start your negotiation
                </div>
              </div>
            )}
            <div
            id="messages"
            className="flex flex-col space-y-4 p-3 overflow-y-auto scrollbar-thumb-orange scrollbar-thumb-rounded scrollbar-track-orange-lighter scrollbar-w-2 scrolling-touch bg-white col-span-12"
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
          </div>
        </div>
      </div>
      <ImageTextArea onSubmit={handleSubmit} />
    </div>
  );
};

export default Timeline;
