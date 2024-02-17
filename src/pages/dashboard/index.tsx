import getCurrentUser from "@/actions/getCurrentUser";
import useOfferModal from "@/hooks/useOfferModal";
import QuickConnect from "@/components/widgets/QuickConnect";
import Stats from "@/components/dashboard/Stats";
import InviteFriend from "@/components/dashboard/widgets/InviteFriend";
import Button from "@/components/dashboard/Button";
import Skeleton from "react-loading-skeleton";
import FriendsWidget from "@/components/widgets/FriendsWidget";
import Offers from "@/components/offers/Offers";
import reducer from "@/reducer/friends";
import getConversationsByUserId from "@/actions/getConversationsByUserId";
import { useEffect, useReducer, useState } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { Meta } from "@/layouts/meta";
import { Dash } from "@/templates/dash";
import { useRouter } from "next/router";
import { INotification, dashboardProps } from "@/interfaces/authenticated";
import { useSocketContext } from "@/context/SocketContext";
import { uuid } from 'uuidv4';
import { useAlerts } from "@/hooks/AlertHook";
import { BiPlus } from "react-icons/bi";
import getAllOffersByUserId from "@/actions/dashboard/getAllOffersByUserId";

const Index = ({
  listings,
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

  const [offers, setOffers] = useState<any>(listings);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [count, setCount] = useState<any>({
    sent: 0,
    received: 0,
    pendingSent: 0,
    pendingReceived: 0,
  });

  console.log("session", session);

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
        dispatch({ type: "init", payload: friends });
        alerts.setAlerts({
          activity: activities,
          notifications: notifications,
          conversations: conversations,
          unreadNotifications: user?.unreadNotifications || 0,
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
        const participant =
          friend.followerId === session?.user.id
            ? friend.followingId
            : friend.followerId;
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
      noBreadcrumbs
      optionalData={
        <Button
          className="gap-1.5 items-center"
          onClick={offerModal.onOpen}
          options={{
            only: {
              desktop: true,
              screen: true,
            },
          }}
        >
          <BiPlus className="text-xl" /> Make an Offer
        </Button>
      }
      meta={
        <Meta
          title="Dashboard"
          description="This is the Make You An Offer Web App"
        />
      }
    >
      <div className="p-4 pt-0 lg:px-8">
        {/* Hero */}

        {/*`Activities ${userActivities ? userActivities.length : 0}` */}
        <div className="xl:grid grid-cols-12 gap-x-6 mb-6 mt-4  lg:mt-6">
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
                title={<span className="block title">Overview</span>}
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
          {/* Connect */}
        </div>

        {/* Offers */}

        <div className="w-full h-full mx-auto lg:px-0 col-span-2 flex flex-col">
          <div className=" pt-2 ">
            <div className="pb-4">
              <span className="title">Recent Trades</span>
            </div>

            <Offers
              offers={offers}
              countSent={count.sent}
              countReceived={count.received}
              session={session}
              countPendingReceived={count.pendingReceived}
              countPendingSent={count.pendingSent}
              setCount={setCount}
              blockedIds={user?.blockedFriends.map(
                (friend) => friend.friendBlockedId
              )}
            />
            {countSent || countReceived ? (
              <div className="-mt-3 mb-6 md:mb-8">
                <Button
                  label="View more"
                  className="-mt-6"
                  link="/dashboard/trades"
                />
              </div>
            ) : (
              ""
            )}
          </div>

          {/* Friends */}
          {state.friends.length > 0 && (
            <div className="flex mb-8">
              {state.friends.length > 0 && (
                <div className="flex-1">
                  <div className="py-4  mb-0">
                    <span className="title">Friends</span>
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
    const now = new Date();

    const PAGE_SIZE = 5;
    const user = await getCurrentUser(session);

    let friends = user?.friends;
    let blocked = user?.blockedFriends;
    if (!friends) friends = [];
    if (!blocked) blocked = [];

    // const listings = await getOffersByUserId(session, PAGE_SIZE, blocked);

    const fetchListings = await getAllOffersByUserId(
      session,
      PAGE_SIZE,
      blocked
    );
    if (!fetchListings) return { props: { sent: [], received: [], session } };

    const {
      listings,
      countSent,
      countReceived,
      countPendingSent,
      countPendingReceived,
    } = fetchListings;

    const copiedActivities = [...(user?.activity as any[])];
    const topActivities = copiedActivities.reverse();
    const notifications = [...(user?.notifications as INotification[])];

    if (countPendingReceived > 0) {
      notifications.push({
        id: uuid(),
        type: "offer",
        message: `You have ${countPendingReceived} pending offers`,
        userId: session?.user.id,
        action: "/dashboard/trades",
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
        listings,
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
        listings: [],
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
