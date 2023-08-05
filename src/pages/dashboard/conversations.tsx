import axios from "axios";
import { DirectMessage } from "@prisma/client";
import { GetServerSideProps } from "next";
import { useState, useEffect, use } from "react";
import { useRef } from "react";
import io, { Socket } from "socket.io-client";
import { getSession } from "next-auth/react";
import { Dash } from "@/templates/dash";
import { FieldValues, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { config } from "@/config";
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
import { set } from "date-fns";

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
  blockedStatus?: boolean;
  status?: string;
  currentUser?: any
}

const Conversations = ({ safeConversations, session, conversationId, currentUser }: any) => {

  const offerModal = useOfferModal();
  const [skipIndex, setSkipIndex] = useState<number>(5);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationState, setActiveConversationState] = useState<Conversation | null>(null);
  const [isFriend, setIsFriend] = useState<boolean | null>(false);
  const [isBlocked, setIsBlocked] = useState<boolean | null>(false);
  const [status, setStatus] = useState<string | null>("") || null
  const [disabled, setDisabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [toggleDropdown, setToggleDropdown] = useState<boolean>(false);
  const [friends, setFriends] = useState<IUser[]>([]);
  const reject = useRejectConversation();
  const messagesStartRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [noMoreMessages, setNoMoreMessages] = useState<boolean>(false);

  // console.log('currentUser', currentUser)
  // console.log('session', session)
  // console.log('safeConversations', safeConversations)
   console.log('conversations', conversations)

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

  useEffect(() => {
    const reverseConversations = [ ...safeConversations] .reverse();
    const participant = activeConversationState?.participant1Id === session.user?.id
    setConversations(reverseConversations);
    if(conversationId) {
      const activeConversation = reverseConversations.find(conversation => conversation.id === conversationId);
      setActiveConversationState( activeConversation ? activeConversation : reverseConversations[0] );
      setIsFriend( activeConversation ? activeConversation?.friendStatus : reverseConversations[0]?.friendStatus )
      setIsBlocked( activeConversation ? activeConversation?.friendStatus : reverseConversations[0]?.friendStatus )
    } else {
      setActiveConversationState( reverseConversations[0] );
      setIsFriend( reverseConversations[0]?.friendStatus )
      setIsBlocked( reverseConversations[0]?.blockedStatus )
    }
   
    setStatus(reverseConversations[0]?.status);
    setUsername(reverseConversations[0]?.participant1Id === session?.user?.id ? reverseConversations[0]?.participant2?.username : reverseConversations[0]?.participant1?.username);
   },[safeConversations]);

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
      setSkipIndex((prevSkipIndex) => prevSkipIndex + 5);
      const reversed = response.messages.reverse();
      setMessages((prevMessages) => [...reversed, ...prevMessages]);
    } catch (error) {
      console.log(error);
    }
  };

  const conversationAction = (participantId: string, action: string, conversationsArr: Conversation[], session: any, activeConversationStateProp:any) => {
    console.log("In conversationAction function", {participantId, action, conversationsArr, session, activeConversationStateProp});
  
    const conversationAction = conversationsArr.find((conversation) => 
      (conversation.participant1Id === session?.user.id && conversation.participant2Id === participantId || 
      conversation.participant2Id === session?.user.id && conversation.participant1Id === participantId)); 
  
    console.log("Found conversationAction:", conversationAction);
  
    if(conversationAction){
      setConversations(prev => {
        console.log("In setConversations, prev:", prev);
        return prev.map(conversation => {
          if (conversation.id === conversationAction.id) {
            return {...conversation, friendStatus: action === "add" ? true : action === "remove" ? false : conversation.friendStatus, blockedStatus: action === "block" ? true : action === "unblock" ? false : conversation.blockedStatus};
          } else {
            return conversation;
          }
        });
      });
  
      if(conversationAction.id === activeConversationStateProp?.id){
        setActiveConversationState((prev) => { 
          console.log("In setActiveConversationState, prev:", prev);
          if(!prev) return null
          const newActiveConversation = {...prev, friendStatus: action === "add" ? true : action === "remove" ? false : prev.friendStatus, blockedStatus: action === "block" ? true : action === "unblock" ? false : prev.blockedStatus};
          return newActiveConversation
        }) 
      }   
    }
  }
  const handleFollow = async () => {
    if (activeConversationState?.friendStatus === false) {
      try {
        const response = await axios.post("/api/addFriend", {
          followerId: session?.user?.id,
          followingId: participant,
        });

        console.log("response", response.data.responseFriendship);
        toast.success("Friend request sent to " + participantUsername);
        socketRef.current?.emit("friend", response.data.responseFriendship, 'add');

          if(response.data.responseFriendship.participant1Id === session?.user?.id){
            setFriends((prevFriends) => [...prevFriends, response.data.responseFriendship.participant2]);
          } else if (response.data.responseFriendship.participant2Id === session?.user?.id){
            setFriends((prevFriends) => [...prevFriends, response.data.responseFriendship.participant1]);
          }
          const convo = conversations.find((convo) => 
            (convo.participant1Id === response.data.responseFriendship.followingId && convo.participant2Id === response.data.responseFriendship.followerId) 
            || 
            (convo.participant2Id === response.data.responseFriendship.followingId && convo.participant1Id === response.data.responseFriendship.followerId)
          );          

          if(convo){
            setConversations(prev => {
              return prev.map(conversation => {
                if (conversation.id === convo.id) {
                  return {...conversation, friendStatus: true};
                } else {
                  return conversation;
                }
              });
            });
            if(convo.id === activeConversationState?.id){
              setActiveConversationState((prev) => {
                if (prev && prev.id) {
                  return {
                    ...prev,
                    friendStatus: true
                  }
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
        console.log('post request successful');
        toast.success("Unfollowed " + participantUsername);
        console.log('response', response.data);

        if(response.data){
        socketRef.current?.emit("friend", response.data, 'remove');
    
        const convo = conversations.find((convo) => 
          convo.participant1Id === response.data.followingId && convo.participant2Id === response.data.followerId
          || 
          convo.participant2Id === response.data.followingId && convo.participant1Id === response.data.followerId
        );          
        console.log('conversation found', convo);
        
        if(convo && convo?.friendStatus === true){
          console.log('before state updates');
          setConversations(prev => {
            return prev.map(conversation => {
              if (conversation.id === convo.id) {
                return {...conversation, friendStatus: false};
              } else {
                return conversation;
              }
            });
          });
          if(convo.id === activeConversationState?.id){
            setActiveConversationState((prev) => {
              if (prev && prev.id) {
                return {
                  ...prev,
                  friendStatus: false
                }
              } else {
                return null;
              }
            });
          }
          console.log('after state updates');
        }
      }
        return
      } catch (error) {
        console.log('error', error);
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
    const participantId = 
      activeConversationState?.participant1Id === 
      session?.user?.id ? activeConversationState?.participant2Id : 
      activeConversationState?.participant1Id;

    if (!activeConversationState?.blockedStatus) {
      try {
        const response = await axios.post("/api/blockFriend", {
          userBlockedId: session?.user?.id,
          friendBlockedId: participantId,
        });
        toast.success(participantUsername + " has been blocked");
        if(participantId) conversationAction(participantId, "block", conversations, session, activeConversationState)
    
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
        if(participantId) conversationAction(participantId, "unblock", conversations, session, activeConversationState)
      
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
    if(!activeConversationState || !session) {
      return; 
    }
    socketRef.current = io(config.PORT);
    socketRef.current.emit("join_conversation", activeConversationState?.id);
    socketRef.current.emit("register", session?.user?.id);
    
  }, [activeConversationState, session]);

  useEffect(() => {
    if (!socketRef.current || !activeConversationState || !session) return;
    if(!activeConversationState?.blockedStatus){
      socketRef.current.on("message_sent", (newMessage: any) => {
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

    socketRef.current.on("friend", (friend, action) => { 
    console.log(action + "friend") 
    if(action === 'accept') return
     conversationAction(friend.id, action, conversations, session, activeConversationState)
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
      socketRef.current?.off("friend");
      socketRef.current?.off("message_sent");
      socketRef.current?.off("conversation_declined");
      socketRef.current?.off("conversation_accepted");
      socketRef.current?.disconnect();
    };
  }, [activeConversationState, session?.user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
        socketRef.current?.emit("new_message", newMessage);
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
    <Dash full={true} meta={<title>Conversation</title>}>
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
                isFriend={activeConversationState?.friendStatus}
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
                  <div className="lg:w-auto lg:whitespace-nowrap text-center mx-4 text-sm text-gray-500">
                    We are here to protect you from fraud please do not share
                    your personal information
                  </div>
                  <div className="border-t border-gray-200 w-full hidden lg:block"></div>
                </div>

                {status === "none" && !activeConversationState?.blockedStatus && (
                  <div className="mx-auto max-w-xl">
                      <AlertBanner secondary>
                        {activeConversationState?.participant1Id ===
                        session?.user?.id
                          ? `Your message is awaiting approval from ${participantUsername}`
                          : `Accept this message request to start chatting with ${participantUsername} `}
                      </AlertBanner>
                  </div>
                )}

                {activeConversationState?.blockedStatus && (
                  <div className="max-w-xl mx-auto">
                      <AlertBanner danger  onClick={handleBlocked}>
                        You blocked this user
                      </AlertBanner>
                  </div>
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
                  if (message.text == "" && message.image == "") return null;
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
                  key={activeConversationState?.id}
                  disabled={status !== "accepted" && activeConversationState?.participant2Id === session?.user.id || activeConversationState?.status === "declined" || activeConversationState?.blockedStatus}
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
  const safeConversations = await getConversationsByUserId(user?.id, currentUser );
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
