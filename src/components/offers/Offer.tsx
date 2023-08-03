import React, { useEffect, useRef, useState } from "react";
import {
  BiCalendar,
 
} from "react-icons/bi";

import Link from "next/link";

import { useRouter } from "next/navigation";
import axios from "axios";
import StatusChecker from "@/utils/status";
import { useSession } from "next-auth/react";
import {
  FaEye,
  FaPencilAlt,
  FaTimes,
  FaUser,
} from "react-icons/fa";
import { timeInterval } from "@/utils/formatTime";
import { ImPriceTag, ImUser } from "react-icons/im";
import Image from "next/image";
import { toast } from "react-hot-toast";
import useConfirmationModal from "@/hooks/useConfirmationModal";

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
  socketRef,
  status,
  userId
}) => {
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [isOffer, setIsOffer] = useState(false);
  const { data: session } = useSession();
  const [timeSinceCreated, setTimeSinceCreated] = useState<string | null>(null);
  let img = []
  if (image){
    img = JSON.parse(image)
  }

  useEffect(() => {
    const created = new Date(createdAt);
    timeInterval(created, setTimeSinceCreated);
  }, [createdAt]);

  const router = useRouter();
  const [statusState, setStatusState] = useState("");

  useEffect(() => {
    setStatusState(status);
  }, []);

  const confirmation = useConfirmationModal()

  const formatStatus = (status: string) => {
    switch (status) {
      case "pending":
        return "carry on";
        break
      case "accepted":
        return "accept";
        break;
      case "rejected":
        return "reject";
        break;
      case "cancelled":
        return "cancel";
        break;
      case "completed":
        return "accept";
        break;
      default:
        return "pending";
        break
    }
  };

  const formattedStatus = statusState;

  const handleStatusChange = async (status: string, userId: string) => {
    confirmation.onOpen(`Are you sure you want to ${formatStatus(status)} this offer?`, async () => {
      await axios
      .put(`/api/updateListing/status`, {
        status: status,
        listingId: id,
        userId: userId,
      })
      .then((response) => {
        toast.success("Offer" + " " + response.data.listing.status);
        setStatusState(response.data.listing.status);

        socketRef.current?.emit("update_status", {
          newStatus: response.data.listing.status,
          listingId: id,
        });
        // console.log("response", response.data);
        socketRef.current?.emit(
          "update_activities",
          response.data.transactionResult,
          response.data.listing.sellerId,
          response.data.listing.buyerId
        );
      })
      .catch((err) => {
        console.log("Something went wrong!");
      })
      .finally(() => {});
    })
  };

  const handleClickOutside = (e: any) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setIsOffer(false);
    }
  };

  const handleEditListing = () => {
    router.push(`/dashboard/editListing/${id}`);
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

  const owner = buyerId === userId ? buyer : seller;
  return (
    <div className="w-full md:mt-0 bg-white py-1  border border-t-0  border-gray-200  md:mb-0">
      
      <div className="md:py-4 md:flex md:gap-4 xl:gap-6">
          <Link href={`/dashboard/offers/${id}`} className="w-1/5">
            <div className="relative w-full h-full md:ml-4 aspect-square border border-gray-200 rounded-lg bg-gray-50">
              <Image
                src={img[0] || "/images/cat.png"}
                alt="content"
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
                objectPosition="middle"
              />
            </div>
          </Link>
        <div className="w-full  pt-2 pb-2 md:p-0 flex flex-col">
          <div className="w-full flex justify-between flex-grow border-b px-4 md:border-none">
            <div>
              <Link
                href={`/dashboard/offers/${id}`}
                className=" text-gray-900 text-md md:text-lg lg:text-xl xl:text-xl mt-1 md:mt-0 title-font font-medium lg:px-0  md:m-0 xl:-mt-4"
              >
                <div className="mt-2 first-letter:uppercase truncate ... xl:-mt-2">
                  {title}
                </div>
              </Link>
              <div>
                <h2 className="text-sm mb-0 text-gray-500">
                  {category || "No category"}
                </h2>
              </div>
            </div>
            <div className="flex justify-between md:block mb-2 pb-2 md:pb-0 md:m-0">
              <div>
                <div className="text-right text-sm pt-2 lg:pt-0">
                  {bids && bids.length > 0 ? "Bid by " : price !== "0" && price !== '' ? "Starting price by " : "Open offer by "}
                  <span className="underline">
                    {bids && bids.length > 0 && bids[bids.length - 1].userId === sellerId ? seller?.username : userId === sellerId ? seller?.username : buyer?.username }
                  </span>
                </div>

                <div className="font-extrabold md:text-2xl text-right">
                  {bids && bids.length > 0 ? (
                    `£ ${bids[0].price}`
                  ) : price &&  price !== "0"  ? (
                    `£ ${price}`
                  ) : session?.user?.id === userId ? <h4 className="text-sm md:text-lg xl:text-xl">Awaiting offer</h4> : <h4 className="text-sm md:text-lg xl:text-xl">Make a offer</h4>}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-grow my-2 px-4 justify-between  items-end">
            <div className="flex justify-between items-end md:gap-6">
              <Link
                href={`/dashboard/profile/${
                  sellerId === session?.user.id ? buyerId : sellerId
                } `}
              >
                <div className=" gap-2 items-center text-sm hidden md:flex">
                  <FaUser />
                  <div>
                    {seller.id === session?.user.id
                      ? buyer?.username
                      : seller?.username || "unknown user"}
                  </div>
                </div>
              </Link>
              <div className=" items-center gap-2 text-sm hidden md:flex">
                <ImPriceTag />
                <span>{type === "sellerOffer" ? "Sale" : "Buy"}</span>
              </div>
              <div className=" items-center gap-2 text-sm hidden lg:flex">
                <span>{StatusChecker(statusState)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BiCalendar />
                <span>{timeSinceCreated}</span>
              </div>
            </div>
            <div className="leading-relaxed lg:p-0 flex gap-2 text-sm ml-auto">
              <Link
                href={`/dashboard/offers/${id}`}
                className="flex gap-2 items-center text-md border border-gray-400 rounded-md px-2 bg-gray-100"
              >
                <FaEye />
                <span className="hidden xl:block">View</span>
              </Link>
              {session?.user?.id === userId &&
                statusState !== "rejected" &&
                statusState !== "completed" &&
                statusState !== "cancelled" && (
                  <>
                    <button
                      onClick={handleEditListing}
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
                      border-gray-400
                      px-2 
                      bg-gray-100
                    `}
                    >
                      <span>
                        <FaPencilAlt />
                      </span>
                      <span className="hidden xl:block">Edit</span>
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
                    border-red-400 
                    rounded-md 
                    px-2 
                    text-red-500"
                    >
                      <FaTimes />
                      <span className="hidden xl:block">Cancel</span>
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
