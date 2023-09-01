// import usePendingConversationModal from "@/hooks/usePendingConversationModal";

import React, { use, useEffect, useReducer, useState } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import getCurrentUser from "@/actions/getCurrentUser";
import { Meta } from "@/layouts/meta";
import { Dash } from "@/templates/dash";
import useOfferModal from "@/hooks/useOfferModal";
import QuickConnect from "@/components/widgets/QuickConnect";
import { useRouter } from "next/router";
import Stats from "@/components/dashboard/Stats";
import InviteFriend from "@/components/dashboard/widgets/InviteFriend";
import Button from "@/components/dashboard/Button";
import Skeleton from "react-loading-skeleton";
import { INotification, dashboardProps } from "@/interfaces/authenticated";
import FriendsWidget from "@/components/widgets/FriendsWidget";
import getOffersByUserId from "@/actions/dashboard/getOffersByUserId";
import Offers from "@/components/offers/Offers";
import { useSocketContext } from "@/context/SocketContext";
import reducer from "@/reducer/friends";
import getConversationsByUserId from "@/actions/getConversationsByUserId";
import { randomUUID } from "crypto";
import { useAlerts } from "@/hooks/AlertHook";
import { BiPlus } from "react-icons/bi";

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
  conversations,
  notifications,
}: dashboardProps) => {
  const [state, dispatch] = useReducer(reducer, { friends: [] });

  const [sentOffers, setSentOffers] = useState<any>([]);
  const [receivedOffers, setReceivedOffers] = useState<any>([]);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [count, setCount] = useState<any>({
    sent: 0,
    received: 0,
    pendingSent: 0,
    pendingReceived: 0,
  });

  const offerModal = useOfferModal();
  const socket = useSocketContext();
  const router = useRouter();
  const alerts = useAlerts();
  

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (isMounted) {
      setIsLoading(true);
      if (!user?.activated) {
        setTimeout(() => {
          router.push("/dashboard/wizard");
        }, 0);
        setIsLoading(false);
      } else {
        setSentOffers(sent);
        setReceivedOffers(received);
        dispatch({ type: "init", payload: friends });
        alerts.setAlerts({
          activity: activities,
          notifications: notifications,
          conversations: conversations,
          blockedUsers: user?.blockedFriends.map(
            (friend) => friend.friendBlockedId
          ),
        });

        setCount((prev: any) => ({
          sent: countSent,
          received: countReceived,
          pendingSent: countPendingSent,
          pendingReceived: countPendingReceived,
        }));

        setIsLoading(false);
      }
    }
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    socket.on(
      "updated_activities",
      ({ activity, notification, conversation }) => {
        // console.log("activity", activity)
        // console.log("notification", notification)
        // console.log("cov", conversation)
        alerts.setAlerts((prev: any) => {
          let conversationsArr = prev?.conversations
            ? [...prev?.conversations]
            : [];
          let notificationsArr = prev?.notifications
            ? [...prev?.notifications]
            : [];
          let activityArr = prev?.activity ? [...prev?.activity] : [];

          if (conversation)
            conversationsArr = [conversation, ...conversationsArr.slice(0, 3)];
          if (notification)
            notificationsArr = [notification, ...notificationsArr.slice(0, 3)];
          if (activity) activityArr = [...activityArr, activity];

          return {
            ...prev,
            activity: activityArr,
            notifications: notificationsArr,
            conversations: conversationsArr,
          };
        });
      }
    );

    socket.on("friend", (data) => {
      const { action, friend } = data;
      // const { id } = friend;
      // console.log("friend", friend);

      if (action.type === "accept") {
        const participant = friend.followerId === session?.user.id ? friend.followingId: friend.followerId;
        dispatch({ type: action, payload: participant });
        return;
      } else {
        dispatch({ type: action, payload: friend });
        return;
      }
    });

    return () => {
      socket.off("update_activities");
      socket.off("friend");
    };
  }, [isMounted]);

  return (
    <Dash
      dashboard
      meta={
        <Meta
          title="Make You An Offer You Can't Refuse"
          description="This is the Make You An Offer Web App"
        />
      }
    >
      <div className="p-4 pt-6 lg:px-8">
        {/* Header */}
        <div className="hidden lg:flex items-center justify-between ">
          <h2 className="text-2xl -mb-0.5">Dashboard</h2>
          <Button  className=" flex gap-1.5 items-center" onClick={offerModal.onOpen} >
           <BiPlus className="text-xl"/> Make an Offer
          </Button>
        </div>

        {/* Hero */}
        <hr className="my-0 hidden lg:block lg:mt-4 lg:mb-6 -mx-8" />
        
        {/*`Activities ${userActivities ? userActivities.length : 0}` */}
        <div className="xl:grid grid-cols-12 gap-x-6 mb-6">
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
                title={<div><span className="block lg:hidden">Dashboard</span><span className="hidden lg:block">Overview</span></div>}
                totalStats={10}
                startOffer={offerModal.onOpen}
                sentOffers={count.sent}
                receivedOffers={count.received}
                sentPendingOffers={count.pendingSent}
                receivedPendingOffers={count.pendingReceived}
                friendsCount={friends.length}
                username={session?.user.username}
              />
            </>
          )}
        </div>

        {/* Offers */}

        <div className="w-full h-full mx-auto lg:px-0 col-span-2 flex flex-col">
          <div className=" pt-2 ">
              <div className="pb-4">
                <h3>Recent Offers</h3>
              </div>
           
            <Offers
              sent={sentOffers}
              received={receivedOffers}
              countSent={countSent}
              countReceived={countReceived}
              session={session}
              countPendingReceived={countPendingReceived}
              countPendingSent={countPendingSent}
              setCount={setCount}
            />
            {countSent || countReceived ? (
              <div className="-mt-3 mb-6 md:mb-8">
                <Button
                  label="View more"
                  className="-mt-6"
                  link="/dashboard/offers"
                />
              </div>
            ) : null}
          </div>

          {/* Friends */}
          {state.friends.length > 0 && (

          <div className="flex mb-8">
            {state.friends.length > 0 && (
              <div className="flex-1">
                <div className="py-4  mb-0">
                  <h3 className="mb-0">Friends</h3>
                </div>
                <FriendsWidget
                  session={session}
                  friendsList={state.friends}
                  dispatch={dispatch}
                />
              </div>
            )}
          </div>
          )}

          {/* Connect */}

          <div className="pb-6">
            <h3>Make Connections</h3>
          </div>
          <div className="lg:grid lg:grid-cols-2 gap-4 items-stretch auto-cols-fr">
            <InviteFriend user={user} />
            <div className="rounded-xl bg-white border border-gray-200 xl:flex-1 mb-6 ">
              <QuickConnect
                session={session}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </Dash>
  );
};

export default Index;

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const session = await getSession(context);

    const now = new Date();

    if (!session) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    const PAGE_SIZE = 5;
    const user = await getCurrentUser(session);

    let friends = user?.friends;
    let blocked = user?.blockedFriends;
    if (!friends) friends = [];
    if (!blocked) blocked = [];

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

    const copiedActivities = [...(user?.activity as any[])];
    const topActivities = copiedActivities.reverse();
    const notifications = [...(user?.notifications as INotification[])];

    notifications.push({
      id: randomUUID(),
      type: "alert",
      message: `Your last login was ${now.toLocaleString()}`,
      userId: session?.user.id,
      action: "/dashboard/offers?tab=sent",
      createdAt: String(Date.now()),
      updatedAt: String(Date.now()),
    });

    if (
      !user?.profile?.image ||
      !user?.profile?.social ||
      !user?.profile?.website ||
      !user?.profile?.bio
    ) {
      notifications.push({
        id: randomUUID(),
        type: "profile",
        message: `Update your profile`,
        userId: session?.user.id,
        action: "/dashboard/settings",
        createdAt: String(Date.now()),
        updatedAt: String(Date.now()),
      });
    }

    if (countPendingReceived > 0) {
      notifications.push({
        id: randomUUID(),
        type: "offer",
        message: `You have ${countPendingReceived} pending offers`,
        userId: session?.user.id,
        action: "/dashboard/offers?tab=received",
        createdAt: String(Date.now()),
        updatedAt: String(Date.now()),
      });
    }

    const conversations = await getConversationsByUserId(
      session?.user.id,
      user,
      5
    );

    const filteredNotifications = notifications.slice(0, 4);

    return {
      props: {
        sent,
        received,
        countSent,
        countReceived,
        countPendingSent,
        countPendingReceived,
        user,
        friends,
        session,
        activities: topActivities,
        notifications: filteredNotifications,
        conversations,
      },
    };
  } catch (error) {
    console.error("Error in getServerSideProps", error);
    return {
      props: {
        sent: [],
        received: [],
        requests: [],
        friends: [],
        notifications: [],
        countSent: 0,
        countReceived: 0,
        countPendingSent: 0,
        countPendingReceived: 0,
        session: null,
      },
    };
  }
};
