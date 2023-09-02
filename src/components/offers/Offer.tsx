import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import StatusChecker from "@/utils/status";
import { timeInterval } from "@/utils/formatTime";
import { FaEye, FaPencilAlt, FaTimes, FaUser } from "react-icons/fa";
import { BiCalendar } from "react-icons/bi";
import { ImPriceTag } from "react-icons/im";
import { toast } from "react-hot-toast";
import { Bid, Listing } from "@prisma/client";

import useConfirmationModal from "@/hooks/useConfirmationModal";
import { IUser } from "@/interfaces/authenticated";
import { useSocketContext } from "@/context/SocketContext";
import useOfferEditModal from "@/hooks/useOfferEditModal";

interface OfferProps extends Listing {
  seller?: IUser;
  buyer?: IUser;
  bids?: Bid[];
}

const Offer: React.FC<any> = ({
  id,
  title,
  price,
  category,
  image,
  seller,
  sellerId,
  bids,
  buyer,
  buyerId,
  type,
  createdAt,
  status,
  userId,
  activity,
  completedById,
  description,
  expireAt,
  options,
  updatedAt,
  user,
}) => {
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [isOffer, setIsOffer] = useState(false);
  const { data: session } = useSession();
  const [timeSinceCreated, setTimeSinceCreated] = useState<string | null>(null);
  let img = [];
  if (image) {
    img = JSON.parse(image);
  }

  const socket = useSocketContext();

  useEffect(() => {
    const created = new Date(createdAt);
    timeInterval(created, setTimeSinceCreated);
  }, [createdAt]);

  const router = useRouter();
  const [statusState, setStatusState] = useState("");

  useEffect(() => {
    setStatusState(status || "");
  }, [status]);

  const edit = useOfferEditModal();

  const confirmation = useConfirmationModal();

  const formatStatus = (status: string) => {
    switch (status) {
      case "pending":
        return "carry on";
      case "accepted":
        return "accept";
      case "rejected":
        return "reject";
      case "cancelled":
        return "cancel";
      case "completed":
        return "complete";
      default:
        return "pending";
    }
  };

  const handleStatusChange = async (status: string, userId: string) => {
    const formattedStatus = formatStatus(status);
    confirmation.onOpen(
      `Are you sure you want to ${formattedStatus} this offer?`,
      async () => {
        await axios
          .put(`/api/updateListing/status`, {
            status: status,
            listingId: id,
            userId: userId,
          })
          .then((response) => {
            socket.emit("update_status", {
              newStatus: response.data.listing.status,
              listingId: id,
            });
            socket.emit(
              "update_activities",
              response.data.transactionResult,
              response.data.listing.sellerId,
              response.data.listing.buyerId
            );
            setStatusState(response.data.listing.status);
            toast.success("Offer" + " " + response.data.listing.status);
          })
          .catch((err) => {
            console.log("Something went wrong!");
          });
      }
    );
  };

  const handleClickOutside = (e: any) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setIsOffer(false);
    }
  };

  useEffect(() => {
    if (isOffer) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOffer]);

  const custom = {
    bids: bids,
    buyer: {
      id: buyerId,
      username: buyer.username,
      profile:
        {
          image: buyer?.profile?.image || "",
        } || null,
    },
    buyerId: buyerId,
    category: category,
    completedById: completedById,
    createdAt: createdAt,
    description: description,
    expireAt: expireAt,
    id: id,
    image: image,
    messages: [],
    options: {
      location: {
        city: options?.locoation?.city || "",
        region: options?.locoation?.city || "" || null,
      },
      condition: options?.condition || "",
      pickup: options?.pickup,
      public: false,
    },
    price: price,
    reviews: [],
    seller: {
      id: sellerId,
      username: seller.usernamw,
      profile:
        {
          image: seller?.profile?.image || "",
        } || null,
    },
    sellerId: sellerId,
    status: status,
    title: title,
    type: type,
    updatedAt: updatedAt,
    user: {
      id: userId,
      username: user?.username,
    },
    userId: userId,
  };

  return (
    <div className="w-full border bg-white  border-gray-200 rounded-lg  mb-6  hover:bg-gray-50 transition-all ease-in-out">
      <div className="md:py-4 md:flex md:gap-4 xl:gap-6">
        <Link
          href={`/dashboard/offers/${id}`}
          className="w-1/5 overflow-clip rounded-lg md:ml-4"
        >
          <div
            className="
              relative
              w-full
              h-full
              aspect-square
              border
              border-gray-200
              rounded-lg
              bg-gray-50
              transition-transform
              duration-500
              transform
              ease-in-out
              hover:md:scale-110
            "
          >
            <div className=" block md:hidden absolute top-4 left-4 z-10 items-center text-xs xl:text-sm">
                {StatusChecker(statusState)}
              </div>
            <div className="absolute inset-0 bg-black hover:bg-white opacity-10"></div>
            <Image
              src={img[0] || "/images/cat.png"}
              alt="content"
              layout="fill"
              objectFit="cover"
              className="rounded-lg "
              objectPosition="middle"
            />
          </div>
        </Link>
        <div className="w-full pt-2 pb-2 md:p-0 flex flex-col">
          <div className="w-full flex justify-between flex-grow border-b px-4 md:border-none">
            <div>
              <Link
                href={`/dashboard/offers/${id}`}
                className="
                  text-gray-900
                  text-md
                  md:text-lg
                  lg:text-xl
                  xl:text-2xl
                  mt-1
                  md:mt-0
                  title-font
                  font-medium
                  lg:px-0
                  md:m-0
                  xl:-mt-4"
              >
                <div className=" first-letter:uppercase truncate xl:-mt-2">
                  {title}
                </div>
              </Link>
              <div>
                <h2 className="text-sm mb-0 text-gray-500">
                  {category || "No category"}
                </h2>
              </div>
            </div>
            <div className="flex justify-between md:block -mt-2 mb-2 pb-2 md:pb-0 md:m-0">
              <div>
                <div className="text-right text-xs md:text-sm pt-2 lg:pt-0">
                  {bids && bids.length > 0
                    ? "Bid by "
                    : price !== "0" && price !== ""
                    ? "Starting price by "
                    : "Open offer by "}
                  <span className="underline">
                    {bids &&
                    bids.length > 0 &&
                    bids[bids.length - 1].userId === sellerId
                      ? seller?.username
                      : userId === sellerId
                      ? seller?.username
                      : buyer?.username}
                  </span>
                </div>
                <div className="font-extrabold md:text-2xl text-right">
                  {bids && bids.length > 0 ? (
                    `£${Number(bids[0].price).toLocaleString()}`
                  ) : price && price !== "0" ? (
                    `£${Number(price).toLocaleString()}`
                  ) : session?.user?.id === userId ? (
                    status === "cancelled" ? (
                      "£0.00"
                    ) : (
                      <h4 className="text-sm md:text-lg xl:text-xl">
                        Awaiting offer
                      </h4>
                    )
                  ) : status === "cancelled" ? (
                    "£0.00"
                  ) : (
                    <h4 className="text-sm md:text-lg xl:text-xl">
                      Make a offer
                    </h4>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-grow my-2 px-4 justify-between  items-end text-xs">
            <div className="flex gap-4 justify-between items-end md:gap-6">
              <div className=" hidden md:block items-center text-xs xl:text-sm">
                {StatusChecker(statusState)}
              </div>
              <Link
                href={`/dashboard/profile/${
                  sellerId === session?.user.id ? buyerId : sellerId
                } `}
              >
                <div className=" gap-1.5 items-center text-xs xl:text-sm flex">
                  <FaUser />
                  <div>
                    {seller.id === session?.user.id
                      ? buyer?.username
                      : seller?.username || "unknown user"}
                  </div>
                </div>
              </Link>
              <div className=" items-center gap-1.5 text-xs xl:text-sm hidden 2xl:flex">
                <ImPriceTag />
                <span>{type === "sellerOffer" ? "Sale" : "Buy"}</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs xl:text-sm">
                <BiCalendar />
                <span>{timeSinceCreated}</span>
              </div>
            </div>
            <div className="leading-relaxed lg:p-0 flex gap-1.5 text-sm ml-auto">
              <Link
                href={`/dashboard/offers/${id}`}
                className="
                  flex
                  gap-2
                  items-center
                  text-md
                  border
                  border-gray-200
                  rounded-md
                  px-2
                  bg-gray-100
                "
              >
                <FaEye />
                <span className="hidden 2xl:block">View</span>
              </Link>

              {session?.user?.id === userId &&
                statusState !== "rejected" &&
                statusState !== "completed" &&
                statusState !== "accepted" &&
                statusState !== "cancelled" && (
                  <>
                    <button
                      onClick={() =>
                        edit.onOpen(session?.user?.id, custom, "default", {})
                      }
                      className={`
                        w-full
                        focus:ring-4 
                        focus:outline-none 
                        focus:ring-primary-300 
                        font-medium 
                        rounded-lg 
                        text-center
                        flex
                        p-1
                        gap-2
                        items-center
                        text-md border 
                        border-gray-200
                        px-2 
                        bg-gray-100
                      `}
                    >
                      <span>
                        <FaPencilAlt />
                      </span>
                      <span className="hidden 2xl:block">Edit</span>
                    </button>

                    <button
                      onClick={() =>
                        handleStatusChange("cancelled", session?.user.id)
                      }
                      className="
                        flex
                        p-1 
                        gap-1 
                        items-center 
                        border
                        border-red-200 
                        bg-red-100
                        rounded-md 
                        px-2 
                        text-red-500"
                    >
                      <FaTimes />
                      <span className="hidden 2xl:block">Cancel</span>
                    </button>
                  </>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offer;
