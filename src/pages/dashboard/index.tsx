import React, { use, useEffect, useRef, useState } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import getCurrentUser from "@/actions/getCurrentUser";
import { User } from "@/types";
import { Meta } from "@/layouts/meta";
import { Dash } from "@/templates/dash";
import useOfferModal from "@/hooks/useOfferModal";
import usePendingConversationModal from "@/hooks/usePendingConversationModal";
import getFriendsByUserId from "@/actions/getFriendsByUserId";
import QuickConnect from "@/components/widgets/QuickConnect";
import { Socket, io } from "socket.io-client";
import { config } from "@/config";
import { useRouter } from "next/router";
import Stats from "@/components/dashboard/Stats";
import ActivityWidget from "@/components/dashboard/widgets/ActivityWidget";
import InviteFriend from "@/components/dashboard/widgets/InviteFriend";
import Button from "@/components/dashboard/Button";
import Skeleton from "react-loading-skeleton";
import { dashboardProps } from "@/interfaces/authenticated";
import FriendsWidget from "@/components/widgets/FriendsWidget";
import useQuickConnect from "@/hooks/useQuickConnect";
import getOffersByUserId from "@/actions/dashboard/getOffersByUserId";
import Offers from "@/components/offers/Offers";

const Index = ({
  sent,
  received,
  user,
  friends,
  session,
  activities,
  countSent,
  countReceived,
  countPendingSent,
  countPendingReceived,
  username,
  
}: dashboardProps) => {
  const offerModal = useOfferModal();
  const pendingConversation = usePendingConversationModal();

  console.log("user", user)

  console.log("friends", friends)

  const router = useRouter();

  const [friendsList, setFriendsList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userActivities, setUserActivities] = useState<any>([]);

  const [sentCount, setSentCount] = useState<any>(0);
  const [receivedCount, setReceivedCount] = useState<any>(0);
  const [sentPendingCount, setSentPendingCount] = useState<any>(0);
  const [receivedPendingCount, setReceivedPendingCount] = useState<any>(0);
  const [sentOffers, setSentOffers] = useState<any>([]);
  const [receivedOffers, setReceivedOffers] = useState<any>([]);

  const connect = useQuickConnect();

  useEffect(() => {
    if (!user.activated) {
      setIsLoading(true);
      setTimeout(() => {
        router.push("/dashboard/wizard");
      }, 0);
    } else {
      setFriendsList(friends);
      setUserActivities(activities);

      setSentCount(countSent);
      setReceivedCount(countReceived);
      setSentPendingCount(countPendingSent);
      setReceivedPendingCount(countPendingReceived);
      setSentOffers(sent);
      setReceivedOffers(received);
      setIsLoading(false);
    }
  }, [session.user.id, countSent, countReceived, countPendingSent, countPendingReceived, friends, activities, sent, received]);

  const socketRef = useRef<Socket>();

  useEffect(() => {
    socketRef.current = io(config.PORT);
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  console.log(socketRef)

  useEffect(() => {
    if (!session.user.id) return;
    if (!socketRef) return;

    socketRef.current && socketRef?.current.emit("register", session.user.id);

    socketRef.current &&
      socketRef.current.on("updated_activities", (activities: any) => {
        console.log("updated activities", activities);
        const copiedActivities = [...(activities.activities as any[])];
        const reversedActivities = copiedActivities.reverse();
        const topActivities = reversedActivities.slice(0, 3);
        setUserActivities(topActivities);
      });

    socketRef.current &&
      socketRef.current.on("friend_added", (data) => {
        console.log("added", data);
        setFriendsList((prevFriendsList) => [
          ...prevFriendsList,
          data,
        ]);
      });

    socketRef.current &&
      socketRef.current.on("friend_accepted", (data) => {
        console.log("accepted", data);
        setFriendsList((prevFriendsList) => {
          return prevFriendsList.map((friend) =>
            friend.id === data.id ? { ...friend, accepted: true } : friend
          );
        });
      });

    socketRef.current &&
      socketRef.current.on("friend_removed", (data) => {
        console.log("removed", data);
        setFriendsList((prevFriendsList) =>
          prevFriendsList.filter((friend) => friend.id !== data.id)
        );
      });

    return () => {
      socketRef.current && socketRef.current.disconnect();
    };
  }, [session.id]);

  return (
    <Dash
      meta={
        <Meta
          title="Make You An Offer You Can't Refuse"
          description="This is the Make You An Offer Web App"
        />
      }
    >
      <div className=" p-8 ">
        <div className="flex items-center justify-between">
          <div>
            <h2>Dashboard</h2>
          </div>
          <div className="flex items-center gap-x-2">
            {/* <button
                  onClick={() => connect.onOpen(searchUser, session.user.id, isLoading)}
                  type="button"
                  className="inline-flex items-center justify-center h-9 px-3 rounded-xl border hover:border-gray-400 text-gray-800 hover:text-gray-900 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    fill="currentColor"
                    className="bi bi-chat-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6-.097 1.016-.417 2.13-.771 2.966-.079.186.074.394.273.362 2.256-.37 3.597-.938 4.18-1.234A9.06 9.06 0 0 0 8 15z" />
                  </svg>
                </button> */}
            <Button
              label="Connect and Create"
              onClick={offerModal.onOpen}
              icon="/icons/thumbs-up.png"
            />
          </div>
        </div>

        <hr className="my-0 mb-6 mt-4" />
        {/*`Activities ${userActivities ? userActivities.length : 0}` */}
        <div className="lg:grid grid-cols-12 gap-x-6 mb-6">
          {isLoading ? (
            <>
              <div className="col-span-6">
                <Skeleton height={200} />
              </div>
              <div className="col-span-6">
                <Skeleton height={200} />
              </div>
            </>
          ) : (
            <>
              <Stats
                title="Overview"
                totalStats={10}
                startOffer={offerModal.onOpen}
                sentOffers={sentCount}
                receivedOffers={receivedCount}
                sentPendingOffers={sentPendingCount}
                receivedPendingOffers={receivedPendingCount}
                friendsCount={friends.length}
                username={username}
              />
              <ActivityWidget title={"Activity"} activities={userActivities} />
            </>
          )}
        </div>

        <div className="w-full h-full mx-auto lg:px-0 col-span-2 flex flex-col overflow-auto">
            <div className=" pt-6 mb-8">
              <div className="pb-6">
                <h3>Recent Offers</h3>
              </div>

              <Offers sent={sent} received={received} countSent={countSent} countReceived={countReceived} session={session} countPendingReceived={countPendingReceived} countPendingSent={countPendingSent} setSentPendingCount={setSentPendingCount} setReceivedPendingCount={setReceivedPendingCount}  setSentCount={setSentCount} setReceivedCount={setReceivedCount}  />
            </div>

          <div className="pb-6">
            <h3>Make Connections</h3>
          </div>
          <div className="lg:grid lg:grid-cols-2 gap-4 items-stretch auto-cols-fr">
            <InviteFriend user={user} />
            <div className="rounded-xl bg-orange-200 border border-orange-300 xl:flex-1 mb-6 ">
              <QuickConnect
                session={session}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            </div>
          </div>
        </div>

        <div className="flex">
          {friendsList.length > 0 && (
            <div className="flex-1">
              <div className="py-4  mb-0 bg-white border-b-0 rounded-t-2xl">
                <h3 className="mb-0">Friends</h3>
              </div>
              <FriendsWidget
                session={session}
                friendsList={friendsList}
                setFriendsList={setFriendsList}
              />
            </div>
          )}
          {/* {pendingConversations.length > 0 && (
                <div className="px-4 lg:px-0 flex-1">
                  <div className="w-full  lg:px-6 lg-max:mt-6 border border-gray-200 rounded-md bg-white mb-6">
                    <div className="p-4 pb-0 mb-0 bg-white border-b-0 rounded-t-2xl">
                      <h3 className="mb-0">Pending Conversations</h3>
                    </div>
                    <div className="relative flex flex-col h-full min-w-0 break-words bg-white border-0-soft-xl rounded-2xl bg-clip-border">
                      {pendingConversations.map((conversation) => (
                        <div className="p-4 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <img
                                src={
                                  conversation.participant1?.profile?.image ||
                                  "/images/placeholders/avatar.png"
                                }
                                className="w-8 h-8 rounded-full mr-2 border p-[1px] border-gray-200"
                              />
                              <div className="flex flex-col">
                                <div className="font-bold">
                                  {conversation.participant1.username}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {conversation?.directMessages[0].text}
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="flex gap-4 text-xs text-orange-500 justify-end font-bold">
                                <button
                                  onClick={() =>
                                    pendingConversation.onOpen(
                                      conversation.participant1.id,
                                      conversation,
                                      session
                                    )
                                  }
                                >
                                  View
                                </button>
                              </div>
                              <div className="text-xs text-gray-500 text-right">
                                {formatDistanceToNow(
                                  new Date(conversation.updatedAt),
                                  {
                                    addSuffix: true,
                                  }
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )} */}
        </div>
      </div>
    </Dash>
  );
};

export default Index;

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const session = await getSession(context);

    if (!session) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    const user = await getCurrentUser(session);

    const friends = await getFriendsByUserId(session.user.id);
    const PAGE_SIZE = 5;

    const blocked = user?.blockedFriends

    const listings = await getOffersByUserId(session, PAGE_SIZE, blocked);

    if (!listings) return { props: { sent: [], received: [], session } };

    const {
      sent,
      received,
      countSent,
      countReceived,
      countPendingSent,
      countPendingReceived,
    } = listings;

    const copiedActivities = [...(user?.activities as any[])];
    const reversedActivities = copiedActivities.reverse();
    const topActivities = reversedActivities.slice(0, 4);

    const username = user?.username;


    return {
      props: {
        sent,
        received,
        countSent,
        countReceived,
        countPendingSent,
        countPendingReceived,
        user,
        username: username,
        friends,
        session,
        activities: topActivities,
      },
    };
  } catch (error) {
    console.error("Error in getServerSideProps", error);
    return {
      props: {
        listings: [],
        requests: [],
        friends: [],
      },
    };
  }
};
