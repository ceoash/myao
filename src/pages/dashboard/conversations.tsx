import axios from "axios";
import { DirectMessage, User } from "@prisma/client";
import getConversationsByUserId from "@/actions/getConversationsByUserId";
import getFriendsByUserId from "@/actions/getFriendsByUserId";

import MessageComponent from "@/components/chat/Message";
import ImageTextArea from "@/components/inputs/ImageTextArea";
import { config } from "@/config";
import { GetServerSideProps } from "next";
import { useState, useEffect, use } from "react";
import { useRef } from "react";
import io, { Socket } from "socket.io-client";
import { getSession } from "next-auth/react";
import { Dash } from "@/templates/dash";
import { FieldValues, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import {
  BiBlock,
  BiCheck,
  BiCheckCircle,
  BiChevronLeft,
  BiChevronRight,
  BiCross,
  BiUserCheck,
  BiUserMinus,
} from "react-icons/bi";
import { IoThumbsDown, IoThumbsUp } from "react-icons/io5";
import checkFriendship from "@/actions/checkFriendship";
import Link from "next/link";
import checkBlocked from "@/actions/checkBlocked";
import { is } from "date-fns/locale";
import getCurrentUser from "@/actions/getCurrentUser";
   

interface IDirectMessage {
  id: string;
  text: string | null;
  userId: string;
  conversationId: string;
  image: string | null;
}

interface IBlockedStatus {
  isBlocked: boolean;
  hasBlocked: boolean;
  isBlockedBy: string;
}

interface IUser {
  id: string;
  username: string;
  email: string;
  profile: {
    id: string;
    image: string;
    bio: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
  directMessages: IDirectMessage[];
  friends: IUser[];
  blockedFriends: any[];
  blockedBy: any[];
}

interface Conversation {
  id: string;
  participant1: IUser;
  participant2: IUser;
  participant1Id: string;
  participant2Id: string;
  createdAt: string;
  updatedAt: string;
  directMessages: DirectMessage[];
  friendStatus?: boolean;
  blockedStatus?: IBlockedStatus;
  status?: string;
}

const Conversations = ({ safeConversations, session, currentUser }: any) => {




  const filterBlockedConversation = safeConversations.filter(
    (conversation: any) => {
      const otherParticipant =
        conversation?.participant1Id === session?.user?.id
          ? conversation?.participant2
          : conversation?.participant1;

      
      const hasBlocked = session?.user?.blockedFriends?.some(
        (blockedFriend: any) =>
          blockedFriend.friendBlockedId === otherParticipant.id
      );

      const Blocked = otherParticipant?.blockedFriends?.some(
        (blockedFriend: any) =>
          blockedFriend.friendBlockedId === session?.user?.id
      );

      return !(hasBlocked || Blocked);
    }
  );

  const [activeConversationState, setActiveConversationState] =
    useState<Conversation | null>(filterBlockedConversation[0]);

  const [isFriend, setIsFriend] = useState<boolean | null>(
    activeConversationState?.friendStatus || null
  );
  const [isBlocked, setIsBlocked] = useState<boolean | null>(null);
  const [status, setStatus] = useState<string | null>()
  const [disabled, setDisabled] = useState<boolean>(false);

  useEffect(() => {
    if (status === "declined") {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [status]);

  let participant =
    activeConversationState?.participant1Id === session?.user?.id
      ? activeConversationState?.participant2Id
      : activeConversationState?.participant1Id;
  let participantUser =
    activeConversationState?.participant1Id === session?.user?.id
      ? activeConversationState?.participant2
      : activeConversationState?.participant1;
  let me =
    activeConversationState?.participant1Id === session?.user?.id
      ? activeConversationState?.participant1
      : activeConversationState?.participant2;
  const blockedChat = me?.blockedFriends?.some(
    (blockedFriend: any) => blockedFriend.friendBlockedId === participant
  );

  useEffect(() => {
    setIsBlocked(blockedChat || false);
  }, [blockedChat]);

  let participantUsername =
    activeConversationState?.participant1Id === session?.user?.id
      ? activeConversationState?.participant2?.username
      : activeConversationState?.participant1?.username;

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
  const { reset } = useForm<FieldValues>({
    defaultValues: {
      message: "",
      id: "",
      userId: "",
      image: "",
    },
  });

  const handleFollow = async () => {
    if (!isFriend) {
      try {
        const response = await axios.post("/api/addFriend", {
          followerId: session?.user?.id,
          followingId: participant,
        });
        toast.success("Friend request sent to " + participantUsername);
        setIsFriend(!isFriend);
      } catch (error) {
        toast.error("failed to follow user");
      }
    } else {
      try {
        const response = await axios.post("/api/deleteFriend", {
          followerId: session?.user?.id,
          followingId: participant,
        });
        toast.success("Unfollowed " + participantUsername);
        setIsFriend(!isFriend);
      } catch (error) {
        toast.error("failed to unfollow user");
      }
    }
  };

  const handleAccept = async () => {
    try {
      const response = await axios.post("/api/conversations/accept", {
        conversationId: activeConversationState?.id,
      });
      toast.success("accepted");
    } catch (error) {
      toast.error("failed to accept conversation");
    }
  };
  const handleDecline = async () => {
    try {
      const response = await axios.post("/api/conversations/decline", {
        conversationId: activeConversationState?.id,
      });
      toast.success("accepted");
    } catch (error) {
      toast.error("failed to decline conversation");
    }
  };

  const handleBlocked = async () => {
    if (isBlocked === false) {
      try {
        const response = await axios.post("/api/blockFriend", {
          userBlockedId: session?.user?.id,
          friendBlockedId: participant,
        });
        toast.success(participantUsername + " has been blocked");
        setIsBlocked(!isBlocked);
      } catch (error) {
        toast.error("failed to block user");
      }
    } else {
      try {
        const response = await axios.post("/api/removeBlocked", {
          userBlockedId: session?.user?.id,
          friendBlockedId: participant,
        });
        toast.success(participantUsername + " has been unblocked");
        setIsBlocked(!isBlocked);
      } catch (error) {
        toast.error("failed to unblock user");
      }
    }
  };

  const handleSetActiveConversation = (conversation: Conversation) => {
    setActiveConversationState(conversation);
    const setUser =
      conversation.participant1Id === session?.user?.id
        ? conversation.participant2?.username || ""
        : conversation.participant1?.username || "";
    setUsername(setUser);
  };

  useEffect(() => {
    setMessages(activeConversationState?.directMessages || []);
    setStatus(activeConversationState?.status || "none")
  }, [activeConversationState]);

  const socketRef = useRef<Socket>(); 

  useEffect(() => {
    const port = config.PORT;

    console.log(port);
    socketRef.current = io(port || "https://myao-add-1fcc5262bac8.herokuapp.com");
    socketRef.current.on("new_message", (newMessage: any) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setActiveConversationState((prevState) => {
        if (prevState) {
          const updatedConversation: any = {
            ...prevState,
            directMessages: [...prevState.directMessages, newMessage],
          };
          return updatedConversation;
        } else {
          return null;
        }
      });
    });

    socketRef.current.on("user_status_update", (updatedUser) => {
      if (updatedUser.id === participant) {
        setStatus(updatedUser.status);
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

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
        const conversation = response.data;
        const newMessage =
          conversation.directMessages[conversation.directMessages.length - 1];
        console.log(newMessage);
        socketRef.current?.emit("new_message", newMessage);
        toast.success("Message sent successfully");
      }
      reset();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <Dash meta={<title>Conversations</title>}>
      <div className="flex border-r-2 border-gray-200">
        {
          filterBlockedConversation.length > 0 ? (
            <>
        <div
          className={`lg:w-1/5 border-r-2 border-l-2 border-gray-200 w-auto relative ${
            isOpen ? "lg:w-1/5 block" : "lg:w-[40px]"
          } border-r-2 border-l-2 border-gray-200 `}
        >
          <div className={`py-5 px-4 absolute -right-8`}>
            {/* <button
              onClick={handleButtonClick}
              className={`${
                !isOpen ? "hidden" : "block"
              } rounded-full px-2 py-1 text-sm bg-orange-500 text-white flex items-center gap-2}`}
            >
              <div className="hidden md:block">Start a conversation</div>
              <div className="block md:hidden">New</div>
              <BiPlus />
            </button> */}
            <button
              onClick={handleSidebarToggle}
              className="top-[50%] bottom-[50%] mt-1 bg-orange-400 text-white rounded-full px-1 py-1 text-xl flex items-center text-orange-500"
            >
              {isOpen ? <BiChevronLeft /> : <BiChevronRight />}
            </button>
          </div>
          <div className={`${isOpen ? "block" : "hidden"}`}>
            {filterBlockedConversation.map((conversation: any) => {
              return (
                <div
                  key={conversation.id}
                  className={`border-b border-gray-200 p-4 flex gap-4 ${conversation.id === activeConversationState?.id ? "bg-gray-100 text" : "bg-white"}`}
                  onClick={() => handleSetActiveConversation(conversation)}
                >
                  <div className="w-[40px] lg:w-1/5">
                    {conversation.participant1Id === session?.user?.id ? (
                      <img
                        src={
                          conversation?.participant2?.profile?.image ||
                          "/images/placeholders/avatar.png"
                        }
                        className="rounded-full border-2 border-gray-200 p-1"
                      />
                    ) : (
                      <img
                        src={
                          conversation?.participant1?.profile?.image ||
                          "/images/placeholders/avatar.png"
                        }
                        className="rounded-full border-2 border-gray-200 p-1"
                      />
                    )}
                  </div>
                  <div>
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
            <Link
              href={`/dashboard/profile/${participant}`}
              className="relative flex items-center space-x-4"
            >
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
            </Link>
            <div className="flex gap-4">
              {status === "none" && activeConversationState?.participant2Id === session.user.id ? (
                <>
                  <button onClick={handleAccept} className="flex gap-1 items-center">
                    <BiCheck /> Accept
                  </button>
                  <button onClick={handleDecline} className="flex gap-1 items-center">
                    <BiCross /> Decline
                  </button>
                </>
              ) : (
                <>
                 
                  {/* 
                <button
                  className="flex gap-1 items-center"
                  onClick={handleFollow}
                >
                  
                  {!isFriend ? (
                    <>
                      <BiUserCheck className="text-xl" /> Add user
                    </>
                  ) : (
                    <>
                      <BiUserMinus className="text-xl" /> Unfollow user
                    </>
                  )}
                </button>
                */}
                </>
              
              )}
              {/* 

              <div
                className="flex gap-1 items-center text-red-500"
                onClick={handleBlocked}
              >
                <BiBlock />
                {isBlocked ? "Unblock" : "Block"}{" "}
              </div>
              
              */}

              
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
            {status === "none" && (
              <div className="justify-center border border-gray-200 p-4 rounded-md mx-auto bg-red-300">
                {activeConversationState?.participant1Id === session?.user?.id
                  ? `Your message is awaiting approval from ${participantUsername}`
                  : `Accept this message request to start chatting with ${participantUsername} `}
              </div>
            )}

            {status === "declined" && (
              <div className="justify-center border border-gray-200 p-4 rounded-md mx-auto bg-red-300">
                {activeConversationState?.participant1Id === session?.user?.id
                  ? `Your message request to ${participantUsername} has been declined`
                  : `You have declined the message request from ${participantUsername} `}
              </div>
            )}

            {messages.map((message, index) => {
              if (message.text == "" && message.image == "") {
                return null;
              }
              return (
                <MessageComponent
                  key={index}
                  message={message}
                  session={session}
                  ref={index === messages.length - 1 ? messagesEndRef : null}
                />
              );
            })}
          </div>
          <div className="border-t-2 mt-auto border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
            <ImageTextArea onSubmit={handleSubmit} disabled={disabled} />
          </div>
        </div>
        </> ) : (
          <div >
              No conversations yet
          </div>
        )}
      </div>
    </Dash>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const user = session?.user;
  const currentUser = await getCurrentUser(session)
  const friends = await getFriendsByUserId(user?.id);
  const safeConversations = await getConversationsByUserId(user?.id);

  for (let conversation of safeConversations) {
    const friendUserId =
      conversation.participant1Id === user?.id
        ? conversation.participant2?.id
        : conversation.participant1?.id;

    conversation.friendStatus = await checkFriendship({
      userId1: session?.user?.id,
      userId2: friendUserId,
    });
    conversation.blockedStatus = await checkBlocked({
      userId1: session?.user?.id,
      userId2: friendUserId,
    });
  }

  return {
    props: {
      safeConversations,
      session,
      friends,
      currentUser
    },
  };
};

export default Conversations;
