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
import toast from "react-hot-toast";

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
  haggling: DashListing[];
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
  const [selectedCategory, setSelectedCategory] = useState("haggling");
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

  const orderOffers = async ({
    status,
    userId,
    from,
    to,
    listingId,
    buyerId,
    sellerId,
    userType,
  }: {
    status: string;
    userId: string;
    from: string;
    to: string;
    listingId: string;
    buyerId: string;
    sellerId: string;
    userType: string;
  }) => {
    let params = new URLSearchParams();

    if (status) params.append("status", status);
    if (userId) params.append("userId", userId);
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    if (listingId) params.append("listingId", listingId);
    if (buyerId) params.append("buyerId", buyerId);
    if (sellerId) params.append("sellerId", sellerId);
    if (userType) params.append("userType", userType);

    const url = `/api/dashboard/filterListings?${params.toString()}`;

    try {
      const ordered = await axios.get(url);
    } catch (error) {
      toast.error("Failed to order offers");
    }
  };
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

        /* setCategorisedOffers((prevListings: any) => {
          return {
            ...prevListings,
            [listing.status]: [listing, ...prevListings[listing?.status]],
          };
        }); */

        if (setCount)
          setCount((prevCount: any) => {
            const newCount = {
              ...prevCount,
              countReceived: countReceived + 1,
              countPendingReceived: countPendingReceived + 1,
            };
            return newCount;
          });
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

    socket.on("updated_bid", (data) => {
      const { price, userId, username, listingId, previous } = data;

      setAllOffers((prev: any) => {
        if(prev && prev.length == 0) return;
        return prev.map((offer: any) => {
          if (offer.id === listingId) {
            const newBid = {
              price: price,
              userId: userId,
              previous: previous,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            return {
              ...offer,
              bids: [newBid],
            };
          }
          return offer;
        });
      });
       

      setCategorisedOffers((prev: any) => {
        const categories = [
          "all",
          "rejected",
          "haggling",
          "awaiting",
          "cancelled",
          "accepted",
        ];

        categories.forEach((category) => {
          if (prev?.[category] && prev?.[category].length > 0) {
            prev[category] = prev[category].map((offer: any, i: number) => {
              if (offer.id === listingId) {
                const newBid = {
                  id: i.toString(),
                  price: price,
                  userId: userId,
                  listingId: listingId,
                  previous: previous,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                };

                // For 'all' and 'rejected', the new bid is added at the beginning
                const bidsOrder =
                  category === "all" || category === "rejected"
                    ? [newBid, ...offer.bids]
                    : [newBid, ...offer.bids];

                return {
                  ...offer,
                  bids: bidsOrder,
                };
              }
              return offer;
            });
          }
        });

        return prev;
      });
    });

    return () => {
      socket.off("new_listing");
      socket.off("updated_bid");
    };
  }, [session?.user.id]);

  return (
    <div className="-mx-4 sm:-mx-8 px-4 sm:px-8  rounded-lg mb-4">
      <div className="flex ">
        <div className="relative w-full flex justify-between  items-center rounded-t-lg">
          <>
            <div className="flex pb-4 gap-2">
              <div
                className={`uppercase cursor-pointer font-bold rounded-lg border text-[12px] border-gray-200 bg-white p-3 py-1 ${
                  selectedCategory === "haggling" &&
                  "border !bg-orange-default border-orange-200 text-white"
                }`}
                onClick={() => {
                  selectedCategory !== "haggling" &&
                    setSelectedCategory("haggling");
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
                  className={`uppercase cursor-pointer font-bold rounded-lg border text-[12px] border-gray-200 bg-white p-3 py-1 ${
                    selectedCategory === "awaiting approval" &&
                    "border !bg-orange-default border-orange-200 text-white"
                  }`}
                >
                  WAITING
                </span>
              </div>
              <div
                className={`uppercase cursor-pointer font-bold items-start flex`}
                onClick={() => {
                  selectedCategory !== "accepted" &&
                    setSelectedCategory("accepted");
                }}
              >
                <span
                  className={`uppercase cursor-pointer font-bold rounded-lg border text-[12px] border-gray-200 bg-white p-3 py-1 ${
                    selectedCategory === "accepted" &&
                    "border !bg-orange-default border-orange-200 text-white"
                  }`}
                >
                  Accepted
                </span>

                {/* {allRequests.length > 0 && (
                  <span className="bg-orange-200 rounded-full px-2 text-orange-500 text-xs ml-1 lowercase">
                    {allRequests.length} new
                  </span>
                )} */}
              </div>
              
            </div>
            <div className="hidden md:block">
              <button
                id="dropdownDefaultButton"
                className={`uppercase cursor-pointer font-bold rounded-lg border text-[12px] border-gray-200 bg-white p-1 py-1`}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                type="button"
              >
                <BiFilterAlt size={16} className="text-gray-500 mx-2 " />
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
                    <li onClick={() => {}}>
                      <div className="block px-4 py-2 hover:bg-gray-50">
                        Most Recent
                      </div>
                    </li>
                    <li onClick={() => {}}>
                      <div className="block px-4 py-2 hover:bg-gray-50">
                        Oldest
                      </div>
                    </li>
                    <li onClick={() => {}}>
                      <div className="block px-4 py-2 hover:bg-gray-50">
                        Higest Price
                      </div>
                    </li>
                    <li onClick={() => {}}>
                      <div className="block px-4 py-2 hover:bg-gray-50">
                        Lowest Price
                      </div>
                    </li>
                  </ul>
                </div>
              )}
            </div>
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
                  categorisedOffers[selectedCategory].map((item: DashListing) => {
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
          
        </>

        
      </div>
    </div>
  );
};

export default Offers;
