import Link from "next/link";
import { Session } from "next-auth";
import ImageSlider from "./ImageSlider";
import {
  CiCalendar,
  CiDeliveryTruck,
  CiLocationOn,
  CiMedicalCross,
  CiSettings,
  CiUser,
  CiWarning,
} from "react-icons/ci";
import PriceWidget from "@/components/widgets/PriceWidget";
import { Bid } from "@prisma/client";
import { Dispatch, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { ErrorResponse } from "@/templates/dash";
import { useSocketContext } from "@/context/SocketContext";
import Spinner from "@/components/Spinner";
import { FaChevronRight } from "react-icons/fa";
import useOfferModal from "@/hooks/useOfferModal";

const formatDate = (date: string | Date, format = "short") => {
  let dateObj;
  if (typeof date === "string") dateObj = new Date(date);
  else dateObj = date;

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const month = dateObj?.toLocaleString("default", { month: "short" });
  const day = dateObj?.getDate();
  const year = dateObj?.getFullYear();
  const dayOfWeek = days[dateObj?.getDay()];
  return `${
    date ? (format === "short" ? dayOfWeek.slice(0, 3) : dayOfWeek) : ""
  }, ${month || ""} ${day || ""}, ${year || ""}`;
};

interface HeaderProps {
  listing: any;
  session: Session;
  status: string;
  currentBid: {
    currentPrice: string | number;
    byUserId: string;
    byUsername: string;
  };
  bids: Bid[];
  setBids: Dispatch<React.SetStateAction<Bid[]>>;
  setCurrentBid: any;
  sessionUser: {
    id: string;
    username: string;
    email: string;
  };
  setStatus: Dispatch<React.SetStateAction<string>>;
  handleAddImages: () => void;
}

const Header = ({
  listing,
  currentBid,
  status,
  session,
  bids,
  setBids,
  setCurrentBid,
  sessionUser,
  setStatus,
  handleAddImages,
}: HeaderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [bid, setBid] = useState<string | null | number>(null);
  const socket = useSocketContext();

  const modal = useOfferModal();

  const updateBid = async (num: number | string | null) => {
    if (num === null) {
      toast.error("Please enter a offer price");
      return;
    }
    if (typeof num === "string") {
      num = parseFloat(num);
    }
    if (num === 0) return;

    if (num === currentBid.currentPrice) {
      toast.error("You can't submit the same price as the current offer!");
      return;
    }

    let data = {
      price: num,
      id: listing.id,
      status: "counterOffer",
    };
    setIsLoading(true);

    try {
      setIsLoading(true);
      const response = await axios.post("/api/submitBid", {
        price: data.price,
        id: data.id,
        userId: session?.user.id,
      });
      const updatedListing: any | ErrorResponse = response.data.listing;
      const transactions: any | ErrorResponse = response.data.transactionResult;

      if ("error" in updatedListing) {
        console.log("Offer not updated:", updatedListing.error);
        toast.error("Offer not updated");
        setIsLoading(false);
      } else {
        const myLastBid = updatedListing.bids.find(
          (bid: any) => bid.userId === session?.user.id
        );

        const userId = sessionUser?.id;
        const username = sessionUser?.username;
        const price = data.price;
        const listingId = listing.id;
        const previous = currentBid.currentPrice;
        const sellerId = listing?.sellerId || "";
        const buyerId = listing?.buyerId || "";

        socket.emit("update_bid", {
          price: num,
          userId,
          username,
          listingId,
          previous,
          buyerId,
          sellerId,
        });

        toast.success("New offer submitted!");
      }
      setIsLoading(false);
      setBid(null);
    } catch (err) {
      console.log("Something went wrong!");
    }
    setIsLoading(false);
  };
  return (
    <div className="flex flex-col justify-between  lg:flex-row py-6 mb-6 bg-white border-x border-b rounded-b">
      <div className="flex flex-col-reverse justify-between pl-5 pr-2 sm:flex-row-reverse lg:w-1/2 lg:flex-row">
        <ImageSlider
          listingType={listing.type}
          images={listing.image}
          handleAddImages={handleAddImages}
        />
      </div>

      <div className="px-5 pt-8 lg:w-1/2 lg:pt-0 flex flex-col">
        <div className="mb-4 pb-4 border-b border-grey-dark">
          <div className="mb-2">
            <div className="flex w-full justify-between items-start">
              <h2 className="font-bold text-2xl  mb-0">{listing.title}</h2>
              {listing?.user?.id === session?.user.id ? (
                <button
                  className="border rounded bg-white"
                  onClick={() => modal.onOpen(session?.user, "", "", listing)}
                >
                  <CiSettings size={22} />
                </button>
              ) : (
                ""
              )}
            </div>
            <div className="flex items-center sm:w-5/6 space-x-2">
              <p className="font-hk text-sm">
                {listing.category || "(no category)"}
              </p>
              {listing?.subcategory && (
                <p className="font-hk text-sm text-gray-400">
                  <FaChevronRight />
                </p>
              )}
              {listing?.subcategory && (
                <p className="font-hk text-sm">{listing?.subcategory}</p>
              )}
            </div>
          </div>

          <div className="flex text-sm">
            <div className="flex gap-2 items-center">
              <CiCalendar />
              <p className="font-hk text-secondary">
                {formatDate(listing.createdAt)}
              </p>
            </div>
            <div className="ml-4 flex gap-2 items-center">
              <CiUser />
              <p className="font-hk text-secondary">
                {listing?.user?.username || "(unknown)"}
              </p>
            </div>
          </div>
        </div>

        <p className="pb-5 font-hk text-sm">{listing.description}</p>

        <div className=" items-center  grid grid-cols-2 gap-4 mb-6 mt-auto">
          <div className=" bg-gray-50 border rounded shadow-sm px-3 py-4 flex items-center flex-col justify-center  text-center">
            <h4>Initial Offer</h4>
            <p className="font-extrabold text-lg mb-0 text-orange-500">
              £
              {listing?.price && listing?.price > 0
                ? listing.price
                : "Open Offer"}
            </p>
            <h6 className="text-sm flex">
              By: {listing?.user?.username || "(unknown user)"}
            </h6>
          </div>
          <div className=" bg-gray-50 border h-full rounded shadow-sm px-3 py-4 flex items-center flex-col justify-start  text-center">
            <h4>Current Offer</h4>
            {currentBid && currentBid?.currentPrice &&  Number(currentBid?.currentPrice) > 0  ? (

            <>
            <p className="font-extrabold text-lg mb-0 text-orange-500">
              £{currentBid.currentPrice}
            </p>
            <h6 className="text-sm flex">By: {currentBid.byUsername}</h6>
            </>
            ) : (
              <>
               <p className="font-extrabold text-lg mb-0 text-orange-500">
              £{listing?.price}
            </p>
              <p className=" text-sm mb-0">
              No counter offers
            </p>
              </>
            )}
          </div>
        </div>
        {(listing?.events &&
          listing?.events.length > 0 &&
          listing?.events[0].event !== "cancelled" &&
          listing?.events[0].event !== "completed" &&
          listing?.events[0].event !== "accepted") ||
          (listing.userId === session?.user.id && (
            <div className="hidden xl:flex justify-between  border rounded p-2 bg-gray-50">
              <div>
                <div className="flex rounded border divide-x bg-gray-50">
                  <span className="p-2 px-3">£</span>
                  <input
                    type="number"
                    disabled={isLoading}
                    className="w-full  px-2"
                    placeholder="0.00"
                    value={bid ? bid : ""}
                    onChange={(e) => setBid(e.target.value)}
                  />
                  {bids.length > 0 ? (
                    <button
                      onClick={() => updateBid(bid)}
                      disabled={isLoading}
                      className="whitespace-nowrap p-2 px-3 text-sm hover:opacity-80 text-white bg-orange-400 rounded-r"
                    >
                      {isLoading ? (
                        <Spinner />
                      ) : currentBid.byUserId === sessionUser?.id ? (
                        "Update Offer"
                      ) : (
                        "Send Offer"
                      )}
                    </button>
                  ) : listing?.user?.id === sessionUser?.id ? (
                    <button
                      disabled={isLoading}
                      onClick={() => updateBid(bid)}
                      className="whitespace-nowrap p-2 px-3 text-sm hover:opacity-80"
                    >
                      {isLoading ? <Spinner /> : "Update Offer"}
                    </button>
                  ) : (
                    <button
                      disabled={isLoading}
                      className="whitespace-nowrap p-2 px-3 text-sm hover:opacity-80"
                    >
                      {isLoading ? (
                        <Spinner />
                      ) : (
                        `Message ${
                          listing?.type === "buyer" ? "Buyer" : "Seller"
                        }`
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  disabled={isLoading}
                  className="p-2 rounded whitespace-nowrap px-4 text-red-500 border hover:opacity-80  "
                >
                  Terminate
                </button>
              </div>
            </div>
          ))}

        {/* <div className="flex items-center justify-between pb-4">
          <div className="w-1/3 sm:w-1/5">
            <p className="font-hk text-secondary">Size</p>
          </div>
          <div className="w-2/3 sm:w-5/6">
            <select className="form-select w-2/3" value={"0"} disabled>
              <option value="0">Small</option>
              <option value="1">Medium</option>
              <option value="2">Large</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between pb-8">
          <div className="w-1/3 sm:w-1/5">
            <p className="font-hk text-secondary">Quantity</p>
          </div>
          <div className="flex w-2/3 sm:w-5/6" x-data="{ productQuantity: 1 }">
            <label
              htmlFor="quantity-form"
              className="relative block h-0 w-0 overflow-hidden"
            >
              Quantity form
            </label>
            <input
              type="number"
              id="quantity-form"
              className="form-quantity form-input w-16 rounded-r-none py-0 px-2 text-center"
              x-model="productQuantity"
              min="1"
              value={1}
              disabled
            />
            
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Header;
