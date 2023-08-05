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

  console.log("user", user);

  console.log("friends", friends);

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
  }, [
    session.user.id,
    countSent,
    countReceived,
    countPendingSent,
    countPendingReceived,
    friends,
    activities,
    sent,
    received,
  ]);

  const socketRef = useRef<Socket>();

  useEffect(() => {
    socketRef.current = io(config.PORT);
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  console.log(socketRef);

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
      <div className=" p-4 pt-8 lg:p-8 ">
        <div className="hidden lg:flex items-center justify-between">
          <h2 className="text-2xl">Dashboard</h2>
          <div className="flex items-center gap-x-2">
            <div className="hidden md:block">
              <Button
                label="Connect and Create"
                onClick={offerModal.onOpen}
                icon="/icons/thumbs-up.png"
                className="hidden md:block"
              />
            </div>
          </div>
        </div>

        <hr className="my-0 hidden lg:block lg:mt-4 lg:mb-6" />
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
            <p className="font-medium text-gray-500 mb-2 text-md lg:hidden">Dashboard</p>
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
          <div className=" pt-2  mb-8">
            <div className="pb-2">
              <h3>Recent Offers</h3>
            </div>

            <Offers
              sent={sent}
              received={received}
              countSent={countSent}
              countReceived={countReceived}
              session={session}
              countPendingReceived={countPendingReceived}
              countPendingSent={countPendingSent}
              setSentPendingCount={setSentPendingCount}
              setReceivedPendingCount={setReceivedPendingCount}
              setSentCount={setSentCount}
              setReceivedCount={setReceivedCount}
            />
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

    const PAGE_SIZE = 5;
    const user = await getCurrentUser(session);
    const friends = await getFriendsByUserId(session.user.id);
    const blocked = user?.blockedFriends;
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
