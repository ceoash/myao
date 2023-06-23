import React, { useEffect, useRef, useState } from "react";
import MenuItem from "../MenuItem";
import { BiCross, BiPencil, BiTrash } from "react-icons/bi";
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

const Offer: React.FC<any> = ({
  id,
  title,
  price,
  category,
  image,
  bid,
  status,
  seller,
  sellerId,
  bidder,
}) => {
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [isOffer, setIsOffer] = useState(false);
  const DeleteListing = useDeleteConfirmationModal();
  const { data: session } = useSession();

  const router = useRouter();

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
  return (
    <div className="w-full mt-4 md:mt-0 bg-white rounded-md border border-gray-200 mb-6 md:mb-0">
      <div className="md:px-6 md:py-4 md:flex gap-4">
        <div className="md:aspect-w-16 md:aspect-h-9 flex justify-center">
          <img
            className="object-cover rounded-t-md md:rounded-md object-center h-42 md:h-24 lg:h-24 w-full md:w-64"
            src={image || "/images/cat.png"}
            alt="content"
          />
        </div>
        <div className="w-full  pt-2 pb-2 md:p-0 flex flex-col">
          <div className="w-full flex justify-between flex-grow border-b px-4 md:border-none">
            <div>
              <div className="text-gray-900 text-md md:text-lg mt-1 md:mt-0 title-font font-medium lg:px-0  md:m-0">
                {title}
              </div>
              <h2 className="text-xs mb-0 text-gray-500">
                {category|| "No category"}
              </h2>
            </div>
            <div className="flex justify-between md:block mb-2 pb-2 md:pb-0 md:m-0">
              
              <div>
                {bid && (
                <div className="text-right text-sm">
                  Bid by <span className="underline">{bidder?.username || seller?.username}</span>
                </div>
                )}
                <div className="font-extrabold md:text-2xl text-right">
                  {bid ? bid : price ? `£ ${price}` : <span className="text-sm border-2 border-gray-200 rounded-md bg-white p-2">Open offer</span>}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between flex-grow my-2 px-4">
            <Link href={`/dashboard/profile/${sellerId}`} className="flex items-center gap-2 leading-relaxed text-sm font-medium">
              <div className="w-6">
                <img src={seller?.profile?.image || "/images/placeholders/avatar.png"} className="rounded-full p-[1px] border-2 border-gray-200" />
              </div>
              <div>{seller?.username || "unknown user"}</div>
            </Link>

            <div className="leading-relaxed lg:p-0 flex gap-4 text-sm">
              <Link
                href={`/dashboard/offers/${id}`}
                className="flex gap-2 items-center"
              >
                <AiOutlineEye />
                View
              </Link>
              {session?.user?.id === sellerId && (
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
                  gap-2
                  items-center
                `}
                  >
                    <span>
                      <BiPencil />
                    </span>
                    Edit
                  </button>
                  <button
                    onClick={() => DeleteListing.onOpen(id)}
                    className={`
                  w-full
                  focus:ring-4 
                  focus:outline-none 
                  focus:ring-primary-300 
                  font-medium 
                  rounded-lg 
                  text-center
                  flex
                  gap-2
                  items-center
                `}
                  >
                    <span>
                      <BiTrash />
                    </span>
                    Delete
                  </button>
                </>
              )}
              {session?.user?.id !== sellerId &&
                status !== "rejected" &&
                status !== "accepted" && (
                  <button className="flex gap-1 items-center text-red-500">
                    <IoClose />
                    Reject
                  </button>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offer;
