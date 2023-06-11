import React, { use, useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import getCurrentUser from "@/actions/getCurrentUser";
import { Listing} from "@prisma/client";
import { User } from "@/types";
import { Meta } from "@/layouts/meta";
import { Dash } from "@/templates/dash";
import getListingsByUserId from "@/actions/getListingsByUserId";
import EmptyState from "@/components/EmptyState";
import Offer from "@/components/offers/Offer";
import UserCard from "@/components/widgets/UserCard";
import useOfferModal from "@/hooks/useOfferModal";
import getRequestsByUserId from "@/actions/getRequestsByUserId";
import { SafeListing } from "@/types";
import getFriendsByUserId from "@/actions/getFriendsByUserId";
import Link from "next/link";
import { toast } from "react-hot-toast";


interface dashboardProps {
  listings: Listing[];
  user: User;
  requests: Listing[];
  negotiations: Listing[];
  friends: User[];
  addedFriends: User[];
}

const Index = ({ listings, user, requests, friends }: dashboardProps) => {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"sent" | "received" | "requests">(
    "sent"
  );
  const offerModal = useOfferModal();

  const [friendsList, setFriendsList] = useState<User[]>(friends);

  const onRemoveFriendClick = async (friendId: string) => {
    try {
      const res = await fetch("/api/deleteFriend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userAddsId: session.user.id,
          friendAddsId: friendId,
        }),
      });
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(data.error);
      }
  
      // If friend is successfully removed in backend, filter out the friend in frontend state
      setFriendsList(friendsList.filter(friend => friend.id !== friendId));
  
      toast.success("Friend removed!");
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };
  useEffect(() => {
    const fetchSession = async () => {
      const session = await getSession();
      setSession(session);
    };
    fetchSession();
  }, []);

  const awaitingApproval = requests.filter(
    (item: any) => (
      item.status === "awaiting approval",
      item.buyerId === session?.user?.id
    )
  );

  const received = requests.filter(
    (item: any) => (
      item.status !== "awaiting approval",
      item.buyerId === session?.user?.id
    )
  );

  const awaitingApprovalListings = awaitingApproval.map((item: Listing) => {
    if (item.status === "awaiting approval")
      return <Offer key={item.id} {...item} />;
  });

  const receivedListings = received.map((item: Listing) => {
    if (item.status !== "awaiting approval")
      return <Offer key={item.id} {...item} />;
  });

  const awaitingApprovalCount = received.filter(
    (item: any) => item.status === "awaiting approval"
  ).length;
  const receivedListingsCount = received.filter(
    (item: any) => item.status !== "awaiting approval"
  ).length;

  useEffect(() => {
    if (awaitingApprovalCount > 0) {
      setActiveTab("received");
    }
  }, [awaitingApprovalCount]);

  return (
    <Dash
      meta={
        <Meta
          title="Make You An Offer You Can't Refuse"
          description="This is the Make You An Offer Web App"
        />
      }
    >
      <div className="grid grid-cols-12 mt-10">
        <div className="w-full mx-auto px-4 sm:px-8 lg:col-span-9 col-span-12 overflow-scroll">
          <div className="rounded-lg bg-orange-200 border border-gray-200 p-4">
            <div className="flex  items-center justify-between gap-2">
              <div className="md:text-xl font-semibold leading-tight">
                Hello <span className="capitalize">{session?.user?.name}</span>,
                welcome back!
              </div>
              <div className="flex gap-2">
                <button
                  onClick={offerModal.onOpen}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-2 py-1 md:py-2 md:px-4 rounded"
                >
                  Create Offer
                </button>
              </div>
            </div>
          </div>
          {listings.length === 0 && requests.length === 0 ? (
            <EmptyState showReset />
          ) : (
            <div>
              <div className="border-b border-gray-200 w-full flex gap-4 mt-6">
                <div
                  className={`uppercase cursor-pointer font-bold ${
                    activeTab === "sent" && "border-b-4 border-orange-500"
                  }`}
                  onClick={() => setActiveTab("sent")}
                >
                  Sent
                </div>
                <div
                  className={`uppercase cursor-pointer font-bold items-start flex`}
                  onClick={() => setActiveTab("received")}
                >
                  <span
                    className={`${
                      activeTab === "received" && "border-b-4 border-orange-500"
                    }`}
                  >
                    Received
                  </span>
                  {awaitingApprovalCount > 0 && (
                    <span className="bg-orange-200 rounded-full px-2 text-orange-500 text-xs ml-1 lowercase">
                      {awaitingApprovalCount} new
                    </span>
                  )}
                </div>
              </div>

              {activeTab === "sent" && (
                <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                  <div className="border border-gray-200 bg-gray-50 p-4">
                    <div className="font-extrabold flex justify-between">
                      Your Offer Listings
                      {listings.length > 0 && ( 
                      <span className="bg-orange-200 rounded-full px-2 py-1 text-orange-500">
                        {listings.length}
                      </span>

                      )}
                    </div>
                  </div>

                  <div className="min-w-full border-l border-r border-b border-gray-200">
                    {listings.map((item: Listing) => {
                      if (item.sellerId === session?.user?.id)
                        return <Offer key={item.id} {...item} />;
                        else 
                        return <div className="p-4 bg-white text-sm italic">No Listings</div>
                    })}
                  </div>
                </div>
              )}

              {activeTab === "received" && (
                <>
                  <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                    <div className="border border-gray-200 bg-gray-50 p-4">
                      <div className="font-extrabold flex justify-between">
                        Offer Requests{" "}
                        {awaitingApprovalCount > 0 && (
                          <span className="bg-orange-200 rounded-full px-2 py-1 text-orange-500">
                            {awaitingApprovalCount}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="min-w-full border-l border-r border-b border-gray-200 ">
                      {awaitingApprovalCount > 0
                        ? awaitingApprovalListings
                        : <div className="p-4 bg-white text-sm italic">No new requests</div>}
                    </div>
                  </div>
                  <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                    <div className="border border-gray-200 bg-gray-50 p-4">
                      <div className="font-extrabold flex justify-between">
                        Received Offers{" "}
                        {receivedListingsCount > 0 && (
                        <span className="bg-orange-200 rounded-full px-2 py-1 text-orange-500">
                          {receivedListingsCount}
                        </span>
                        )}
                      </div>
                    </div>

                    <div className="min-w-full border-l border-r border-b border-gray-200">
                      {receivedListings ? receivedListings : <div className="p-4 bg-white text-sm italic">No received offers</div>}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <div className="col-span-12 lg:col-span-3 px-4 md:px-8  lg:px-0">
          <UserCard
            currentUser={user}
            sales={requests.length}
            offers={listings.length}
            messages={0}
            dashboard
          />
          <div className="w-full  px-4 lg-max:mt-6 border border-gray-200 rounded-md bg-white">
            <div className="relative flex flex-col h-full min-w-0 break-words bg-white border-0 shadow-soft-xl rounded-2xl bg-clip-border">
              <div className="p-4 pb-0 mb-0 bg-white border-b-0 rounded-t-2xl">
                <h5 className="mb-0">Friends</h5>
              </div>
              <div className="flex-auto p-4">
                <ul className="flex flex-col pl-0 mb-0 rounded-lg">
                  {friendsList.length > 0 ? ( 
                    friendsList.map((friend) => (
                      <li className="relative flex items-center px-0 py-2 mb-2 bg-white border-0 rounded-t-lg text-inherit">
                        <div className="inline-flex items-center justify-center w-12 h-12 mr-4 text-white transition-all duration-200 text-base ease-soft-in-out rounded-xl">
                          <Link href={`/dashboard/profile/${friend.id}`}>
                          <img
                            src={friend?.profile?.image || "images/placeholders/avatar.png"}
                            alt="profile picture"
                            className="w-full shadow-soft-2xl rounded-xl"
                          />
                          </Link>
                        </div>
                        <div className="flex flex-col items-start justify-center">
                          <h6 className="mb-0 leading-normal text-sm">{friend.username}</h6>
                        </div>
                        <button
                        onClick={() => onRemoveFriendClick(friend.id)}
                          className="inline-block py-3 pl-0 pr-4 mb-0 ml-auto font-bold text-center uppercase align-middle transition-all bg-transparent border-0 rounded-lg shadow-none cursor-pointer leading-pro text-xs ease-soft-in hover:scale-102 hover:active:scale-102 active:opacity-85 text-orange-500 hover:text-orange-800 hover:shadow-none active:scale-100"
                        >
                          Unfollow
                        </button>
                      </li>
                    ))
                  ) :
                  (
                    <i>No friends yet</i>
                  )
                   }
            

                  
                  
                </ul>
              </div>
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

    if (!session) {
      return {
        redirect: {
          destination: "/login", // redirect to login if no session found
          permanent: false,
        },
      };
    }

    const user = await getCurrentUser(session);
    const listings: SafeListing[] = await getListingsByUserId(session.user.id);
    const requests: SafeListing[] = await getRequestsByUserId(session.user.id);
    const friends = await getFriendsByUserId(session.user.id);

    return {
      props: {
        listings,
        user,
        requests,
        friends, // includes the friends in the props
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