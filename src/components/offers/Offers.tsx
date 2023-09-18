import { useEffect, useRef, useState } from "react";
import { DashListing } from "@/interfaces/authenticated";
import axios from "axios";
import Offer from "./Offer";
import Button from "../dashboard/Button";
import OfferSkeleton from "./OfferSkeleton";
import { useSocketContext } from "@/context/SocketContext";
import { BiFilterAlt } from "react-icons/bi";
import { Listing } from "@prisma/client";
import useOfferModal from "@/hooks/useOfferModal";

type CountState = {
  countSent: number;
  countReceived: number;
  countPendingSent: number;
  countPendingReceived: number;
};

interface OffersProps {
  offers: any;
  session: any;
  multipage?: boolean;
  countSent: number;
  countReceived: number;
  countPendingSent: number;
  countPendingReceived: number;
  defaultTab?: string;
  blockedIds?: string[];
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

interface OffersState {
  all: DashListing[];
  awaiting: DashListing[];
  negotiating: DashListing[];
  accepted: DashListing[];
  completed: DashListing[];
  rejected: DashListing[];
  cancelled: DashListing[];
}

const Offers = ({
  offers,
  session,
  multipage,
  countSent,
  countReceived,
  countPendingReceived,
  countPendingSent,
  defaultTab,
  blockedIds,
  setCount,
}: OffersProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [allOffers, setAllOffers] = useState<Listing[]>([]);
  const [categorisedOffers, setCategorisedOffers] = useState<
    Record<string, DashListing[]>
  >({});
  const [selectedCategory, setSelectedCategory] = useState("negotiating");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [skip, setSkip] = useState(5);
  const [isMounted, setIsMounted] = useState(false);
  const create = useOfferModal();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = (e: any) => {
    if (ref.current && !ref.current.contains(e.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    setAllOffers(offers);
    setCategorisedOffers((prev) => {
      return { ...prev, all: offers };
    });

    setIsLoading(false);
  }, [offers, isMounted]);

  const fetchListingsByCategory = async (
    category: string,
    userId: string,
    skip = 0,
    PAGE_SIZE = 5
  ) => {
    setIsLoading(true);
    if (category === "all") {
      setIsLoading(false);
      return;
    }
    const url = `/api/dashboard/listingsByCategory`;
    try {
      const response = await axios.post(url, {
        category,
        userId,
        skip,
        PAGE_SIZE,
      });
      setIsLoading(false);
      return response.data.listings;
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const selectCategory = async () => {
      setIsLoading(true);

      const data = await fetchListingsByCategory(
        selectedCategory,
        session?.user.id
      );

      if (data) {
        setCategorisedOffers((prev) => {
          return { ...prev, [selectedCategory]: data };
        });
      }
    };
    selectCategory();
    setIsLoading(false);
  }, [selectedCategory]);

  const handlePageChange = async (page: number) => {
    setIsLoading(true);
    setCurrentPage(page);

    const skip = page * 5 - 5;

    const data = await fetchListingsByCategory(
      selectedCategory,
      session?.user.id,
      skip,
      5
    );

    if (data) {
      setCategorisedOffers((prev) => {
        return { ...prev, [selectedCategory]: data };
      });
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


      if (session?.user.id !== listing.userId) {
        setAllOffers((prevListings: any) => {
          return [listing, ...prevListings];
        });

        setCategorisedOffers((prevListings: any) => {
          return {
            ...prevListings,
            [listing.status]: [listing, ...prevListings[listing.status]],
          };
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
        console.log("count sent", countSent);
      }

      if (session?.user.id === listing.userId) {
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
        <div className="relative w-full flex justify-between  items-center rounded-t-lg">
          <>
            <div className="flex pb-4 gap-2">
              <div
                className={`uppercase cursor-pointer font-bold rounded-lg border border-gray-200 bg-white p-3 py-1 ${
                  selectedCategory === "negotiating" &&
                  "border !bg-orange-default border-orange-200 text-white"
                }`}
                onClick={() => {
                  selectedCategory !== "negotiating" &&
                    setSelectedCategory("negotiating");
                }}
              >
                HAGGLING
              </div>
              <div
                className={`uppercase cursor-pointer font-bold items-start flex`}
                onClick={() => {
                  selectedCategory !== "awaiting approval" &&
                    setSelectedCategory("awaiting approval");
                }}
              >
                <span
                  className={`uppercase cursor-pointer font-bold rounded-lg border border-gray-200 bg-white p-3 py-1 ${
                    selectedCategory === "awaiting approval" &&
                    "border !bg-orange-default border-orange-200 text-white"
                  }`}
                >
                  AWAITING
                </span>

                {/* {allRequests.length > 0 && (
                  <span className="bg-orange-200 rounded-full px-2 text-orange-500 text-xs ml-1 lowercase">
                    {allRequests.length} new
                  </span>
                )} */}
              </div>
            </div>
            <div className="">
              <button
                id="dropdownDefaultButton"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                type="button"
              >
                <BiFilterAlt className="text-gray-500 mx-2 " />
              </button>
              {dropdownOpen && (
                <div
                ref={ref}
                  id="dropdown"
                  className="absolute z-10 right-0 bg-white divide-y divide-gray-100 rounded-lg shadow w-auto"
                >
                  <ul
                    className="py-2 text-sm text-gray-700"
                    aria-labelledby="dropdownDefaultButton"
                  >
                    <li onClick={() => handleCategoryChange("accepted")}>
                      <div className="block px-4 py-2 hover:bg-gray-50">
                        Awaiting
                      </div>
                    </li>
                    <li onClick={() => handleCategoryChange("completed")}>
                      <div className="block px-4 py-2 hover:bg-gray-50">
                        Paid
                      </div>
                    </li>
                    <li onClick={() => handleCategoryChange("rejected")}>
                      <div className="block px-4 py-2 hover:bg-gray-50">
                        Rejected
                      </div>
                    </li>
                    <li onClick={() => handleCategoryChange("cancelled")}>
                      <div className="block px-4 py-2 hover:bg-gray-50">
                        Cancelled
                      </div>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* <div className="border border-gray-200 rounded-lg bg-gray-100 flex items-center  mb-4 -mt-1">
              <BiFilterAlt className="text-gray-500 mx-2 border-r border-gray-200" />
              <select
                key={selectedCategory}
                value={selectedCategory}
                defaultValue={"Filter"}
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
                className="w-6 px-2 py-2 rounded-r-lg bg-white"
              >
                <option selected>Filter</option>
                <option value="accepted">Awaiting Payment</option>
                <option value="completed">Paid</option>
                <option value="rejected">Declined</option>
                <option value="cancelled">Terminated</option>
              </select>
            </div> */}
          </>
        </div>
      </div>
      <div className="flex flex-col min-w-full rounded-lg pt-2">
        <>
          <div className="transition-all ease-in-out duration-200">
            {isLoading ? (
              [
                ...Array(
                  (categorisedOffers[selectedCategory] &&
                    categorisedOffers[selectedCategory].length) ||
                    0
                ),
              ].map((_, index) => <OfferSkeleton key={index} />)
            ) : (
              <div className="min-w-full transition-all ease-in-out duration-200">
                {categorisedOffers[selectedCategory] &&
                categorisedOffers[selectedCategory].length > 0 ? (
                  categorisedOffers[selectedCategory].map((item: Listing) => {
                    return <Offer key={item.id} {...item} />;
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center rounded-xl bg-white  border border-gray-200 py-16 mb-6 ">
                    <div className="text-gray-700 text-lg font-bold  mx-4 mb-4 text-center">
                      No offers to display{" "}
                      <p className="text-gray-700 text-sm mt-2 font-normal mb-3">
                        Connect and create a offer to get started
                      </p>
                    </div>
                    <Button label="Get started" onClick={create.onOpen} />
                  </div>
                )}
              </div>
            )}
          </div>
          {multipage && countSent + countReceived > 0 && (
            <div className="flex" key={selectedCategory}>
              {categorisedOffers[selectedCategory] && (
                <div className="flex gap-2">
                  {Array.from({ length: countSent / 5 + 1 }).map((_, index) => (
                    <Button
                      key={index}
                      label={`${index + 1}`}
                      onClick={() => handlePageChange(index + 1)}
                      secondary={currentPage === index + 1}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>

        {/* {activeTab === "sent" && (
          <>
            <div className="transition-all ease-in-out duration-200">
              {isLoading ? (
                [
                  ...Array(
                    (sentListings[selectedCategory] &&
                      sentListings[selectedCategory].length) ||
                      0
                  ),
                ].map((_, index) => <OfferSkeleton key={index} />)
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
                      <Button label="Get started" onClick={create.onOpen} />
                    </div>
                  )}
                </div>
              )}
            </div>
            {multipage && countSent > 0 && (
              <div className="flex" key={activeTab + selectedCategory}>
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
                [
                  ...Array(
                    (receivedListings[selectedCategory] &&
                      receivedListings[selectedCategory].length) ||
                      0
                  ),
                ].map((_, index) => <OfferSkeleton key={index} />)
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

                      <Button label="Get started" onClick={create.onOpen} />
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
        )} */}
      </div>
    </div>
  );
};

export default Offers;
