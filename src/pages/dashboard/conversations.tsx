import prisma from "@/libs/prismadb";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { useState, useEffect, use, useCallback } from "react";
import { DirectMessage, User } from "@prisma/client";
import {
  BiChevronLeftCircle,
  BiChevronRightCircle,
  BiPlus,
} from "react-icons/bi";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { Dash } from "@/templates/dash";
import getFriendsByUserId from "@/actions/getFriendsByUserId";
import useStartConversation from "@/hooks/useStartConversation";
import axios from "axios";
import { useRef } from "react";
import ImageTextArea from "@/components/inputs/ImageTextArea";
import { toast } from "react-hot-toast";
import MessageComponent from "@/components/chat/Message";
import getConversationsByUserId from "@/actions/getConversationsByUserId";
import { set } from "date-fns";

interface IDirectMessage {
  id: string;
  text: string | null;
  userId: string;
  conversationId: string;
  image: string | null;
}

interface Conversation {
  id: string;
  participant1: User;
  participant2: User;
  participant1Id: string;
  participant2Id: string;
  createdAt: string;
  updatedAt: string;
  directMessages: DirectMessage[];
}

const Conversations = ({ safeConversations, session }: any) => {
  const [allConversations, setAllConversations] =
    useState<Conversation[]>(safeConversations);
  const [activeConversationState, setActiveConversationState] =
    useState<Conversation | null>(safeConversations[0]);

  const initialUsername =
    activeConversationState?.participant1Id === session?.user?.id
      ? activeConversationState?.participant2?.username || ""
      : activeConversationState?.participant1?.username || "";
  const [isOpen, setIsOpen] = useState(
    typeof window !== "undefined" && window.innerWidth > 768
  );

  const handleSidebarToggle = () => {
    setIsOpen(!isOpen);
  };

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<IDirectMessage[]>(
    activeConversationState?.directMessages || []
  );

  const [username, setUsername] = useState<string>(initialUsername || "");
  const startConversation = useStartConversation();
  const {
    register,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      message: "",
      id: "",
      userId: "",
      image: "",
    },
  });

  const handleSetActiveConversation = (conversation: Conversation) => {
    setActiveConversationState(conversation);
    const setUser =
      conversation.participant1Id === session?.user?.id
        ? conversation.participant2?.username || ""
        : conversation.participant1?.username || "";
    setUsername(setUser);
  };

  const setActiveConversation = (newConversation: any) => {
    setActiveConversationState(newConversation);
    setMessages(newConversation?.directMessages || []);
  };

  const handleButtonClick = () => {
    startConversation.onOpen(setActiveConversation, setUsername);
  };

  useEffect(() => {
    setMessages(activeConversationState?.directMessages || []);
  }, [activeConversationState]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (image: string, text: string) => {
    try {
      const response = await axios.post("/api/newConversationMessage", {
        userId: session?.user?.id,
        id: activeConversationState?.id,
        image: image,
        text: text,
      });

      if (response.status === 200) {
        const newMessage = response.data;
        toast.success("Message sent successfully");

        setActiveConversationState((prevState) => {
          if (prevState) {
            const updatedConversation: any = {
              ...prevState,
              directMessages: [...newMessage?.directMessages],
            };
            return updatedConversation;
          } else {
            return null;
          }
        });
      }

      reset();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <Dash meta={<title>Conversations</title>}>
      <div className="flex border-r-2 border-gray-200">
        <div
          className={`lg:w-1/5 border-r-2 border-l-2 border-gray-200 w-auto ${
            isOpen ? "lg:w-1/5 block" : "lg:w-[40px]"
          } border-r-2 border-l-2 border-gray-200 `}
        >
          <div
            className={`border-b-2 border-gray-200 py-5 px-4 bg-slate-100 relative`}
          >
            {/* <button
              onClick={handleButtonClick}
              className={`${
                !isOpen ? "hidden" : "block"
              } rounded-full px-2 py-1 text-sm bg-orange-500 text-white flex items-center gap-2}`}
            >
              <div className="hidden md:block">Start a conversation</div>
              <div className="block md:hidden">New</div>
              <BiPlus />
            </button>*/}
            <button
              onClick={handleSidebarToggle}
              className="absolute right-0 top-[50%] bottom-[50%] bg-gray-200 rounded-full px-1 py-1 text-xl text-gray-600 flex items-center gap-2"
            >
              {isOpen ? <BiChevronLeftCircle /> : <BiChevronRightCircle />}
            </button>
          </div>
          <div className={`${isOpen ? "block" : "hidden"}`}>
            {allConversations.map((conversation: any) => {
              const setUser =
                conversation.participant1Id === session?.user?.id
                  ? conversation.participant2?.username
                  : conversation.participant1?.username;
              return (
                <div
                  key={conversation.id}
                  className="border-b border-gray-200 p-4 flex gap-4"
                  onClick={() => handleSetActiveConversation(conversation)}
                >
                  <div className="w-[40px] lg:w-1/5">
                    <img
                      src="/images/placeholders/avatar.png"
                      className="rounded-full border-2 border-gray-200 p-1"
                    />
                  </div>
                  <div>
                    <div>
                      <button
                        onClick={handleSidebarToggle}
                        className={`absolute right-0 top-[50%] bottom-[50%] bg-gray-200 rounded-full px-1 py-1 text-xl text-gray-600 flex items-center gap-2 ${
                          !isOpen ? "block" : "hidden"
                        }}`}
                      >
                        {isOpen ? (
                          <BiChevronLeftCircle />
                        ) : (
                          <BiChevronRightCircle />
                        )}
                      </button>
                    </div>
                    <div className="font-medium">
                      {conversation.participant1Id === session?.user?.id
                        ? conversation.participant2?.username
                        : conversation.participant1?.username}
                    </div>
                    <div className="text-gray-400">
                      {conversation.directMessages.length === 0 ||
                      conversation.directMessages[
                        conversation.directMessages.length - 1
                      ].text === ""
                        ? conversation.directMessages[
                            conversation.directMessages.length - 1
                          ].image
                          ? "image.png"
                          : "No messages yet"
                        : conversation.directMessages[
                            conversation.directMessages.length - 1
                          ].text}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex-grow flex flex-col">
          <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200 px-4">
            <div className="relative flex items-center space-x-4">
              <div className="relative">
                <img
                  src="/images/placeholders/avatar.png"
                  className="rounded-full border-2 border-gray-200 p-1 h-14"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <div className="text-2xl mt-1 flex items-center">
                  <span className="text-gray-700 mr-3">{username}</span>
                </div>
              </div>
            </div>
          </div>

          <div
            id="messages"
            className="flex flex-col space-y-4 p-3 overflow-y-auto scrollbar-thumb-orange scrollbar-thumb-rounded scrollbar-track-orange-lighter scrollbar-w-2 scrolling-touch bg-white"
            style={{ height: "calc(100vh - 28rem)" }}
          >
            <div className="col-span-12 flex justify-between items-center">
              <div className="border-t border-gray-200 h-1 w-full hidden lg:block"></div>
              <div className="lg:w-auto lg:whitespace-nowrap  text-center mx-4 text-sm text-gray-500">
                We are here to protect you from fraud please do not share your
                personal information
              </div>
              <div className="border-t border-gray-200 w-full  hidden lg:block"></div>
            </div>
            {messages.map((message, index) => {
              if (message.text == "" && message.image == "") {
                return null;
              }
              return (
                <MessageComponent
                  key={message.id}
                  message={message}
                  session={session}
                  ref={index === messages.length - 1 ? messagesEndRef : null}
                />
              );
            })}
          </div>
          <div className="border-t-2 mt-auto border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
            <ImageTextArea onSubmit={handleSubmit} />
          </div>
        </div>
      </div>
    </Dash>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  const user = session?.user;

  const friends = await getFriendsByUserId(user?.id);

  const safeConversations = await getConversationsByUserId(user?.id);

  return {
    props: {
      safeConversations,
      session,
      friends,
    },
  };
};

export default Conversations;
