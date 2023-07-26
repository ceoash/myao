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
import { timeSince } from "@/utils/formatTime";
import {
  BiBlock,
  BiCheck,
  BiCheckCircle,
  BiChevronLeft,
  BiChevronRight,
  BiCross,
  BiDotsVerticalRounded,
  BiPlus,
  BiUserCheck,
  BiUserMinus,
} from "react-icons/bi";
import { MdOutlineDoNotDisturb } from "react-icons/md";
import checkFriendship from "@/actions/checkFriendship";
import Link from "next/link";
import checkBlocked from "@/actions/checkBlocked";
import getCurrentUser from "@/actions/getCurrentUser";
import useOfferModal from "@/hooks/useOfferModal";
import { stat } from "fs";
import useRejectConversation from "@/hooks/useRejectConversationModal";
import { fr, sk } from "date-fns/locale";
import { set } from "date-fns";
import Sidebar from "@/components/dashboard/conversations/Sidebar";
import Header from "@/components/dashboard/conversations/Header";
import Button from "@/components/dashboard/Button";
import AlertBanner from "@/components/dashboard/AlertBanner";

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
  buyer: any[];
  seller: any[];
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

const Conversations = ({ safeConversations, session }: any) => {

  const offerModal = useOfferModal();

  const [skipIndex, setSkipIndex] = useState<number>(5);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationState, setActiveConversationState] = useState<Conversation | null>(null);
 

  const [isFriend, setIsFriend] = useState<boolean | null>(false);
  const [isBlocked, setIsBlocked] = useState<boolean | null>(false);
  const [status, setStatus] = useState<string | null>("") || null

  const [disabled, setDisabled] = useState<boolean>(false);
  const [toggleDropdown, setToggleDropdown] = useState<boolean>(false);
  const [friends, setFriends] = useState<IUser[]>([]);
  const reject = useRejectConversation();
  const messagesStartRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [noMoreMessages, setNoMoreMessages] = useState<boolean>(false);

  const [messages, setMessages] = useState<IDirectMessage[]>([]);

  let participant =
    activeConversationState?.participant1Id === session?.user?.id
      ? activeConversationState?.participant2Id
      : activeConversationState?.participant1Id;
  let me =
    activeConversationState?.participant1Id === session?.user?.id
      ? activeConversationState?.participant1
      : activeConversationState?.participant2;
  const blockedChat = me?.blockedFriends?.some(
    (blockedFriend: any) => blockedFriend.friendBlockedId === participant
  );

  let participantUsername =
  activeConversationState?.participant1Id === session?.user?.id
    ? activeConversationState?.participant2?.username
    : activeConversationState?.participant1?.username;



  const [username, setUsername] = useState<string>("");
  const { reset } = useForm<FieldValues>({
    defaultValues: {
      message: "",
      id: "",
      userId: "",
      image: "",
    },
  });

  const some = activeConversationState?.participant1.blockedFriends?.some(
    (blockedFriend: any) => blockedFriend.friendBlockedId === participant
  );

  console.log("some", some);


  useEffect(() => {
    const reverseConversations = [ ...safeConversations] .reverse();
    setConversations(reverseConversations);
    setActiveConversationState(reverseConversations[0]);
    setStatus(reverseConversations[0]?.status);
    setUsername(reverseConversations[0]?.participant1Id === session?.user?.id ? reverseConversations[0]?.participant2?.username : reverseConversations[0]?.participant1?.username);
   },[safeConversations, session?.user?.id]);

  useEffect(() => {
    if (status === "declined") {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [status]);

  // console.log("blocked by", activeConversationState?.participant1.blockedBy);
  // console.log("blocked by", activeConversationState?.participant2.blockedBy);
  // console.log("blocked friends", activeConversationState?.participant1.blockedFriends);
  // console.log("blocked friends", activeConversationState?.participant2.blockedFriends);


  console.log("isBlocked", activeConversationState);
 
  const [isOpen, setIsOpen] = useState(
    typeof window !== "undefined" && window.innerWidth > 768
  );

  const handleSidebarToggle = () => {
    setIsOpen(!isOpen);
  };
 
  const onLoadMore = async () => {
    if (messages.length < skipIndex) {
      setNoMoreMessages(true);
      return;
    }
    try {
      const response = await axios
        .post(`/api/conversations/loadMoreConversationMessages`, {
          skipIndex: skipIndex,
          conversationId: activeConversationState?.id,
        })
        .then((res) => res.data);
      setSkipIndex((prevSkipIndex) => prevSkipIndex + 5);
      const reversed = response.messages.reverse();
      setMessages((prevMessages) => [...reversed, ...prevMessages]);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFollow = async () => {
    if (!isFriend) {
      try {
        const response = await axios.post("/api/addFriend", {
          followerId: session?.user?.id,
          followingId: participant,
        });
        toast.success("Friend request sent to " + participantUsername);
        socketRef.current?.emit("add_friend", response.data);
        setIsFriend(true);
        setFriends((prevFriends) => [...prevFriends, response.data.following]);
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
        socketRef.current?.emit("remove_friend", response.data);
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
      socketRef.current?.emit("accept_conversation", response.data);
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
      toast.error("declined");
      setStatus("declined");

      socketRef.current?.emit("decline_conversation", response.data);
    } catch (error) {
      toast.error("failed to decline conversation");
    }
  };

  const handleBlocked = async () => {
    if (isBlocked === false) {
      try {
        const response = await axios.post("/api/blockFriend", {
          userBlockedId: session?.user?.id,
          friendBlockedId:
            activeConversationState?.participant1Id === session?.user?.id
              ? activeConversationState?.participant2Id
              : activeConversationState?.participant1Id,
        });
        toast.success(participantUsername + " has been blocked");
        socketRef.current?.emit("block_friend", response.data);
        setIsBlocked(!isBlocked);
      } catch (error) {
        toast.error("failed to block user");
      }
    } else {
      try {
        const response = await axios.post("/api/removeBlocked", {
          userBlockedId: session?.user?.id,
          friendBlockedId:
            activeConversationState?.participant1Id === session?.user?.id
              ? activeConversationState?.participant2Id
              : activeConversationState?.participant1Id,
        });
        toast.success(participantUsername + " has been unblocked");
        socketRef.current?.emit("unblock_friend", response.data);
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
    setSkipIndex(5);
  };

  useEffect(() => {
    setMessages([]);
    if (!activeConversationState) return;
    setMessages([...activeConversationState.directMessages].reverse() || []);
  }, [activeConversationState?.id]);

  const socketRef = useRef<Socket>();

  useEffect(() => {
    socketRef.current = io(config.PORT);
    socketRef.current.emit("join_conversation", activeConversationState?.id);
    socketRef.current.emit("register", session?.user?.id);
  }, []);

  useEffect(() => {
    if (!socketRef.current) return;
    socketRef.current.on("message_sent", (newMessage: any) => {
      console.log("new message", newMessage);
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

    socketRef.current.on("friend_blocked", () => {
      setIsBlocked(true);
    });

    socketRef.current.on("friend_unblocked", () => {
      setIsBlocked(false);
    });

    socketRef.current.on("friend_added", (friend) => {
      setFriends((prevFriends) => [...prevFriends, friend]);
    });

    socketRef.current.on("friend_removed", (friend) => {
      setIsFriend(false);
      setFriends((prevFriends) =>
        prevFriends.filter((f) => f.id !== friend.id)
      );
      console.log("friend removed", friend);
    });

    socketRef.current.on("conversation_accepted", () => {
      setActiveConversationState((prevState) => {
        if (prevState) {
          const updatedConversation: any = {
            ...prevState,
            status: "accepted",
          };
          return updatedConversation;
        }
      });
      setStatus(() => {
        return "accepted";
      });
    });

    socketRef.current.on("conversation_declined", () => {
      setActiveConversationState((prevState) => {
        if (prevState) {
          const updatedConversation: any = {
            ...prevState,
            status: "declined",
          };
          return updatedConversation;
        }
      });
      setStatus(() => {
        return "declined";
      });
    });

    return () => {
      socketRef.current?.emit(
        "leave_conversation",
        activeConversationState?.id
      );
      socketRef.current?.off("friend_unblocked");
      socketRef.current?.off("friend_added");
      socketRef.current?.off("friend_removed");
      socketRef.current?.off("friend_blocked");
      socketRef.current?.off("message_sent");
      socketRef.current?.off("conversation_declined");
      socketRef.current?.off("conversation_accepted");
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
        type: image ? "image" : "text",
      });

      if (response.status === 200) {
        const conversation = response.data;
        const newMessage =
          conversation.directMessages.reverse()[
            conversation.directMessages.reverse().length - 1
          ];
        socketRef.current?.emit("new_message", newMessage);
        toast.success("Message sent successfully");
      }
      reset();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <Dash full={true} meta={<title>Conversations</title>}>
      <div className="flex border border-gray-200 relative flex-1 flex-grow h-screen overscroll-none">
        {conversations.length > 0 ? (
          <>
            <div
              className={` hidden lg:block border bg-gray-50  border-gray-200 relative ${
                isOpen
                  ? "md:w-[200px] lg:w-[260px] xl:w-[380px] xl:min-w-[380px] block"
                  : "lg:w-[0]"
              } border  border-gray-200 `}
            >
              <Sidebar
                session={session}
                isOpen={isOpen}
                filterBlockedConversation={conversations}
                activeConversationState={activeConversationState}
                handleSidebarToggle={handleSidebarToggle}
                handleSetActiveConversation={handleSetActiveConversation}
              />
            </div>
            <div
              className={`absolute z-10 lg:hidden   ${
                isOpen
                  ? "w-full h-full bg-neutral-800/70"
                  : "w-0 h-0 bg-transparent"
              }`}
            >
              <div
                className={`lg:hidden border bg-gray-50  border-gray-200 w-auto relative ${
                  isOpen ? "w-full min-w-max" : "w-[0]"
                } border  border-gray-200 `}
              >
                <Sidebar
                  session={session}
                  isOpen={isOpen}
                  filterBlockedConversation={conversations}
                  activeConversationState={activeConversationState}
                  handleSidebarToggle={handleSidebarToggle}
                  handleSetActiveConversation={handleSetActiveConversation}
                />
              </div>
            </div>
            <div className="flex-grow flex flex-col">
              <Header
                participant={participant}
                username={username}
                activeConversationState={activeConversationState}
                handleAccept={handleAccept}
                session={session}
                reject={reject}
                setStatus={() => setStatus}
                status={status || "pending"}
                toggleDropdown={toggleDropdown}
                offerModal={offerModal}
                setToggleDropdown={() => setToggleDropdown}
                handleFollow={handleFollow}
                isFriend={isFriend}
                handleBlocked={handleBlocked}
                isBlocked={isBlocked || false}
              />

              <div
                key={activeConversationState?.id}
                id="messages"
                className="flex flex-col space-y-4 p-3 overflow-y-auto scrollbar-thumb-orange scrollbar-thumb-rounded scrollbar-track-orange-lighter scrollbar-w-2 scrolling-touch bg-white"
                style={{ height: "calc(100vh - 28rem)" }}
              >
                <div className="col-span-12 flex justify-between items-center">
                  <div className="border-t border-gray-200 h-1 w-full hidden lg:block"></div>
                  <div className="lg:w-auto lg:whitespace-nowrap  text-center mx-4 text-sm text-gray-500">
                    We are here to protect you from fraud please do not share
                    your personal information
                  </div>
                  <div className="border-t border-gray-200 w-full  hidden lg:block"></div>
                </div>
                {status === "none" && (
                  <div className="mx-auto max-w-xl">
                  <AlertBanner secondary>
                    {activeConversationState?.participant1Id ===
                    session?.user?.id
                      ? `Your message is awaiting approval from ${participantUsername}`
                      : `Accept this message request to start chatting with ${participantUsername} `}
                  </AlertBanner></div>
                )}

                {status === "declined" && (
                  <div className="max-w-xl mx-auto">
                    <AlertBanner danger>
                      {activeConversationState?.participant1Id ===
                      session?.user?.id
                        ? `Your message request to ${participantUsername} has been declined`
                        : `You have declined the message request from ${participantUsername} `}
                    </AlertBanner>
                  </div>
                )}

                {!noMoreMessages && messages.length > 3 && (
                  <div ref={messagesStartRef} className="flex justify-center">
                    <Button
                      onClick={onLoadMore}
                      options={{ size: "sx", mute: true }}
                    >
                      Load More
                    </Button>
                  </div>
                )}

                {messages.map((message, index) => {
                  if (message.text == "" && message.image == "") {
                    return null;
                  }
                  return (
                    <MessageComponent
                      key={message?.id}
                      message={message}
                      session={session}
                      ref={
                        index === messages.length - 1 ? messagesEndRef : null
                      }
                    />
                  );
                })}
              </div>
              <div className="border-t-2 mt-auto bg-gray-50 border-gray-200 px-4 mb-2 sm:mb-0">
                <ImageTextArea
                  onSubmit={handleSubmit}
                  disabled={activeConversationState?.status === "declined"}
                  key={activeConversationState?.id}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="w-full text-center pt-20">No conversations yet</div>
        )}
      </div>
    </Dash>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const user = session?.user;
  const currentUser = await getCurrentUser(session);
  const safeConversations = await getConversationsByUserId(user?.id);

  return {
    props: {
      safeConversations,
      session,
      currentUser,
    },
  };
};

export default Conversations;
