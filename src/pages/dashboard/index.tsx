import React, { use, useEffect, useRef, useState } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import getCurrentUser from "@/actions/getCurrentUser";
import { User } from "@/types";
import { Meta } from "@/layouts/meta";
import { Dash } from "@/templates/dash";
import getListingsByUserId from "@/actions/getListingsByUserId";
import EmptyState from "@/components/EmptyState";
import Offer from "@/components/offers/Offer";
import useOfferModal from "@/hooks/useOfferModal";
import usePendingConversationModal from "@/hooks/usePendingConversationModal";
import getRequestsByUserId from "@/actions/getRequestsByUserId";
import getFriendsByUserId from "@/actions/getFriendsByUserId";
import QuickConnect from "@/components/widgets/QuickConnect";
import getConversationsByUserId from "@/actions/getConversationsByUserId";
import { formatDistanceToNow, set } from "date-fns";
import { Socket, io } from "socket.io-client";
import { config } from "@/config";
import { useRouter } from "next/router";
import Spinner from "@/components/Spinner";
import Stats from "@/components/dashboard/Stats";
import ActivityWidget from "@/components/dashboard/widgets/ActivityWidget";
import InviteFriend from "@/components/dashboard/widgets/InviteFriend";
import { BiFilterAlt } from "react-icons/bi";
import Button from "@/components/dashboard/Button";
import Skeleton from "react-loading-skeleton";
import {
  Activity,
  IConversation,
  ListingsMap,
  dashboardProps,
  DashListing,
  ListingStatus,
} from "@/interfaces/authenticated";
import FriendsWidget from "@/components/widgets/FriendsWidget";
import { Listing } from "@prisma/client";
import { all } from "axios";
import { ca } from "date-fns/locale";
import useQuickConnect from "@/hooks/useQuickConnect";
import listingsCount from "@/actions/listingsCount";
import { toast } from "react-hot-toast";

const Index = ({
  allListings,
  allRequests,
  listings,
  user,
  requests,
  friends,
  session,
  conversations,
  activities,
  listingsCount,
  requestsCount,
  username,
}: dashboardProps) => {
  const offerModal = useOfferModal();
  const pendingConversation = usePendingConversationModal();

  const [activeTab, setActiveTab] = useState<"sent" | "received">("sent");
  const [category, setCategory] = useState<
    "all" | "awaiting approval" | "negotiating" | "rejected" | "completed" | "pending"
  >("all");

  const [friendsList, setFriendsList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userActivities, setUserActivities] = useState<any>([]);
  const [realTimeListings, setRealTimeListings] = useState<any>({});
  const [realTimeRequests, setRealTimeRequests] = useState<any>({});
  const [initListings, setInitListings] = useState<any>([]);
  const [initRequests, setInitRequests] = useState<any>([]);
  const [sentCount, setSentCount] = useState<any>(0);
  const [receivedCount, setReceivedCount] = useState<any>(0);

  console.log(username)

  const connect = useQuickConnect()
  
  useEffect(() => {
    if (!user.activated) {
      setIsLoading(true);
      setTimeout(() => {
        router.push("/dashboard/wizard");
      }, 0);
    } else {
    setFriendsList(friends);
    setUserActivities(activities);
    setInitListings(allListings)
    setInitRequests(allRequests)
    setIsLoading(false)
    setSentCount(listingsCount)
    setReceivedCount(requestsCount)
    }
  }, [session.user.id])

  const filterAndMapListingsByStatus = (
    listings: DashListing[]
  ): ListingsMap => {
    const validStatuses: ListingStatus[] = [
      "awaiting approval",
      "negotiating",
      "accepted",
      "rejected",
    ];

    const filteredListings: DashListing[] = listings.filter((listing) =>
      validStatuses.includes(listing.status)
    );

    return filteredListings.reduce((acc: ListingsMap, listing: DashListing) => {
      if (!acc[listing.status]) {
        acc[listing.status] = [];
      }
      acc[listing.status]?.push(listing);
      return acc;
    }, {} as ListingsMap);
  };

  const flattenListingsMap = (listingsMap: ListingsMap): DashListing[] => {
    return Object.values(listingsMap).flat();
  };

  useEffect(() => {
    const realTimeListingsByStatus = filterAndMapListingsByStatus(
      flattenListingsMap(listings)
    );
    setRealTimeListings(realTimeListingsByStatus);
  }, [listings]);

  useEffect(() => {
    const realTimeRequestsByStatus = filterAndMapListingsByStatus(
      flattenListingsMap(requests)
    );
    setRealTimeRequests(realTimeRequestsByStatus);
  }, [requests]);

  const router = useRouter();

  const pendingConversations = conversations.filter(
    (item: any) =>
      item.status === "none" && item.participant2Id === session.user.id
  );
  const acceptedConversations = conversations.filter(
    (item: any) => item.status === "accepted"
  );

  useEffect(() => {
    if (realTimeRequests.length > 0) {
      setActiveTab("received");
    }
  }, [realTimeRequests]);

  const socketRef = useRef<Socket>();

  useEffect(() => {
    socketRef.current = io(config.PORT);
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!session.user.id) return;
    if (!socketRef) return
    socketRef.current && socketRef?.current.emit("register", session.user.id);

    socketRef.current && socketRef.current.on("updated_activities", (activities: any) => {
      console.log("updated activities", activities);
      const copiedActivities = [...(activities.activities as any[])];
      const reversedActivities = copiedActivities.reverse();
      const topActivities = reversedActivities.slice(0, 3);
      setUserActivities(topActivities);
    });

    socketRef.current && socketRef.current.on("friend_added", (data) => {
      console.log("added", data);
      setFriendsList((prevFriendsList) => [...prevFriendsList, data.follower]);
    });

    socketRef.current && socketRef.current.on("friend_accepted", (data) => {
      console.log("accepted", data);  
      setFriendsList((prevFriendsList) => {
        return prevFriendsList.map((friend) =>
          friend.id === data.id ? { ...friend, accepted: true } : friend
        );
      });
   });

    socketRef.current && socketRef.current.on("friend_removed", (data) => {
      console.log("removed", data);
      setFriendsList((prevFriendsList) =>
        prevFriendsList.filter(
          (friend) => friend.id !== data.id
        )
      );
    });


    socketRef.current && socketRef.current.on("new_listing", (newListing: any) => {
      console.log("new listing", newListing);
      toast.success("New listing added!");
      setRealTimeListings((prevListings: ListingsMap) => {
        let updatedListings = { ...prevListings };
        let newListingStatus: ListingStatus = newListing.status;

        if (!updatedListings[newListingStatus]) {
          updatedListings[newListingStatus] = [];
        }

        (updatedListings[newListingStatus] as DashListing[]).push(newListing);
        setInitListings((prevListings: Listing[]) => {
          return [newListing, ...prevListings];
        });

        return updatedListings;
      });
    });

    socketRef.current && socketRef.current.on("request_received", (newRequest: any) => {
      toast.success("New listing added!");
      console.log("new request", newRequest); 
      setRealTimeRequests((prevListings: ListingsMap) => {
        let updatedListings = { ...prevListings };
        let newListingStatus: ListingStatus = newRequest.status;

        if (!updatedListings[newListingStatus]) {
          updatedListings[newListingStatus] = [];
        }

        (updatedListings[newListingStatus] as DashListing[]).push(newRequest);
        setInitRequests((prevRequests: Listing[]) => {
          return [newRequest, ...prevRequests];
        });
        return updatedListings;
      });
    });

    socketRef.current && socketRef.current.on("delete_offer", (deletedListing: DashListing) => {
      console.log("offer deleted", deletedListing);

      setRealTimeListings((prevListings: ListingsMap) => {
        let updatedListings = { ...prevListings };

        let deletedListingStatus: ListingStatus = deletedListing.status;

        updatedListings[deletedListingStatus] = (
          updatedListings[deletedListingStatus] as DashListing[]
        ).filter((listing) => listing.id !== deletedListing.id);

        setInitListings((prevListings: Listing[]) => {
          return prevListings.filter(
            (listing) => listing.id !== deletedListing.id
          );
        });
        return updatedListings;
      });
    });

    socketRef.current && socketRef.current.on("delete_request", (deletedListing: DashListing) => {
      console.log("request deleted", deletedListing);

      setRealTimeRequests((prevListings: ListingsMap) => {
        let updatedRequests = { ...prevListings };

        let deletedListingStatus: ListingStatus = deletedListing.status;

        updatedRequests[deletedListingStatus] = (
          updatedRequests[deletedListingStatus] as DashListing[]
        ).filter((listing) => listing.id !== deletedListing.id);

        setInitRequests((prevRequests: Listing[]) => {
          return prevRequests.filter(
            (listing) => listing.id !== deletedListing.id
          );
        });

        return updatedRequests;
      });
    });

    return () => {
      socketRef.current && socketRef.current.disconnect();
    };
  }, [session.id]);

  const activeListings =
    category === "all" ? initListings : realTimeListings?.[category] || [];

  const activeRequests =
    category === "all" ? initRequests : realTimeRequests?.[category] || [];

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
              <><Stats
                title="Overview"
                totalStats={10}
                startOffer={offerModal.onOpen}
                sentOffers={sentCount}
                receivedOffers={receivedCount}
                friendsCount={friends.length}
                username={username}
              />
              <ActivityWidget title={"Activity"} activities={userActivities} />
              </> )}
              
            </div>

            <div className="w-full h-full mx-auto lg:px-0 col-span-2 flex flex-col overflow-auto">
              {realTimeListings.length === 0 &&
              realTimeRequests.length === 0 ? (
                <div className="hidden xl:flex flex-grow mt-6 flex-col overflow-auto">
                  <EmptyState showReset />
                </div>
              ) : (
                <div className=" pt-6 mb-8">
                  <div className="pb-6">
                    <h3>Recent Offers</h3>
                  </div>
                  <div className="h-full  rounded-xl">
                    <div className="border-b border-gray-200 w-full flex justify-between bg-gray-100 items-center">
                      <div className="flex gap-4  p-4">
                        <div
                          className={`uppercase cursor-pointer font-bold ${
                            activeTab === "sent" &&
                            "border-b-4 border-orange-400"
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
                              activeTab === "received" &&
                              "border-b-4 border-orange-400"
                            }`}
                          >
                            Received
                          </span>
                          {realTimeRequests.length > 0 && (
                            <span className="bg-orange-200 rounded-full px-2 text-orange-500 text-xs ml-1 lowercase">
                              {realTimeRequests.length} new
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="border border-gray-200 rounded-lg bg-gray-100 flex items-center mx-4">
                        <BiFilterAlt className="text-gray-500 mx-2 border-r border-gray-200" />
                        <select
                          key={activeTab}
                          value={category}
                          onChange={(e) =>
                            setCategory(
                              e.target.value as
                                | "awaiting approval"
                                | "all"
                                | "negotiating"
                                | "rejected"
                                | "completed"
                                | "pending"
                            )
                          }
                          className=" px-2 py-2 rounded-r-lg bg-gray-100"
                        >
                          <option value="all">All Offers</option>
                          <option value="awaiting approval">Awaiting</option>
                          <option value="negotiating">Negotiating</option>
                          <option value="completed">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                    {activeTab === "sent" && (
                      <>
                        <div className="">
                          <div className="min-w-full ">
                            {activeListings.length > 0 ? (
                              activeListings.map((item: Listing) => {
                                return <Offer key={item.id} socketRef={socketRef} {...item} />;
                              })
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full bg-white border-b border-gray-200">
                                <div className="text-gray-500 text-lg font-bold my-12 mx-4">
                                  No offers to display
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                    {activeTab === "received" && (
                      <>
                        <div className="h-full">
                          <div className="min-w-full ">
                            {activeRequests.length > 0 ? (
                              activeRequests.map((item: Listing) => {
                                return <Offer key={item.id} {...item} socketRef={socketRef}  />;
                              })
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full bg-white border-b border-gray-200">
                                <div className="text-gray-500 text-lg font-bold my-12 mx-4">
                                  No offers to display
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    <div></div>
                  </div>
                </div>
              )}
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
             { friendsList.length > 0 && (
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
              {pendingConversations.length > 0 && (
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

    const user = await getCurrentUser(session);
    console.log("userrrr", user);
    const friends = await getFriendsByUserId(session.user.id);
    const conversations = await getConversationsByUserId(session.user.id);
    const listings: any[] = await getListingsByUserId(session.user.id);
    const {sentListingsCount, receivedListingsCount} = await listingsCount(session.user.id);
    const sortedListings = listings.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const topListings: { [key: string]: DashListing[] } = {};
    ["awaiting approval", "negotiating", "accepted", "rejected"].forEach(
      (status) => {
        const filtered = sortedListings
          .filter((listing) => listing.status === status)
          .slice(0, 5);
        topListings[status] = filtered.map((listing) => ({
          ...listing,
          createdAt: new Date(listing.createdAt).toISOString(),
          updatedAt: new Date(listing.updatedAt).toISOString(),
          expireAt: listing?.expireAt
            ? new Date(listing.expireAt).toISOString()
            : null,
        }));
      }
    );

    const requests: any[] = await getRequestsByUserId(session.user.id);
    const sortedRequests = requests.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const topRequests: { [key: string]: DashListing[] } = {};
    ["awaiting approval", "negotiating", "accepted", "rejected"].forEach(
      (status) => {
        const filtered = sortedRequests
          .filter((request) => request.status === status)
          .slice(0, 5);
        topRequests[status] = filtered.map((request) => ({
          ...request,
          createdAt: new Date(request.createdAt).toISOString(),
          updatedAt: new Date(request.updatedAt).toISOString(),
          expireAt: request?.expireAt
            ? new Date(request.expireAt).toISOString()
            : null,
        }));
      }
    );

    const allListings = listings.slice(0, 5);
    const allRequests = requests.slice(0, 5);

    const copiedActivities = [...(user?.activities as any[])];
    const reversedActivities = copiedActivities.reverse();
    const topActivities = reversedActivities.slice(0, 3);

    const username =  user?.username;
   
    return {
      props: {
        listings: topListings,
        user,
        username: user?.username,
        requests: topRequests,
        friends,
        session,
        conversations,
        allListings,
        allRequests,
        activities: topActivities,
        listingsCount: sentListingsCount,
        requestsCount: receivedListingsCount,
      },
    };
  } catch (error) {
    console.error("Error in getServerSideProps", error);
    return {
      props: {
        listings: [],
        requests: [],
        friends: [],
        conversations: [],
      },
    };
  }
};
