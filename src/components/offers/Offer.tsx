import React, { useEffect, useRef, useState } from "react";
import MenuItem from "../MenuItem";
import {
  BiCalendar,
  BiCategory,
  BiCross,
  BiPencil,
  BiTrash,
  BiUser,
} from "react-icons/bi";
import { AiOutlineEye } from "react-icons/ai";
import { Listing } from "@prisma/client";
import Link from "next/link";

import { useRouter } from "next/navigation";
import Button from "../Button";
import axios from "axios";
import StatusChecker from "@/utils/status";
import useDeleteConfirmationModal from "@/hooks/useDeleteConfirmationModal";
import { useSession } from "next-auth/react";
import { IoClose } from "react-icons/io5";
import {
  FaEdit,
  FaEye,
  FaPencilAlt,
  FaTimes,
  FaTrash,
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
  const DeleteListing = useDeleteConfirmationModal();
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
      case "accepted":
        return "accept";
      case "rejected":
        return "reject";
      case "cancelled":
        return "cancel";
      case "completed":
        return "accept";
      default:
        return "pending";
    }
  };

  const formattedStatus = statusState;

  const handleStatusChange = async (status: string, userId: string) => {
    confirmation.onOpen(`Are you sure you want to ${formatStatus(status)} this offer?`,async () => {
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
            <div className="relative w-full h-full ml-4 mr-2">
              <Image
                src={img[0] || "/images/cat.png"}
                alt="content"
                layout="responsive"
                width={500}
                height={500}
                className="rounded-lg"
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
                <div className="text-right text-sm">
                  {bids && bids.length > 0 ? "Bid by " : price !== "0" ? "Starting price by " : "Offer by "}
                  <span className="underline">
                    {bids && bids.length > 0 && bids[bids.length - 1].userId === sellerId ? seller?.username : userId === sellerId ? seller?.username : buyer?.username }
                  </span>
                </div>

                <div className="font-extrabold md:text-2xl text-right">
                  {bids && bids.length > 0 ? (
                    `£ ${bids[0].price}`
                  ) : price &&  price !== "0"  ? (
                    `£ ${price}`
                  ) : (
                    <span className="text-sm ">
                      Open offer
                    </span>
                  )}
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
