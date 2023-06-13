import React, { use, useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import getCurrentUser from "@/actions/getCurrentUser";
import { Listing } from "@prisma/client";
import { User } from "@/types";
import { Meta } from "@/layouts/meta";
import { Dash } from "@/templates/dash";
import getListingsByUserId from "@/actions/getListingsByUserId";
import EmptyState from "@/components/EmptyState";
import Offer from "@/components/offers/Offer";
import UserCard from "@/components/widgets/UserCard";
import useOfferModal from "@/hooks/useOfferModal";
import getRequestsByUserId from "@/actions/getRequestsByUserId";
import getFriendsByUserId from "@/actions/getFriendsByUserId";
import Link from "next/link";
import { toast } from "react-hot-toast";
import QuickConnect from "@/components/widgets/QuickConnect";

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
      setFriendsList(friendsList.filter((friend) => friend.id !== friendId));

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
      item.status === "awaiting approval", item.buyerId === session?.user?.id
    )
  );

  const received = requests.filter(
    (item: any) => (
      item.status !== "awaiting approval", item.buyerId === session?.user?.id
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
          {/* <div>
            <div className="flex-1 p-6 undefined bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="inline-flex items-center capitalize leading-none text-xs border rounded-full py-1 px-3 bg-emerald-500 border-emerald-500 text-white ">
                  <span className="inline-flex justify-center items-center w-4 h-4 mr-1">
                    <svg
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                      className="inline-block"
                    >
                      <path
                        fill="currentColor"
                        d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z"
                      ></path>
                    </svg>
                  </span>
                  <span>12%</span>
                </div>
                <button
                  className="inline-flex justify-center items-center whitespace-nowrap focus:outline-none transition-colors focus:ring duration-150 border cursor-pointer rounded border-gray-100 dark:border-slate-800 ring-gray-200 dark:ring-gray-500 bg-gray-100 text-black dark:bg-slate-800 dark:text-white hover:bg-gray-200 hover:dark:bg-slate-700  p-1"
                  type="button"
                >
                  <span className="inline-flex justify-center items-center w-6 h-6 ">
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      className="inline-block"
                    >
                      <path
                        fill="currentColor"
                        d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"
                      ></path>
                    </svg>
                  </span>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg leading-tight text-gray-500 dark:text-slate-400">
                    Clients
                  </h3>
                  <h1 className="text-3xl leading-tight font-semibold">
                    <div>512</div>
                  </h1>
                </div>
                <span className="inline-flex justify-center items-center  h-16 text-emerald-500">
                  <svg
                    viewBox="0 0 24 24"
                    width="48"
                    height="48"
                    className="inline-block"
                  >
                    <path
                      fill="currentColor"
                      d="M16 17V19H2V17S2 13 9 13 16 17 16 17M12.5 7.5A3.5 3.5 0 1 0 9 11A3.5 3.5 0 0 0 12.5 7.5M15.94 13A5.32 5.32 0 0 1 18 17V19H22V17S22 13.37 15.94 13M15 4A3.39 3.39 0 0 0 13.07 4.59A5 5 0 0 1 13.07 10.41A3.39 3.39 0 0 0 15 11A3.5 3.5 0 0 0 15 4Z"
                    ></path>
                  </svg>
                </span>
              </div>
            </div>
          </div>
          */}
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
                        return (
                          <div className="p-4 bg-white text-sm italic">
                            No Listings
                          </div>
                        );
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
                      {awaitingApprovalCount > 0 ? (
                        awaitingApprovalListings
                      ) : (
                        <div className="p-4 bg-white text-sm italic">
                          No new requests
                        </div>
                      )}
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
                      {receivedListings ? (
                        receivedListings
                      ) : (
                        <div className="p-4 bg-white text-sm italic">
                          No received offers
                        </div>
                      )}
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

          <div className="w-full  px-6 lg-max:mt-6 border border-gray-200 rounded-md bg-white mb-6">
            <div className="relative flex flex-col h-full min-w-0 break-words bg-white border-0 shadow-soft-xl rounded-2xl bg-clip-border">
              <QuickConnect session={session} />
            </div>
          </div>
          <div className="w-full  px-4 lg-max:mt-6 border border-gray-200 rounded-md bg-white mb-6">
            <div className="relative flex flex-col h-full min-w-0 break-words bg-white border-0 shadow-soft-xl rounded-2xl bg-clip-border">
              <div className="p-4 pb-0 mb-0 bg-white border-b-0 rounded-t-2xl">
                <h5 className="mb-0">Friends</h5>
              </div>
              <div className="flex-auto p-4">
                <ul className="flex flex-col pl-0 mb-0 rounded-lg">
                  {friendsList.length > 0 ? (
                    friendsList.map((friend) => (
                      <li className="relative flex items-center px-0 mb-2 bg-white border-0 rounded-t-lg text-inherit">
                        <div className="inline-flex items-center justify-center w-12 h-12 mr-4 text-white transition-all duration-200 text-base ease-soft-in-out rounded-xl">
                          <Link href={`/dashboard/profile/${friend.id}`}>
                            <img
                              src={
                                friend?.profile?.image ||
                                "images/placeholders/avatar.png"
                              }
                              alt="profile picture"
                              className="w-full shadow-soft-2xl rounded-full"
                            />
                          </Link>
                        </div>
                        <div className="flex flex-col items-start justify-center">
                          <h6 className="mb-0 leading-normal text-sm">
                            {friend.username}
                          </h6>
                        </div>
                        <button
                          onClick={() => onRemoveFriendClick(friend.id)}
                          className="inline-block py-3 pl-0 pr-4 mb-0 ml-auto font-bold text-center uppercase align-middle transition-all bg-transparent border-0 rounded-lg shadow-none cursor-pointer leading-pro text-xs ease-soft-in hover:scale-102 hover:active:scale-102 active:opacity-85 text-orange-500 hover:text-orange-800 hover:shadow-none active:scale-100"
                        >
                          Unfollow
                        </button>
                      </li>
                    ))
                  ) : (
                    <i>No friends yet</i>
                  )}
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
    const listings = await getListingsByUserId(session.user.id);
    const requests = await getRequestsByUserId(session.user.id);
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
