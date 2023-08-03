import { DashListing } from "@/interfaces/authenticated";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { BiFilterAlt } from "react-icons/bi";
import Offer from "./Offer";
import { Listing } from "@prisma/client";
import Button from "../Button";
import { toast } from "react-hot-toast";
import { Socket, io } from "socket.io-client";
import { config } from "@/config";
import Skeleton from "react-loading-skeleton";
import { set } from "date-fns";
import OfferSkeleton from "./OfferSkeleton";

interface OffersProps {
  sent: any;
  received: any;
  session: any;
  multipage?: boolean;
  countSent: number;
  countReceived: number;
  countPendingSent: number;
  countPendingReceived: number;
  setSentCount?: (count: number) => void;
  setReceivedCount?: (count: number) => void;
  setSentPendingCount?: (count: number) => void;
  setReceivedPendingCount?: (count: number) => void;
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
  setSentCount,
  setReceivedCount,
  setSentPendingCount,
  setReceivedPendingCount 
}: OffersProps) => {

  const [isLoading, setIsLoading] = useState(true);
  const [allSent, setAllSent] = useState<any>([]);
  const [allReceived, setAllReceived] = useState<any>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [completedById, setCompletedById] = useState<string>("");

  const [sentListings, setSentListings] = useState<
    Record<string, DashListing[]>
  >({});
  const [receivedListings, setReceivedListings] = useState<
    Record<string, DashListing[]>
  >({});
  const [activeTab, setActiveTab] = useState("sent");

  // console.log("sent", allSent);
  // console.log("received", allReceived);
  // console.log("sentListings", sentListings);
  // console.log("receivedListings", receivedListings);

  useEffect(() => {
    if(sent || received){
      setAllSent(sent);
      setAllReceived(received);
    }
  }, [sent, received]);

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
    if (selectedCategory === "all" && currentPage === 1) {
      setSentListings((prevListings) => {
        return { ...prevListings, all: allSent };
      });
      setReceivedListings((prevListings) => {
        return { ...prevListings, all: allReceived };
      });
      setIsLoading(false);
    }
   
  }, [selectedCategory, allSent, allReceived]);

  useEffect(() => {
    const selectCategory = async () => {
      setIsLoading(true);
      if (
        (activeTab === "sent" && sentListings[selectedCategory]) ||
        (activeTab === "received" && receivedListings[selectedCategory])
      ) {
        return;
      }

      const data = await fetchListingsByCategory(
        selectedCategory,
        session.user.id,
        activeTab
      );

      if (data) {
        if (activeTab === "sent") {
          setSentListings((prevListings) => {
            return { ...prevListings, [selectedCategory]: data };
          });
        } else {
          setReceivedListings((prevListings) => {
            return { ...prevListings, [selectedCategory]: data };
          });
        }
      }
    };
    selectCategory();
    setIsLoading(false);
  }, [
    selectedCategory,
    activeTab,
    sentListings,
    receivedListings,
    session.user.id,
  ]);

  const handlePageChange = async (page: number) => {
    setIsLoading(true);
    const skip = (page - 1) * 5;
    setCurrentPage(page);
    const data = await fetchListingsByCategory(
      selectedCategory,
      session.user.id,
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
      } else {
        setReceivedListings((prevListings) => ({
          ...prevListings,
          [selectedCategory]: data,
        }));
      }
    }
    setIsLoading(false);
  };

  const handleCategoryChange = async (category: string) => {

    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const socketRef = useRef<Socket>();

  useEffect(() => {
    socketRef.current = io(config.PORT);
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!session.user.id) return;
    if (!socketRef) return;
    socketRef.current && socketRef?.current.emit("register", session.user.id);

    socketRef.current &&
      socketRef.current.on("new_listing", (listing: any, ownerId, participantId) => {
        console.log("new listing", listing);
        if (session?.user.id !== listing.userId) {
          setAllReceived((prevListings: any) => {
            return [listing, ...prevListings];
          });
          setReceivedListings((prevListings) => {
            return { ...prevListings, all: [listing, ...prevListings?.all] };
          });
          if (setReceivedCount) setReceivedCount(countReceived + 1);
          if(setReceivedPendingCount) setReceivedPendingCount(countPendingReceived + 1);
        } 
        if (session?.user.id === listing.userId) {
          setAllSent((prevListings: any) => {
            return [listing, ...prevListings];
          });
          setSentListings((prevListings) => {
            return { ...prevListings, all: [listing, ...prevListings?.all] };
          });
          if (setSentCount) setSentCount(countSent + 1);
          if(setSentPendingCount) setSentPendingCount(countPendingSent + 1);
        }
      });

    return () => {
      socketRef.current && socketRef.current.disconnect();
    };
  }, [session.user.id]);

  return (
    <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 ">
      <div className="flex ">
        <div className="border border-gray-200 w-full flex justify-between bg-gray-100 items-center rounded-t-lg">
          <div className="flex gap-4  p-4">
              <div
                className={`uppercase cursor-pointer font-bold ${
                  activeTab === "sent" && "border-b-4 border-orange-400"
                }`}
                onClick={() => {
                  setActiveTab("sent");
                  handleCategoryChange("all");
                }}
              >
                Sent
              </div>
              <div
                className={`uppercase cursor-pointer font-bold items-start flex`}
                onClick={() => {
                  setActiveTab("received");
                  handleCategoryChange("all");
                }}
              >
                <span
                  className={`${
                    activeTab === "received" && "border-b-4 border-orange-400"
                  }`}
                >
                  Received
                </span>

                {/* {allRequests.length > 0 && (
                        <span className="bg-orange-200 rounded-full px-2 text-orange-500 text-xs ml-1 lowercase">
                          {allRequests.length} new
                        </span>
                      )} */}
              </div>
          </div>
          <div className="border border-gray-200 rounded-lg bg-gray-100 flex items-center mx-4">
            <BiFilterAlt className="text-gray-500 mx-2 border-r border-gray-200" />
            <select
              key={activeTab}
              value={selectedCategory}
              onChange={(e) =>
                handleCategoryChange(
                  e.target.value as
                    | "all"
                    | "awaiting approval"
                    | "cancelled"
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
              <option value="rejected">Declined</option>
              <option value="cancelled">Terminated</option>
            </select>
          </div>
        </div>
      </div>
      <div className="inline-block min-w-full border-x border-gray-200">
        {activeTab === "sent"  && (
          <>
            <div className="transition">
              {isLoading ? (
               <OfferSkeleton />
              ) : (
                <div className="min-w-full transition">
                  {sentListings.all && sentListings.all.length > 0 && sentListings[selectedCategory] ? (
                    sentListings[selectedCategory].map((item: Listing) => {
                      return <Offer key={item.id} {...item} socketRef={socketRef} />;
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full bg-white border-b border-gray-200 rounded-b-lg">
                      <div className="text-gray-400 text-md font-medium my-12 mx-4">
                        No offers to display
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {multipage && (
              <div className="flex mt-6">
                {currentPage && currentPage > 1 && (
                  <div className="mr-auto">
                    <Button
                      options={{ color: "primary" }}
                      label="Back"
                      onClick={() => handlePageChange(currentPage - 1)}
                    />
                  </div>
                )}
                {sentListings[selectedCategory] &&
                  sentListings[selectedCategory].length > 3 && (
                    <div className="ml-auto">
                      <Button
                        label="Next"
                        onClick={() => handlePageChange(currentPage + 1)}
                      />
                    </div>
                  )}
              </div>
            )}
          </>
        )}
        {activeTab === "received" && (
          <>
            <div className="transition">
              {isLoading ? (
                <OfferSkeleton /> 
              ) : (
                <div className="min-w-full transition">
                  { receivedListings.all && receivedListings.all.length > 0 &&
                    receivedListings[selectedCategory] ? (
                      receivedListings[selectedCategory].map(
                        (item: Listing) => {
                          return <Offer key={item.id} {...item} socketRef={socketRef} />;
                        }
                      )
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full bg-white border-b border-gray-200 rounded-b-lg">
                        <div className="text-gray-400 text-md font-medium my-12 mx-4">
                          No offers to display
                        </div>
                      </div>
                    )
              }
                </div>
              )}
            </div>
            {multipage && (
              <div className="flex mt-6">
                {currentPage && currentPage > 1 && (
                  <div className="mr-auto">
                    <Button
                      options={{ color: "primary" }}
                      label="Back"
                      onClick={() => handlePageChange(currentPage - 1)}
                    />
                  </div>
                )}
                {receivedListings[selectedCategory] &&
                  receivedListings[selectedCategory].length > 3 && (
                    <div className="ml-auto">
                      <Button
                        label="Next"
                        onClick={() => handlePageChange(currentPage + 1)}
                      />
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
