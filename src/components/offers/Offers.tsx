import { DashListing } from "@/interfaces/authenticated";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { BiFilterAlt } from "react-icons/bi";
import Offer from "./Offer";
import { Listing } from "@prisma/client";
import Button from "../dashboard/Button";
import OfferSkeleton from "./OfferSkeleton";
import { useSocketContext } from "@/context/SocketContext";
import listingsCount from "@/actions/listingsCount";
import useOfferModal from "@/hooks/useOfferModal";

type CountState = {
  countSent: number;
  countReceived: number;
  countPendingSent: number;
  countPendingReceived: number;
};

interface OffersProps {
  sent: any;
  received: any;
  session: any;
  multipage?: boolean;
  countSent: number;
  countReceived: number;
  countPendingSent: number;
  countPendingReceived: number;
  defaultTab?: string;
  setCount?: (
    countState:
      | ((prev: CountState) => CountState)
      | {
          countSent: number;
          countReceived: number;
          countPendingSent: number;
          countPendingReceived: number;
        }
  ) => void;
}
const Offers = ({
  sent,
  received,
  session,
  multipage,
  countSent,
  countReceived,
  countPendingReceived,
  countPendingSent,
  defaultTab,
  setCount,
}: OffersProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [allSent, setAllSent] = useState<any>([]);
  const [allReceived, setAllReceived] = useState<any>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sentListings, setSentListings] = useState<
    Record<string, DashListing[]>
  >({});
  const [receivedListings, setReceivedListings] = useState<
    Record<string, DashListing[]>
  >({});
  const [activeTab, setActiveTab] = useState(defaultTab || "sent");
  const [skip, setSkip] = useState(5);
  const [isMounted, setIsMounted] = useState(false);
  const create = useOfferModal();

  // console.log("sent", allSent);
  // console.log("received", allReceived);
  // console.log("sentListings", sentListings);
  // console.log("current page", currentPage);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (sent) {
      setAllSent(sent);
    }

    if (received ) {
      setAllReceived(received);
    }
    if (selectedCategory === "all") {
      setSentListings((prevListings) => {
        return { ...prevListings, all: sent };
      });
      setReceivedListings((prevListings) => {
        return { ...prevListings, all: received };
      });
      setIsLoading(false);
    }
  }, [sent, received]);


  console.log("count", countSent,)
  console.log("listings", sentListings,)
  const fetchListingsByCategory = async (
    category: string,
    userId: string,
    tab: string,
    skip = 0,
    PAGE_SIZE = 5
  ) => {
    setIsLoading(true);
    const url = `/api/dashboard/${
      tab === "sent" ? "getListingsByCategory" : "getReceivedListingsByCategory"
    }`;
    try {
      const response = await axios.post(url, {
        category,
        userId,
        skip,
        PAGE_SIZE,
      });
      setIsLoading(false);
      return response.data[tab];
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };


  useEffect(() => {
    const selectCategory = async () => {
      setIsLoading(true);
      if (activeTab === "sent" && sentListings[selectedCategory]) {
        return;
      } else if (
        activeTab === "received" &&
        receivedListings[selectedCategory]
      ) {
        return;
      }

      const data = await fetchListingsByCategory(
        selectedCategory,
        session?.user.id,
        activeTab
      );

      if (data) {
        if (activeTab === "sent") {
          setSentListings((prevListings) => {
            return { ...prevListings, [selectedCategory]: data };
          });
        } else if (activeTab === "received") {
          setReceivedListings((prevListings) => {
            return { ...prevListings, [selectedCategory]: data };
          });
        }
      }
    };
    selectCategory();
    setIsLoading(false);
  }, [selectedCategory, activeTab]);

  const handlePageChange = async (page: number) => {
    setIsLoading(true);
    setCurrentPage(page);

    const skip = page * 5 - 5;

    const data = await fetchListingsByCategory(
      selectedCategory,
      session?.user.id,
      activeTab,
      skip,
      5
    );

    if (data) {
      if (activeTab === "sent") {
        setSentListings((prevListings) => ({
          ...prevListings,
          [selectedCategory]: data,
        }));
      } else if (activeTab === "received") {
        setReceivedListings((prevListings) => ({
          ...prevListings,
          [selectedCategory]: data,
        }));
      }
    }
    setIsLoading(false);
  };

  const handleCategoryChange = async (category: string) => {
    setIsLoading(true);
    setSelectedCategory(category);
    setCurrentPage(1);
    setSkip(0);
  };

  const socket = useSocketContext();

  useEffect(() => {
    socket.on("new_listing", (data) => {
      const { listing } = data;

      console.log("new", listing)

      if (session?.user.id !== listing.userId) {
        setAllReceived((prevListings: any) => {
          return [listing, ...prevListings];
        });

        setReceivedListings((prevListings) => {
          return { ...prevListings, all: [listing, ...prevListings?.all] };
        });

        if (setCount)
          setCount((prevCount: any) => {
            const newCount = {
              ...prevCount,
              countReceived: countReceived + 1,
              countPendingReceived: countPendingReceived + 1,
            };
            return newCount;
          });
          console.log("count sent", countSent)
      }

      if (session?.user.id === listing.userId) {
        setAllSent((prevListings: any) => [listing, ...prevListings]);

        setSentListings((prevListings) => {
          return { ...prevListings, all: [listing, ...prevListings?.all] };
        });

        if (setCount)
          setCount((prev: CountState) => ({
            ...prev,
            countSent: prev.countSent + 1,
            countPendingSent: prev.countPendingSent + 1,
          }));
      }
    });

    return () => {
      socket.off("new_listing");
    };
  }, [session?.user.id]);

  return (
    <div className="-mx-4 sm:-mx-8 px-4 sm:px-8  rounded-lg mb-4">
      <div className="flex ">
        <div className=" w-full flex justify-between  items-center rounded-t-lg">
            <>
              <div className="flex pb-4 gap-2">
                
                  <div
                    className={`uppercase cursor-pointer font-bold rounded-lg border border-gray-200 bg-white p-3 py-1 ${
                      activeTab === "sent" &&
                      "border !bg-orange-default border-orange-200 text-white"
                    }`}
                    onClick={() => {
                      activeTab !== "sent" && setActiveTab("sent");
                      activeTab !== "sent" && handleCategoryChange("all");
                    }}
                  >
                    SENT
                  </div>
                  <div
                    className={`uppercase cursor-pointer font-bold items-start flex`}
                    onClick={() => {
                      activeTab !== "received" && setActiveTab("received");
                      activeTab !== "received" && handleCategoryChange("all");
                    }}
                  >
                    <span
                      className={`uppercase cursor-pointer font-bold rounded-lg border border-gray-200 bg-white p-3 py-1 ${
                        activeTab === "received" &&
                        "border !bg-orange-default border-orange-200 text-white"
                      }`}
                    >
                      RECEIVED
                    </span>

                    {/* {allRequests.length > 0 && (
                  <span className="bg-orange-200 rounded-full px-2 text-orange-500 text-xs ml-1 lowercase">
                    {allRequests.length} new
                  </span>
                )} */}
                  </div>
                
              </div>
            
          <div className="border border-gray-200 rounded-lg bg-gray-100 flex items-center  mb-4 -mt-1">
            <BiFilterAlt className="text-gray-500 mx-2 border-r border-gray-200" />
            <select
              key={activeTab}
              value={selectedCategory}
              onChange={(e) => (
                handleCategoryChange(
                  e.target.value as
                    | "all"
                    | "awaiting approval"
                    | "cancelled"
                    | "negotiating"
                    | "rejected"
                    | "accepted"
                    | "completed"
                    | "pending"
                ),
                setIsLoading(true)
              )}
              className=" px-2 py-2 rounded-r-lg bg-gray-100"
            >
              <option value="all">All Offers</option>
              <option value="awaiting approval">Awaiting</option>
              <option value="negotiating">Negotiating</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="rejected">Declined</option>
              <option value="cancelled">Terminated</option>
            </select>
          </div>
          </>
        </div>
      </div>
      <div className="flex flex-col min-w-full rounded-lg pt-2">
        {activeTab === "sent" && (
          <>
            <div className="transition-all ease-in-out duration-200">
              {isLoading ? (
                [...Array(sentListings[selectedCategory] && sentListings[selectedCategory].length || 0)].map((_, index) => (
                  <OfferSkeleton key={index} />
                ))
              ) : (
                <div className="min-w-full transition-all ease-in-out duration-200">
                  {sentListings.all.length > 0 && 
                  sentListings[selectedCategory] ? (
                    sentListings[selectedCategory].map((item: Listing) => {
                      return <Offer key={item.id} {...item} />;
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center rounded-xl bg-white  border border-gray-200 py-16 ">
                      <div className="text-gray-700 text-lg font-bold  mx-4 mb-4 text-center">
                        No offers to display{" "}
                        <p className="text-gray-700 text-sm mt-2 font-normal mb-3">
                         Connect and create a offer to get started
                        </p>
                      </div>
                      <Button
                        label="Get started"
                        onClick={create.onOpen}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            {multipage && countSent > 0 && (
              <div className="flex mt-6" key={activeTab + selectedCategory}>
                {sentListings[selectedCategory] && (
                  <div className="flex gap-2">
                    {Array.from({ length: countSent / 5 + 1 }).map(
                      (_, index) => (
                        <Button
                          key={index}
                          label={`${index + 1}`}
                          onClick={() => handlePageChange(index + 1)}
                          secondary={currentPage === index + 1}
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
        {activeTab === "received" && (
          <>
            <div className="transition-all ease-in-out duration-200">
              {isLoading ? (
                [...Array(receivedListings[selectedCategory] && receivedListings[selectedCategory].length || 0)].map((_, index) => (
                  <OfferSkeleton key={index} />
                ))
              ) : (
                <div className="min-w-full transition-all ease-in-out duration-200">
                  {receivedListings.all.length > 0 &&
                  receivedListings[selectedCategory] ? (
                    receivedListings[selectedCategory].map((item: Listing) => {
                      return <Offer key={item.id} {...item} />;
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center rounded-xl bg-white  border border-gray-200 py-16 ">
                    <div className="text-gray-700 text-lg font-bold  mx-4 mb-4 text-center ">
                      No offers to display{" "}
                      <p className="text-gray-700 text-sm mt-2 font-normal mb-3">
                       Connect and create a offer to get started
                      </p>
                    </div>
                   
                    <Button
                      label="Get started"
                      onClick={create.onOpen}
                    />
                  </div>
                  )}
                </div>
              )}
            </div>

            {multipage && countReceived > 0 && (
              <div className="flex" key={activeTab + selectedCategory}>
                {receivedListings[selectedCategory] && (
                  <div className="flex gap-2">
                    {Array.from({ length: countReceived / 5 + 1 }).map(
                      (_, index) => (
                        <Button
                          key={index}
                          label={`${index + 1}`}
                          onClick={() => handlePageChange(index + 1)}
                          secondary={currentPage === index + 1}
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Offers;
