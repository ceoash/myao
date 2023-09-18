import axios from "axios";
import ImageTextArea from "../inputs/ImageTextArea";
import ChatMessage from "./ChatMessage";
import { useEffect, useState, useRef } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { useSocketContext } from "@/context/SocketContext";

interface MessageProps {
  buyerId: string;
  sellerId: string;
  listingId: string;
  text: string;
  id: string;
  read: boolean;
}

interface ListingChatProps {
  id: string;
  buyerId: string;
  sellerId: string;
  user: any;
  disabled?: boolean;
  session: any;
  messages: MessageProps[];
  setMessages: React.Dispatch<React.SetStateAction<MessageProps[]>>;
}

const ListingChat = ({ id, session, messages, buyerId, sellerId }: ListingChatProps) => {
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const socket = useSocketContext();

  const {
    formState: { errors }, reset
  } = useForm<FieldValues>({ 
    defaultValues: {
      message: "", 
      image: "" 
    } 
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (image: string, text: string) => {
    setIsSubmitting(true);
    
    try {
      const data = {
        listingId: id,
        buyerId: buyerId,
        sellerId: sellerId,
        message: text,
        image: image,
        userId: session?.user.id,
      };

      await axios.post("/api/newOfferMessage", data).then((response) => {
        const newMessage = response.data.messages[response.data.messages.length - 1];
        const message = {...newMessage};
        socket.emit("new_listing_message", message);
        reset();
      })
      .catch((error) => console.log(error))
      .finally(() => setIsSubmitting(false));
      
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <>
    <div className="flex flex-col flex-auto flex-shrink-0  bg-white -mt-6 border border-t-0 border-gray-200">
      <div className="flex flex-col">
        <div className="flex flex-col">
          <div className="md:grid md:grid-cols-12 gap-y-2">
            <div className="col-span-12 flex justify-between items-center my-6">
              <div className="border-t border-gray-200 h-1 flex-1"></div>
              <div className="lg:w-auto lg:whitespace-nowrap text-center mx-2 text-sm text-gray-500 block  flex-grow">
                We are here to protect you from fraud please do not share your
                personal information
              </div>
              <div className="border-t border-gray-200 flex-1"></div>
            </div>
            {isLoading ? <div className="col-span-12 flex justify-between items-center"> Loading... </div> : !messages ? (
              <div className="col-span-12 flex justify-between items-center">
                No messages yet
              </div>
            ) : (
              <div
                id="messages"
                className="space-y-4 overflow-y-auto scrollbar-thumb-orange scrollbar-thumb-rounded scrollbar-track-orange-lighter scrollbar-w-2 scrolling-touch bg-white col-span-12 rounded-lg px-4 pb-4"
                style={{ height: "calc(100vh - 34rem)" }}                
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
      <div className="px-4 pt-1 bg-gray-50 rounded-b-lg border border-gray-200 border-t-0">
        <ImageTextArea onSubmit={handleSubmit} isLoading={isSubmitting} />
      </div>
    </>
  );
};

export default ListingChat;
