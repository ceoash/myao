import { Bid, Listing, Profile, User } from "@prisma/client";
import Link from "next/link";
import Button from "../Button";
import PriceWidget from "@/components/widgets/PriceWidget";
import StatusChecker from "@/utils/status";
import { BiCalendar, BiCategoryAlt } from "react-icons/bi";
import { color } from "html2canvas/dist/types/css/types/color";
import { FaThumbsUp } from "react-icons/fa";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Socket } from "socket.io-client";

interface SafeUser extends User {
  profile: Profile;
}

interface SafeListing extends Listing {
  seller: SafeUser;
  buyer: SafeUser;
}

interface ICurrentBid {
  currentPrice: string;
}

interface OfferDetailsWidgetProps {
  listing: SafeListing;
  status: string;
  session: any;
  timeSinceCreated: string | null;
  bids: any;
  me: any;
  participant: any;
  socketRef: React.MutableRefObject<Socket | undefined>;
  completedBy: string | null | undefined;
  setCompletedBy: Dispatch<SetStateAction<string | null | undefined>>;
  handleStatusChange: (status: string, userId: string) => void;
  setCurrentBid: Dispatch<
    SetStateAction<{
      currentPrice: string;
      byUserId: string;
      byUsername: string;
      me: Bid;
      participant: Bid;
    }>
  >;
  currentBid: any;
  setBids: Dispatch<SetStateAction<Bid[]>>;
}
const OfferDetailsWidget = ({
  listing,
  status,
  session,
  timeSinceCreated,
  handleStatusChange,
  currentBid,
  setCurrentBid,
  setBids,
  me,
  participant,
  bids,
  socketRef,
}: OfferDetailsWidgetProps) => {
  const [meLastBid, setMeLastBid] = useState<any>();
  const [participantLastBid, setParticipantLastBid] = useState<any>();
  const [mostRecentBid, setMostRecentBid] = useState<any>();
  const [completedBy, setcompletedBy] = useState<string | null>("");

  console.log(meLastBid)
  console.log(participantLastBid)

  useEffect(() => {
    if (!session || !session.user?.id) {
      return;
    }
    const reversedBids = [...bids].reverse();
    const meLast = reversedBids.filter(
      (bid: Bid) => bid.userId === session?.user.id
    )[0];
    const participantLast = reversedBids.filter(
      (bid: Bid) => bid.userId !== session?.user.id
    )[0];

    setMeLastBid(meLast);
    setParticipantLastBid(participantLast);

    if (meLast && participantLast) {
      setMostRecentBid(
        new Date(meLast.createdAt) > new Date(participantLast.createdAt)
          ? meLast
          : participantLast
      );
    } else if (meLast) {
      setMostRecentBid(meLast);
    } else if (participantLast) {
      setMostRecentBid(participantLast);
    }
  }, [bids, session?.user?.id])

  useEffect(() => {

    if (status === "rejected") {
      setcompletedBy(listing.completedById);
    }

    
  }, [currentBid]);

  let parsedImage;

 const sessionUser  = listing.sellerId === session?.user.id  ? listing.seller : listing.buyer
 const nonSessionUser  = listing.sellerId === session?.user.id  ? listing.buyer : listing.seller


  if (listing?.image) {
    parsedImage = JSON.parse(listing?.image || "");
  }
  return (
    <div
      className={`
    w-full
    border
    shadow
    p-4
    rounded-lg
    ${status === "accepted" && "bg-orange-100 border-orange-200"}
    ${status === "rejected" && "bg-red-50 border-red-100"}
    ${status === "cancelled" && "bg-red-100 border-red-200"}
    ${status === "negotiating" && "bg-orange-400 border-orange-200"}
    ${status === "awaiting approval" && "bg-orange-100 border-orange-200"}
    
    
    `}
    >
      <div className=" p-4 rounded-lg border bg-white  border-white shadow ">
        {
          <Link href={"/dashboard/profile/" + session?.user.id} className="cursor-pointer">
            <div className="">
              <div className="flex gap-3">
                <span className="w-[50px] lg:w-1/5">
                  <img
                    src={ sessionUser?.profile?.image || "/images/placeholders/avatar.png" }
                    alt="user avatar"
                    className="rounded-full border border-gray-200"
                  />
                </span>
                <div className="w-full">
                  <div className="capitalize font-bold text-2xl flex justify-between items-center">
                  You
                    <img
                      src={
                        listing.sellerId === session?.user.id
                          ? "/images/dog.png"
                          : "/images/cat.png"
                      }
                      alt=""
                      className="h-6 "
                    />
                  </div>
                  <div className=" flex gap-2 text-[12px]  xl:text-[14px] text-gray-600">
                    {listing.userId === sessionUser?.id && (
                      <div>Start price: £{listing.price}</div>
                    )}
                    <div>
                      Last bid:{" "}
                      {meLastBid?.price ? "£" + meLastBid.price : "No bids yet"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        }
      </div>
      <div
        className={`${status === "accepted" && "border-green-300"}${
          status === "rejected" || (status === "cancelled" && "border-red-300")
        } mt-4 p-4 rounded-xl border  bg-white`}
      >
        <div className="text-center flex flex-col">
          <div className="mt-6 border-b border-gray-200 pb-4 mb-4">
            <div className="flow-root">
              <ul role="list" className="-my-6 divide-y divide-gray-200">
                <li className="flex pb-6">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <img
                      src={
                        parsedImage && parsedImage[0]
                          ? parsedImage[0]
                          : "/images/cat.png"
                      }
                      alt="user"
                      width="100%"
                      height="100%"
                      className="h-full w-full object-cover object-center rounded-xl"
                    />
                  </div>

                  <div className="ml-4 flex flex-1 flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <h3>
                          <div className="first-letter:uppercase">
                            {listing.title}
                          </div>
                        </h3>
                      </div>
                      <div className="flex gap-2 text-sm">
                        <div className="flex gap-1 items-center">
                          <BiCategoryAlt />
                          <div>
                            {listing.type === "sellerOffer" ? "Sale" : "Buy"}
                          </div>
                        </div>
                        <div className="flex gap-1 items-center">
                          <BiCalendar />
                          <div>{timeSinceCreated}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div className="text-md font-bold">
            {status === "rejected" ||
            status === "cancelled" ||
            status === "expired"
              ? "Last"
              : "Current"}{" "}
            offer
          </div>
          <div className="-mt-1">
            By
            <Link
              href={`/dashboard/profile/${currentBid.byUserId}`}
              className="underline ml-[2px]"
            >
              {currentBid.byUsername}
            </Link>
          </div>
          <div
            className={`font-extrabold text-4xl flex gap-2 mx-auto items-center`}
          >
            <div
              className={`text-5xl ${
                status === "rejected" && "text-red-500 line-through"
              }`}
            >
              £{currentBid.currentPrice || 0}
            </div>
          </div>
          {status && (
            <div className="flex justify-center pb-2 rounded-xl mb-2">
              {StatusChecker(status)}
            </div>
          )}
        </div>
        <div>
          <div className="flex justify-center gap-2 text-sm text-white font-bold mb-6 items-start">
            {mostRecentBid?.userId !== session?.user.id && status === "negotiating" || 
            listing?.userId === session?.user.id  && status === "awaiting approval" && (
                <>
                  <div className="flex flex-col justify-center w-1/3">
                    <Button
                      accept
                      onClick={() =>
                        handleStatusChange("accepted", session?.user.id)
                      }
                      className="rounded-xl px-3 py-1 text-center"
                    >
                      YES
                    </Button>
                    <img
                      src={"/icons/cat-accept.png"}
                      alt="user"
                      width="100%"
                      height="100%"
                      className="object-cover rounded-xl px-6 pt-4"
                    />
                  </div>
                  <div className="flex flex-col justify-center w-1/3">
                    <Button
                      cancel
                      onClick={() =>
                        handleStatusChange("rejected", session?.user.id)
                      }
                      className="rounded-xl px-3 py-1 text-center bg-orange-400 border border-orange-500"
                    >
                      NO
                    </Button>
                    <img
                      src={"/icons/cat-reject.png"}
                      alt="user"
                      width="100%"
                      height="100%"
                      className="object-cover rounded-xl px-6 pt-4"
                    />
                  </div>
                </>
              )}
            {status !== "rejected" && status !== "cancelled" && (
                <div className="flex flex-col justify-center w-1/3">
                  {status === "awaiting approval" &&
          listing.userId !== session?.user?.id && (
            <div className="flex justify-center gap-2 mb-4">
              <Button
                options={{ primary: true }}
                onClick={() =>
                  handleStatusChange("negotiating", session?.user.id)
                }
              >
                <div className="flex gap-2 items-center ">
                  <div>
                    <FaThumbsUp />
                  </div>
                  <div>Let's haggle</div>
                </div>
              </Button>
            </div>
          )}
                  <Button
                    options={{ primary: true }}
                    onClick={() =>
                      handleStatusChange("cancelled", session?.user.id)
                    }
                    className="rounded-xl px-3 py-1 text-center bg-red-400 border border-red-500"
                  >
                    END
                  </Button>
                  <img
                    src={
                      listing.userId === session?.user.id
                        ? "/icons/cat-terminate.png"
                        : "/icons/dog-terminate.png"
                    }
                    alt="user"
                    width="100%"
                    height="100%"
                    className="object-cover rounded-xl px-6 pt-4"
                  />
                </div>
              )}
          </div>
          { status === "rejected" && completedBy !== session?.user.id || status === "negotiating" && (
              <div className="">
                <PriceWidget
                  listing={listing}
                  currentBid={currentBid}
                  setCurrentBid={setCurrentBid}
                  bids={bids}
                  setBids={setBids}
                  sessionUser={sessionUser}
                  socketRef={socketRef}
                />
              </div>
            )}
        </div>

        
      </div>
      <div className="bg-white p-4 mt-4 rounded-lg border border-white shadow">
        <Link
          href={"/dashboard/profile/" + nonSessionUser?.id}
          className="cursor-pointer"
        >
          <div className="">
            <div className="flex gap-3">
              <span className="w-[50px] lg:w-1/5">
                <img
                  src={
                    nonSessionUser?.profile?.image
                      || "/images/placeholders/avatar.png"
                  }
                  alt="user avatar"
                  className="rounded-full border border-gray-200"
                />
              </span>
              <div className="w-full">
                <div className="capitalize font-bold text-2xl flex justify-between items-center">
                  {nonSessionUser?.username}
                  <img
                    src={
                      listing?.seller?.id === nonSessionUser?.id
                        ? "/images/dog.png"
                        : "/images/cat.png"
                    }
                    alt=""
                    className="h-6 "
                  />
                </div>
                <div className=" flex gap-2 text-[12px]  xl:text-[14px] text-gray-600 ">
                  {listing?.userId === nonSessionUser?.id && (
                    <div>Start price: £{listing.price}</div>
                  )}
                  <div>
                    Last bid:{" "}
                    {participantLastBid?.price
                      ? "£" + participantLastBid?.price
                      : "No bids yet"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default OfferDetailsWidget;
