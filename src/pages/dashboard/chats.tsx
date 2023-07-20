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
import { formatDistanceToNow, set } from "date-fns";
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

const Chats = ({ safeConversations, session }: any) => {

  console.log("safeConversations", safeConversations);
  const offerModal = useOfferModal();

  const [skipIndex, setSkipIndex] = useState<number>(5);

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


  const [isOpen, setIsOpen] = useState(
    typeof window !== "undefined" && window.innerWidth > 768
  );

  const handleSidebarToggle = () => {
    setIsOpen(!isOpen);
  };
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [noMoreMessages, setNoMoreMessages] = useState<boolean>(false);

  const [messages, setMessages] = useState<IDirectMessage[]>([]);
  const { reset } = useForm<FieldValues>({
    defaultValues: {
      message: "",
      id: "",
      userId: "",
      image: "",
    },
  });

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

  

  

  

  useEffect(() => {
    setMessages([]);
    if (!activeConversationState) return;
    setMessages([...activeConversationState.directMessages].reverse() || []);
  }, [activeConversationState?.id]);

  

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
       
      }
      reset();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <Dash full={true} meta={<title>Conversations</title>}>
      <div className="flex border border-gray-200 relative flex-1 flex-grow h-full overscroll-none mt-32">
        <div>
          {
            safeConversations.map((conversation: any) => (
              <div key={conversation.id}>
                <div className="flex items-center justify-between px-4 py-2">
                  <div className="flex items-center">
                    <div className="text-5xl">
                      yessss
                    </div>
                    <div className="relative">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={conversation?.participant1?.profile?.image}
                        alt=""
                      />
                      <span
                        className={`absolute bottom-0 right-0 inline-block h-3 w-3 rounded-full ${
                          conversation?.participant1?.status === "online"
                            ? "bg-green-500"
                            : "bg-gray-500"
                        }`}
                      ></span>
                    </div>
                    <div className="ml-2">
                      <p className="text-sm font-medium text-gray-900">
                        {conversation?.participant1?.username} name
                      </p>
                      <p className="text-sm text-gray-500">
                        {conversation?.participant1?.profile?.bio}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(conversation?.createdAt), {
                        locale: sk,
                      })}
                    </p>
                  </div>
                </div>
                <div className="border-t border-gray-200"></div>  
              </div>
            ))
          }
        </div>
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
  const friends = await getFriendsByUserId(user?.id);
  const safeConversations = await getConversationsByUserId(user?.id);

  return {
    props: {
      safeConversations,
      session,
      friends,
      currentUser,
    },
  };
};

export default Chats;
