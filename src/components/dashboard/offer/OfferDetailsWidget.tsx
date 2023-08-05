import { Bid, Listing, Profile, User } from "@prisma/client";
import Link from "next/link";
import Button from "../Button";
import PriceWidget from "@/components/widgets/PriceWidget";
import StatusChecker from "@/utils/status";
import { BiCalendar, BiCategoryAlt } from "react-icons/bi";
import { FaThumbsUp } from "react-icons/fa";
import React, { Dispatch, Key, SetStateAction, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import cat from "@/images/cat-neutral.png";
import dog from "@/images/dog-neutral.png";
import dogAccept from "@/images/dog-accept.png";
import dogReject from "@/images/dog-reject.png";
import dogTerminate from "@/images/dog-terminate.png";
import catAccept from "@/images/cat-accept.png";
import catReject from "@/images/cat-reject.png";
import catTerminate from "@/images/cat-reject.png";
import avatar from "@/images/avatar.png";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";

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
  isLoading?: boolean;
  handleFinalise: (userId: string, participantId: string) => void;
  setCompletedBy: Dispatch<SetStateAction<string | null | undefined>>;
  handleStatusChange: (status: string, userId: string) => void;
  setStatus: Dispatch<SetStateAction<string>>;
  setCurrentBid: Dispatch<
    SetStateAction<{
      currentPrice: string;
      byUserId: string;
      byUsername: string;
      me: Bid;
      participant: Bid;
    }>
  >;
  loadingState: {
    cancelled: boolean;
    accepted: boolean;
    completed: boolean;
    contact: boolean;
    yes: boolean;
    no: boolean;
    negotiating: boolean;
  }
  setLoadingState: Dispatch<SetStateAction<{
    cancelled: boolean;
    accepted: boolean;
    completed: boolean;
    contact: boolean;
    yes: boolean;
    no: boolean;
    negotiating: boolean;
  }>>
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
  setStatus,
  isLoading,
  completedBy,
  setCompletedBy,
  setLoadingState,
  loadingState,
  me,
  participant,
  bids,
  socketRef,
  handleFinalise
}: OfferDetailsWidgetProps) => {
  const [ meLastBid, setMeLastBid ] = useState<any>();
  const [ participantLastBid, setParticipantLastBid ] = useState<any>();
  const [ mostRecentBid, setMostRecentBid ] = useState<any>();
  const [ buttonClicked, setButtonClicked ] = useState("")

  const noBids = !meLastBid && !participantLastBid && status === "negotiating";
  const rejectedByMe = status === "rejected" && session.user.id !== completedBy;
  const inNegotiation = status === "negotiating";


  const statusController = noBids || rejectedByMe || inNegotiation;
  const router = useRouter()
  useEffect(() => {
    if (!session || !session?.user?.id) {
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
  }, [bids, session?.user?.id]);

  useEffect(() => {
    if (status === "rejected") {
      setCompletedBy(listing.completedById);
    }
  }, [currentBid]);

  useEffect(() => {
    if(isLoading === false){
      setLoadingState((prev) => {
       return  {
        ...prev, 
        yes: false, 
        no: false, 
        cancelled: false, 
        accepted: false, 
        completed: false,
        contact: false,
      }
      })
    }
  },[isLoading])

  let parsedImage;

  const sessionUser =
    listing.sellerId === session?.user.id ? listing.seller : listing.buyer;
  const nonSessionUser =
    listing.sellerId === session?.user.id ? listing.buyer : listing.seller;

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
    ${status === "completed" && "bg-orange-50 border-orange-200"}
    ${status === "rejected" && "bg-red-50 border-red-100"}
    ${status === "cancelled" && "bg-red-100 border-red-200"}
    ${status === "negotiating" && "bg-orange-400 border-orange-200"}
    ${status === "awaiting approval" && "bg-orange-100 border-orange-200"}
    
    
    `}
    >
      <div className=" p-4 rounded-lg border bg-white  border-white shadow ">
        {
          <Link
            href={"/dashboard/profile/" + session?.user.id}
            className="cursor-pointer"
          >
            <div className="">
              <div className="flex gap-3">
                <span className="w-[60px] xl:w-1/5">
                  <Image
                    src={sessionUser?.profile?.image || avatar}
                    alt="user avatar"
                    className="rounded-full border border-gray-200 max-w-8"
                    width={60}
                    height={60}
                  />
                </span>
                <div className="w-full">
                  <div className="capitalize font-bold text-2xl flex justify-between items-center">
                    You
                    <Image
                      src={listing.sellerId === session?.user.id ? dog : cat}
                      alt=""
                      className="h-8 w-10"
                    />
                  </div>
                  <div className="flex text-[12px]  xl:text-[14px] text-gray-600 gap-2">
                    {listing.userId === sessionUser?.id && listing.price !== '0' && listing.price !== '' && (
                    <div>{listing.price !== '0' && listing.price !== '' && `Start price: £ ${listing.price}`}</div>
                    )}
                    <div>{meLastBid?.price ? "Last bid: £" + meLastBid.price : "No bids yet"}</div>
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
                        <h3 className="xl:w-[120px] 2xl:w-[250px]">
                          <div className="first-letter:uppercase text-left truncate md:text-md lg:text-lg xl:text-xl">
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
              : status === 'completed' || status === 'accepted' ? "Ageeed" : "Current"}{" "}
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
              {currentBid.currentPrice && currentBid.currentPrice !=='0'&& `£ ${currentBid.currentPrice}`}
            </div>
            <div
              className={`text-xl mt-4 ${
                status === "rejected" && "text-red-500 line-through"
              }`}
            >
              {currentBid.currentPrice =='0' || currentBid.currentPrice =='' &&`Open offer`}
            </div>
          </div>
          {status && (
            <div className="flex justify-center pb-2 rounded-xl mb-2">
              {StatusChecker(status)}
            </div>
          )}
        </div>
        <div>
          <div className=" gap-2 text-sm text-white font-bold mb-6 items-start">
            {currentBid.byUserId !== session?.user?.id  &&
              status === "negotiating" && (
                <div className="w-2/3 flex gap-2 mx-auto justify-center">
                  <div className="flex flex-col justify-center  items-center gap-4">
                    <Button
                    isLoading={loadingState.yes}
                      accept
                      onClick={() => handleStatusChange("accepted", session?.user.id) }
                      className="rounded-xl px-3 py-1 text-center w-10"
                    >
                      YES
                    </Button>
                    <Image
                      src={ session?.user?.id === listing.sellerId ? catAccept : dogAccept }
                      alt="user"
                      className="rounded-xl px-6"
                    />
                  </div>
                  <div className="flex flex-col justify-center items-center  gap-4">
                    <Button
                      cancel
                      isLoading={loadingState.no}
                      onClick={() => handleStatusChange("rejected", session?.user.id)}
                      className="rounded-xl px-3 py-1 text-center bg-orange-400 border border-orange-500"
                    >
                      NO
                    </Button>
                    <Image
                      src={session?.user?.id === listing.sellerId ? catTerminate : dogTerminate}
                      alt="user"
                      className=" rounded-xl px-6"
                    />
                  </div>
                </div>
              )}

            {status === "awaiting approval" &&
              listing.userId !== session?.user?.id && (
                <div className="flex justify-center gap-2 mb-4 w-full">
                  <Button
                    options={{ primary: true, size: "lg" }}
                    isLoading={loadingState.negotiating}
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
          </div>
          {statusController && (
            <div className="">
              <PriceWidget
                listing={listing}
                currentBid={currentBid}
                setCurrentBid={setCurrentBid}
                bids={bids}
                setBids={setBids}
                sessionUser={sessionUser}
                socketRef={socketRef}
                status={status}
                setStatus={setStatus}
              />
            </div>
          )}
          {status !== "cancelled" && status !== "accepted" && status !== "completed" && (
            <div className="flex flex-col items-center gap-4 mt-4 w-full">
              <Button
                cancel
                outline
                options={{ color: "danger", size: "lg" }}
                isLoading={loadingState.cancelled}
                onClick={() => handleStatusChange("cancelled", session?.user.id)  }
              >
                TERMINATE
              </Button>
            </div>
          )}
          {status === "accepted"  && (
            <div className="flex flex-col items-center gap-4 mt-4 w-full">
              <Button
                secondary
                outline
                options={{ color: "primary", size: "lg" }}
                isLoading={loadingState.contact}
                onClick={() => handleFinalise(session?.user.id, participant.id)
                }
              >
                Arrange to {completedBy === session.user.id && listing.type === "sellerOffer" ? "get paid" : "get your item"}
              </Button>
              {completedBy === session.user.id && status === "accepted" &&(
              <Button
              accept
              options={{ size: "lg" }}
                isLoading={loadingState.completed}
                onClick={() => handleStatusChange("completed", session?.user.id) }
              >
                Complete offer
              </Button>
              )}
            </div>
          )}
          { status === "completed" &&(
              <Button
              primary
              options={{ size: "lg" }}
                isLoading={loadingState.contact}
                onClick={() => (
                  handleFinalise(session?.user.id, participant.id), 
                  setLoadingState((prev) => {
                  return {
                    ...prev,
                    contact: true
                  }
                })
                )
              }
              >
                Contact {session.user.id === listing.sellerId ? "Buyer" : "Seller"}
              </Button>
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
              <span className="w-[60px] xl:w-1/5">
                <Image
                  src={nonSessionUser?.profile?.image || avatar}
                  alt="user avatar"
                  className="rounded-full border border-gray-200"
                  width={60}
                  height={60}
                />
              </span>
              <div className="w-full">
                <div className="capitalize font-bold text-2xl flex justify-between items-center">
                  {nonSessionUser?.username}
                  <Image
                    src={listing.sellerId === nonSessionUser.id ? dog : cat}
                    alt=""
                    className="h-8 w-10"
                  />
                </div>
                <div className="flex gap-2 text-[12px]  text-gray-600 xl:text-[14px]">
                  {listing?.userId === nonSessionUser?.id && listing.price !== '0' && listing.price !== '' && (
                    <div>{listing.price !== '0' && listing.price !== '' ? `Start price: £ ${listing.price}` : ''}</div>
                  )}
                  <div>
                    {participantLastBid?.price
                      ? "Last bid: £" + participantLastBid?.price
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
