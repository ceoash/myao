import axios from "axios";
import { GetServerSideProps } from "next";
import { useState, useEffect } from "react";
import { useRef } from "react";
import { getSession } from "next-auth/react";
import { Dash } from "@/templates/dash";
import { FieldValues, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import getConversationsByUserId from "@/actions/getConversationsByUserId";
import MessageComponent from "@/components/chat/Message";
import ImageTextArea from "@/components/inputs/ImageTextArea";
import getCurrentUser from "@/actions/getCurrentUser";
import useOfferModal from "@/hooks/useOfferModal";
import useRejectConversation from "@/hooks/useRejectConversationModal";
import Sidebar from "@/components/dashboard/conversations/Sidebar";
import Header from "@/components/dashboard/conversations/Header";
import Button from "@/components/dashboard/Button";
import AlertBanner from "@/components/dashboard/AlertBanner";
import { Conversation, IDirectMessage } from "@/interfaces/authenticated";
import { useSocketContext } from "@/context/SocketContext";
import { useUnreadMessages } from "@/context/UnreadMessagesContext";
import { FaCheck, FaTimes } from "react-icons/fa";
import useConfirmationModal from "@/hooks/useConfirmationModal";
import { title } from "process";
import { Meta } from "@/layouts/meta";

const Conversations = ({
  safeConversations,
  session,
  conversationId,
  currentUser,
}: any) => {
  const offerModal = useOfferModal();
  const [skipIndex, setSkipIndex] = useState<number>(5);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationState, setActiveConversationState] =
    useState<Conversation | null>(null);
  const [isBlocked, setIsBlocked] = useState<boolean | null>(false);
  const [status, setStatus] = useState<string | null>("") || null;
  const [disabled, setDisabled] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [toggleDropdown, setToggleDropdown] = useState<boolean>(false);
  const reject = useRejectConversation();
  const messagesStartRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [noMoreMessages, setNoMoreMessages] = useState<boolean>(false);

  const { setUnreadCount, unreadCount } = useUnreadMessages();

  const markAllAsRead = async (conversation: Conversation) => {
    try {
      await axios
        .post(`/api/dashboard/markAllAsRead?conversationId=${conversation.id}`)
        .then((response) => {
          setUnreadCount((prevCount) => {
            const count =
              prevCount -
              (conversation?.unreadCount ? conversation?.unreadCount : 0);
            return count < 0 ? 0 : count;
          });
          setActiveConversationState(() => {
            const obj = { ...conversation, unreadCount: 0 };
            return obj;
          });
          setConversations((prevConversations) =>
            prevConversations.map((prevConversation) => {
              if (prevConversation.id === conversation.id) {
                return {
                  ...prevConversation,
                  unreadCount: 0,
                  directMessages: prevConversation.directMessages.map(
                    (message) => ({
                      ...message,
                      read: true,
                    })
                  ),
                };
              }
              return prevConversation;
            })
          );
        });
    } catch (error) {
      console.log("error:", error);
    }
  };

  // console.log('currentUser', currentUser)
  // console.log('session', session)
  // console.log('safeConversations', safeConversations)

  const socket = useSocketContext();

  const [messages, setMessages] = useState<IDirectMessage[]>([]);
  let participant =
    activeConversationState?.participant1Id === session?.user?.id
      ? activeConversationState?.participant2Id
      : activeConversationState?.participant1Id;
  let me =
    activeConversationState?.participant1Id === session?.user?.id
      ? activeConversationState?.participant1
      : activeConversationState?.participant2;

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

  const confirm = useConfirmationModal();

  useEffect(() => {
    const reverseConversations = [...safeConversations].reverse();
    setConversations(reverseConversations);
    if (conversationId) {
      const activeConversation =
        reverseConversations &&
        reverseConversations.find(
          (conversation) => conversation.id === conversationId
        );
      setActiveConversationState(
        activeConversation
          ? activeConversation
          : reverseConversations[reverseConversations.length - 1]
      );
      if (
        activeConversation?.unreadCount &&
        activeConversation?.unreadCount > 0
      ) {
        markAllAsRead(
          activeConversation
            ? activeConversation
            : reverseConversations[reverseConversations.length - 1]
        );
      }
      setIsBlocked(
        reverseConversations && activeConversation
          ? activeConversation?.friendStatus
          : reverseConversations[reverseConversations.length - 1]?.friendStatus
      );
    } else {
      setActiveConversationState(
        reverseConversations &&
          reverseConversations[reverseConversations.length - 1]
      );
      setIsBlocked(
        reverseConversations &&
          reverseConversations[reverseConversations.length - 1]?.blockedStatus
      );
      if (
        reverseConversations &&
        reverseConversations[reverseConversations.length - 1]?.unreadCount > 0
      ) {
        markAllAsRead(reverseConversations[reverseConversations.length - 1]);
      }
    }
    setStatus(reverseConversations[reverseConversations.length - 1]?.status);
    setUsername(
      reverseConversations[reverseConversations.length - 1]?.participant1Id ===
        session?.user?.id
        ? reverseConversations[reverseConversations.length - 1]?.participant2
            ?.username
        : reverseConversations[reverseConversations.length - 1]?.participant1
            ?.username
    );
  }, [safeConversations]);

  useEffect(() => {
    if (status === "declined") {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [status]);

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
        const reversed = response.messages.reverse();
      setSkipIndex((prevSkipIndex) => prevSkipIndex + 5);
      setMessages((prevMessages) => [...reversed, ...prevMessages]);
      if (response.messages.length < 5) setNoMoreMessages(true);
      messagesStartRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.log(error);
    }
  };

  const conversationAction = (
    participantId: string,
    action: string,
    conversationsArr: Conversation[],
    session: any,
    activeConversationStateProp: any
  ) => {
    console.log("In conversationAction function", {
      participantId,
      action,
      conversationsArr,
      session,
      activeConversationStateProp,
    });

    const conversationAction = conversationsArr.find(
      (conversation) =>
        (conversation.participant1Id === session?.user.id &&
          conversation.participant2Id === participantId) ||
        (conversation.participant2Id === session?.user.id &&
          conversation.participant1Id === participantId)
    );

    console.log("Found conversationAction:", conversationAction);

    if (conversationAction) {
      setConversations((prev) => {
        console.log("In setConversations, prev:", prev);
        return prev.map((conversation) => {
          if (conversation.id === conversationAction.id) {
            return {
              ...conversation,
              friendStatus:
                action === "add"
                  ? true
                  : action === "remove"
                  ? false
                  : conversation.friendStatus,
              blockedStatus:
                action === "block"
                  ? true
                  : action === "unblock"
                  ? false
                  : conversation.blockedStatus,
            };
          } else {
            return conversation;
          }
        });
      });

      if (conversationAction.id === activeConversationStateProp?.id) {
        setActiveConversationState((prev) => {
          console.log("In setActiveConversationState, prev:", prev);
          if (!prev) return null;
          const newActiveConversation = {
            ...prev,
            friendStatus:
              action === "add"
                ? true
                : action === "remove"
                ? false
                : prev.friendStatus,
            blockedStatus:
              action === "block"
                ? true
                : action === "unblock"
                ? false
                : prev.blockedStatus,
          };
          return newActiveConversation;
        });
      }
    }
  };
  const handleFollow = async () => {
    if (activeConversationState?.friendStatus === false) {
      try {
        const response = await axios.post("/api/addFriend", {
          followerId: session?.user?.id,
          followingId: participant,
        });

        console.log("response", response.data.responseFriendship);
        toast.success("Friend request sent to " + participantUsername);
        socket.emit("friend", response.data.responseFriendship, "add");

        const convo = conversations.find(
          (convo) =>
            (convo.participant1Id ===
              response.data.responseFriendship.followingId &&
              convo.participant2Id ===
                response.data.responseFriendship.followerId) ||
            (convo.participant2Id ===
              response.data.responseFriendship.followingId &&
              convo.participant1Id ===
                response.data.responseFriendship.followerId)
        );

        if (convo) {
          setConversations((prev) => {
            return prev.map((conversation) => {
              if (conversation.id === convo.id) {
                return { ...conversation, friendStatus: true };
              } else {
                return conversation;
              }
            });
          });
          if (convo.id === activeConversationState?.id) {
            setActiveConversationState((prev) => {
              if (prev && prev.id) {
                return {
                  ...prev,
                  friendStatus: true,
                };
              } else {
                return null;
              }
            });
          }
        }
      } catch (error) {
        toast.error("failed to follow user");
      }
    } else if (activeConversationState?.friendStatus === true) {
      try {
        const response = await axios.post("/api/deleteFriend", {
          followerId: session?.user?.id,
          followingId: participant,
        });
        toast.success("Unfollowed " + participantUsername);

        if (response.data) {
          socket.emit("friend", response.data, "remove");

          const convo = conversations.find(
            (convo) =>
              (convo.participant1Id === response.data.followingId &&
                convo.participant2Id === response.data.followerId) ||
              (convo.participant2Id === response.data.followingId &&
                convo.participant1Id === response.data.followerId)
          );

          if (convo && convo?.friendStatus === true) {
            setConversations((prev) => {
              return prev.map((conversation) => {
                if (conversation.id === convo.id) {
                  return { ...conversation, friendStatus: false };
                } else {
                  return conversation;
                }
              });
            });
            if (convo.id === activeConversationState?.id) {
              setActiveConversationState((prev) => {
                if (prev && prev.id) {
                  return {
                    ...prev,
                    friendStatus: false,
                  };
                } else {
                  return null;
                }
              });
            }
          }
        }
        return;
      } catch (error) {
        console.log("error", error);
        toast.error("failed to unfollow user");
      }
    }
  };

  const handleStatusUpdate = async (status: string) => {
    try {
      const response = await axios.post("/api/conversations/status", {
        conversationId: activeConversationState?.id,
        status: status,
      });
      if (status === "accepted") {
        toast.success(status);
        console.log("res", response.data);
        socket.emit("accept_conversation", response.data.conversation);
      } else if (status === "declined") {
        socket.emit("decline_conversation", response.data.conversation);
      }
    } catch (error) {
      toast.error("failed to accept conversation");
    }
  };

  const handleBlocked = async () => {
    const participantId =
      activeConversationState?.participant1Id === session?.user?.id
        ? activeConversationState?.participant2Id
        : activeConversationState?.participant1Id;

    if (!activeConversationState?.blockedStatus) {
      try {
        const response = await axios.post("/api/blockFriend", {
          userBlockedId: session?.user?.id,
          friendBlockedId: participantId,
        });
        toast.success(participantUsername + " has been blocked");
        if (participantId)
          conversationAction(
            participantId,
            "block",
            conversations,
            session,
            activeConversationState
          );
      } catch (error) {
        toast.error("failed to block user");
      }
    } else {
      try {
        const response = await axios.post("/api/removeBlocked", {
          userBlockedId: session?.user?.id,
          friendBlockedId: participantId,
        });
        toast.success(participantUsername + " has been unblocked");
        if (participantId)
          conversationAction(
            participantId,
            "unblock",
            conversations,
            session,
            activeConversationState
          );
      } catch (error) {
        toast.error("failed to unblock user");
      }
    }
  };

  const handleSetActiveConversation = async (conversation: Conversation) => {
    if (conversation.unreadCount !== 0) {
      try {
        await axios
          .post(
            `/api/dashboard/markAllAsRead?conversationId=${conversation.id}`
          )
          .then((response) => {
            setUnreadCount((prevCount) => {
              return (
                prevCount -
                (conversation?.unreadCount ? conversation?.unreadCount : 0)
              );
            });
            setActiveConversationState(() => {
              const obj = { ...conversation, unreadCount: 0 };
              return obj;
            });
            setConversations((prevConversations) =>
              prevConversations.map((prevConversation) => {
                if (prevConversation.id === conversation.id) {
                  return {
                    ...prevConversation,
                    unreadCount: 0,
                    directMessages: prevConversation.directMessages.map(
                      (message) => ({
                        ...message,
                        read: true,
                      })
                    ),
                  };
                }
                return prevConversation;
              })
            );
          });
      } catch (error) {
        console.log("error:", error);
      }
    } else {
      setActiveConversationState(() => {
        const obj = { ...conversation };
        return obj;
      });
    }

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

  useEffect(() => {
    socket.emit("join_conversation", activeConversationState?.id);
    return () => {
      socket.emit("leave_conversation", activeConversationState?.id);
    };
  }, [activeConversationState?.id]);

  useEffect(() => {
    if (!socket || !activeConversationState || !session) return;

    if (!activeConversationState?.blockedStatus) {
      socket.on("message_sent", (newMessage: any) => {
        setConversations((prevConversations) => {
          const index = prevConversations.findIndex(
            (conversation) => conversation.id === newMessage.conversationId
          );

          if (index === -1) return prevConversations;

          let updatedConversation = {
            ...prevConversations[index],
            directMessages: [
              newMessage,
              ...prevConversations[index].directMessages,
            ],
          };

          let updatedConversations = [...prevConversations];
          updatedConversations.splice(index, 1);

          updatedConversations.push(updatedConversation);

          return updatedConversations;
        });
        if (activeConversationState?.id === newMessage.conversationId) {
          setUnreadCount((prev: number) => prev - 1);
        }
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
    }

    socket.on("friend", (data) => {
      const { action, friend } = data;
      console.log(action + "friend");
      if (action === "accept") return;
      conversationAction(
        friend.id,
        action,
        conversations,
        session,
        activeConversationState
      );
    });

    socket.on("conversation_accepted", () => {
      setActiveConversationState((prevState) => {
        if (prevState) {
          const updatedConversation: any = {
            ...prevState,
            status: "accepted",
          };
          return updatedConversation;
        }
      });
      setStatus("accepted");
    });

    socket.on("conversation_declined", () => {
      setActiveConversationState((prevState) => {
        if (prevState) {
          const updatedConversation: any = {
            ...prevState,
            status: "declined",
          };
          return updatedConversation;
        }
      });
      setStatus("declined");
      console;
    });

    return () => {
      socket.off("message_sent");
      socket.off("friend");
      socket.off("conversation_accepted");
      socket.off("conversation_declined");
    };
  }, [activeConversationState?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages[messages.length - 1]?.id]);

  const handleSubmit = async (image: string, text: string) => {
    setSubmitting(true);
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
        socket.emit(
          "new_message",
          newMessage,
          conversation.participant1Id,
          conversation.participant2Id
        );
        toast.success("Message sent successfully");
      }
      reset();
      setSubmitting(false);
    } catch (error) {
      console.error("Error sending message:", error);
      setSubmitting(false);
    }
  };

  return (
    <Dash
      noBreadcrumbs
      full={true}
      meta={<Meta title="Messages" description="View messages" />}
    >
      <div className="flex border border-gray-200 relative flex- -mt-1 flex-grow h-full overscroll-none">
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
                className={`lg:hidden border bg-gray-50  border-gray-200 shadow w-auto relative ${
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
            <div className="flex-grow flex flex-col h-full">
              <Header
                participant={participant}
                username={username}
                activeConversationState={activeConversationState}
                handleAccept={() => handleStatusUpdate("accepted")}
                session={session}
                reject={reject}
                toggleDropdown={toggleDropdown}
                offerModal={offerModal}
                setToggleDropdown={() => setToggleDropdown}
                handleFollow={handleFollow}
                isFriend={activeConversationState?.friendStatus}
                handleBlocked={handleBlocked}
                isBlocked={isBlocked || false}
                setActiveConversationState={setActiveConversationState}
              />

              <div
                key={activeConversationState?.id}
                id="messages"
                className="flex flex-col flex-grow space-y-4 p-3 overflow-none scrollbar-thumb-orange scrollbar-thumb-rounded scrollbar-track-orange-lighter scrollbar-w-2 scrolling-touch bg-white relative"
                style={{ height: "calc(100vh - 34rem)" }}
              >
                <div className="p-4 bg-gradient-to-b from-white to-transparent  top-0 left-0 w-full absolute">
                  {activeConversationState?.status === "none" &&
                    !activeConversationState?.blockedStatus && (
                      <div className=" ">
                        <AlertBanner
                          key={activeConversationState?.id}
                          secondary
                        >
                          <div className="flex justify-between items-center w-full">
                            <div>
                              {activeConversationState?.participant1Id ===
                              session?.user?.id
                                ? `Your message is awaiting approval from ${participantUsername}`
                                : `Accept this message request to start chatting with ${participantUsername} `}
                            </div>
                            {activeConversationState?.participant2Id ===
                              session?.user?.id && (
                              <div className="flex gap-1 ml-auto">
                                <button
                                  className="flex ml-auto items-center gap-1 border border-gray-200  bg-white rounded-lg text-xs p-1 px-2 hover:bg-gray-50"
                                  onClick={() => handleStatusUpdate("accepted")}
                                >
                                  <FaCheck className="" /> Accept
                                </button>
                                {activeConversationState && (
                                  <button
                                    className="flex ml-auto items-center gap-1 border border-gray-200  bg-white rounded-lg text-xs p-1 px-2 hover:bg-gray-50"
                                    onClick={() =>
                                      confirm.onOpen(
                                        "Are you sure you want to decline this message request?",
                                        async () => {
                                          await handleStatusUpdate("declined");
                                          confirm.onClose();
                                        }
                                      )
                                    }
                                  >
                                    <FaTimes className="" /> Decline
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </AlertBanner>
                      </div>
                    )}
                  {activeConversationState?.status === "accepted" && (
                    <div className="col-span-12 -mx-2">
                      <div className="flex justify-between items-center pt-1 bg-white">
                      <div className="border-t border-gray-200 h-1 w-full hidden md:block bg-white"></div>
                      <div className="md:w-auto md:whitespace-nowrap text-center mx-4 text-sm text-gray-500 bg-whire p-1 px-3">
                        We are here to protect you from fraud please do not
                        share your personal information
                      </div>
                      <div className="border-t border-gray-200 w-full hidden md:block bg-white"></div>

                      </div>
                      <div className="h-6 bg-gradient-to-b from-white to-transparent"></div>
                    </div>
                  )}

                  {activeConversationState?.blockedStatus && (
                    <div className="max-w-xl mx-auto">
                      <AlertBanner
                        key={activeConversationState?.id}
                        danger
                        onClick={handleBlocked}
                      >
                        You blocked this user
                      </AlertBanner>
                    </div>
                  )}
                  {status === "declined" && (
                    <div className="max-w-xl mx-auto">
                      <AlertBanner key={activeConversationState?.id} danger>
                        {activeConversationState?.participant1Id ===
                        session?.user?.id
                          ? `Your message request to ${participantUsername} has been declined`
                          : `You have declined the message request from ${participantUsername} `}
                      </AlertBanner>
                    </div>
                  )}
                </div>
                
                <div className=" flex flex-col gap-4 overflow-y-auto pt-10">
                {!noMoreMessages &&
                  status === "accepted" &&
                  messages.length > 3 && (
                    <div ref={messagesStartRef} className="flex justify-center bg-transparent">
                      <Button
                        onClick={onLoadMore}
                        options={{ size: "sx", mute: true }}
                      >
                        Load More
                      </Button>
                    </div>
                  )}
                  {messages.map((message, index) => {
                    if (message.text == "" && message.image == "") return null;
                    return (
                      <MessageComponent
                        key={message?.id}
                        message={message}
                        session={session}
                        ref={null}
                      />
                    );
                  })}
                  <div ref={messagesEndRef}></div>
                </div>
              </div>
              <div className="border-t-2 mt-auto bg-gray-50 border-gray-200 px-4 mb-2 sm:mb-0">
                <ImageTextArea
                  onSubmit={handleSubmit}
                  key={activeConversationState?.id}
                  disabled={
                    (activeConversationState?.status !== "accepted" &&
                      activeConversationState?.participant2Id ===
                        session?.user.id) ||
                    activeConversationState?.status === "declined" ||
                    activeConversationState?.blockedStatus
                  }
                  isLoading={submitting}
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

  const conversationId = context.query?.conversationId ?? null;

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
  const safeConversations = await getConversationsByUserId(
    user?.id,
    currentUser
  );
  // const safeConversations = await getConversationsByUserId(user?.id, currentUser?.blockedFriends, currentUser?.followers, currentUser?.followings);

  return {
    props: {
      safeConversations,
      session,
      currentUser,
      conversationId,
    },
  };
};

export default Conversations;
