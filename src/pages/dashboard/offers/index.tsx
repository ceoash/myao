import React, { use, useEffect, useState } from "react";
import { Meta } from "@/layouts/meta";
import { Dash } from "@/templates/dash";
import { GetServerSideProps } from "next";
import { FaSearch } from "react-icons/fa";
import { Listing, Message, User } from "@prisma/client";
import { getSession } from "next-auth/react";
import getListingsPaginatedByUserId from "@/actions/getPaginatedListingsByUserId";
import Offer from "@/components/offers/Offer";
import Link from "next/link";
import {
  DashListing,
  GolablListing,
  ListingStatus,
  ListingsMap,
} from "@/interfaces/authenticated";
import prisma from "@/libs/prismadb";
import { BiFilterAlt } from "react-icons/bi";
import getCategorizedListingsByUserId from "@/actions/getCategorizedListingsByUserId";
import getCategorizedRequestsByUserId from "@/actions/getCategorizedRequestsByUserId";
import { SafeListing } from "@/types";
import bcrypt from "bcrypt";
import getOffersByUserId from "@/actions/dashboard/getOffersByUserId";
import axios, { all } from "axios";
import { set } from "date-fns";
import Button from "@/components/dashboard/Button";
interface ListingType extends Listing {
  buyer: User;
}

interface IndexProps {
  session: any;
  sent: DashListing[];
  received: DashListing[];
}

const Index = ({ sent, received, session }: IndexProps) => {
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
  const [activeTab, setActiveTab] = useState("sent");

  useEffect(() => {
    setAllSent(sent);
    setAllReceived(received);
  }, []);

const fetchListingsByCategory = async (category: string, userId: string, tab: string, skip = 0, PAGE_SIZE = 5 ) => {
  const url = `/api/dashboard/${tab === "sent" ? "getListingsByCategory" : "getReceivedListingsByCategory"}`;
  
  try {
    const response = await axios.post(url, { category, userId, skip, PAGE_SIZE });
    return response.data[tab];
  } catch (error) {
    console.error(error);
  }
};

useEffect(() => {
  if (selectedCategory === "all" && currentPage === 1) {
    setSentListings((prevListings) => {
      return { ...prevListings, all: sent };
    });;
    setReceivedListings((prevListings) => {
      return { ...prevListings, all: received };
    });
    setIsLoading(false);
  }
}, [selectedCategory, sent, received]);

useEffect(() => {
  const selectCategory = async () => {
    // check if data exists
    if ((activeTab === "sent" && sentListings[selectedCategory]) ||
      (activeTab === "received" && receivedListings[selectedCategory])) {
      return;
    }

    const data = await fetchListingsByCategory(selectedCategory, session.user.id, activeTab);

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
}, [selectedCategory, activeTab, sentListings, receivedListings, session.user.id]);

const handlePageChange = async (page: number) => {
  
  const skip = (page - 1) * 5;
  setCurrentPage(page);
  const data = await fetchListingsByCategory(selectedCategory, session.user.id, activeTab, skip, 5);
  console.log(data);
  if (data) {
    if (activeTab === "sent") {
      setSentListings((prevListings) => ({ ...prevListings, [selectedCategory]: data }));
    } else {
      setReceivedListings((prevListings) => ({ ...prevListings, [selectedCategory]: data }));

    }
  }
};

const handleCategoryChange = async (category: string) => {
  setSelectedCategory(category);
  setCurrentPage(1);
};

  return (
    <Dash
      meta={
        <Meta
          title="Make You An Offer You Can't Refuse"
          description="This is the Make You An Offer Web App"
        />
      }
    >
      <div>
        <div className="w-full mx-auto px-4 sm:px-8">
          <div className="pt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold leading-tight mb-2">
                Your Offers {}
              </h2>
              {/* <div className="border border-gray-200 rounded-lg flex mx-4 my-2">
                <input
                  type="text"
                  className="rounded-l-lg px-2"
                  placeholder="search offers"
                />
                <button className="rounded-r-lg p-2 px-3 bg-orange-300 text-white">
                  <FaSearch />
                </button>
              </div> */}
            </div>
            <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 ">
              <div className="flex ">
                <div className="border border-gray-200 w-full flex justify-between bg-gray-100 items-center rounded-t-lg">
                  <div className="flex gap-4  p-4">
                    <div
                      className={`uppercase cursor-pointer font-bold ${
                        activeTab === "sent" && "border-b-4 border-orange-400"
                      }`}
                      onClick={() => {
                        setActiveTab("sent")
                        handleCategoryChange("all")
                      }}
                    >
                      Sent
                    </div>
                    <div
                      className={`uppercase cursor-pointer font-bold items-start flex`}
                      onClick={() => {
                        setActiveTab("received")
                        handleCategoryChange("all")
                    }}
                    >
                      <span
                        className={`${
                          activeTab === "received" &&
                          "border-b-4 border-orange-400"
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
                      <option value="rejected">Rejected</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="inline-block min-w-full border-x border-gray-200">
                {activeTab === "sent" && (
                  <>
                    <div className="">
                      {isLoading ? (
                        "loading"
                      ) : (
                        <div className="min-w-full ">
                          {sentListings[selectedCategory] ? (
                            sentListings[selectedCategory].map(
                              (item: Listing) => {
                                return <Offer key={item.id} {...item} />;
                              }
                            )
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
                  </>
                )}
                {activeTab === "received" && (
                  <>
                  <div className="">
                      {isLoading ? (
                        "loading"
                      ) : (
                        <div className="min-w-full ">
                          {receivedListings[selectedCategory] ? (
                            receivedListings[selectedCategory].map(
                              (item: Listing) => {
                                return <Offer key={item.id} {...item} />;
                              }
                            )
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
                  </>
                )}
              </div>
              <div>
                <Button label="Next" onClick={() => handlePageChange(currentPage + 1)} />
              </div>
            </div>
          </div>
          <div className="flex justify-center h-full gap-2">
            {/* <ul key={activeTab + category} className="flex list-none mb-6 mt-2">
              {Array.from({
                length: Math.ceil(
                  (activeTab === "sent" ? listingsCount : requestsCount) / 5
                ),
              }).map((_, i) => (
                <li key={activeTab + category + i}>
                  <button
                    onClick={() => handlePageChange(i)} 
                    className={`px-4 py-2 rounded-md ${
                      index === i
                        ? "bg-orange-400 text-white"
                        : "bg-orange-100 text-gray-600"
                    }`}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
            </ul> */}
          </div>
        </div>
      </div>
    </Dash>
  );
};

export const getServerSideProps: GetServerSideProps<any> = async (context) => {
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

    const listings = await getOffersByUserId(session, PAGE_SIZE);

    if (!listings) return { props: { sent: [], received: [], session } };

    const sent = listings.sent;
    const received = listings.received;

    return {
      props: {
        sent,
        received,
        session,
      },
    };
  } catch (error) {
    console.error("Error fetching listings:", error);
    return {
      props: {
        received: [],
        sent: [],
      },
    };
  }
};

export default Index;
