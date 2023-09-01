import { Bid, Profile, Review, User } from "@prisma/client";
import Link from "next/link";
import Button from "../Button";
import PriceWidget from "@/components/widgets/PriceWidget";
import StatusChecker from "@/utils/status";
import { BiCalendar, BiCategoryAlt } from "react-icons/bi";
import { FaThumbsUp } from "react-icons/fa";
import React, {
  Dispatch,
  Key,
  SetStateAction,
  useEffect,
  useState,
} from "react";
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
import {
  MdOutlineCalendarMonth,
  MdOutlineSignpost,
  MdOutlineSyncAlt,
} from "react-icons/md";
import { useSocket } from "@/hooks/useSocket";
import { CustomListing } from "@/interfaces/authenticated";

interface SafeUser extends User {
  profile: Profile;
}

interface ICurrentBid {
  currentPrice: string;
}

interface OfferDetailsWidgetProps {
  listing: CustomListing;
  status: string;
  session: any;
  timeSinceCreated: string | null;
  bids: any;
  me: any;
  participant: any;
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
    user: boolean;
    status: boolean;
    loading: boolean;
  };
  setLoadingState: Dispatch<
    SetStateAction<{
      cancelled: boolean;
      accepted: boolean;
      completed: boolean;
      contact: boolean;
      yes: boolean;
      no: boolean;
      negotiating: boolean;
      user: boolean;
      status: boolean;
      loading: boolean;
    }>
  >;
  currentBid: any;
  setBids: Dispatch<SetStateAction<Bid[]>>;
}
const OfferDetailsWidgetOld = ({
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
  handleFinalise,
}: OfferDetailsWidgetProps) => {
  const [meLastBid, setMeLastBid] = useState<any>();
  const [participantLastBid, setParticipantLastBid] = useState<any>();
  const [mostRecentBid, setMostRecentBid] = useState<any>();
  const [buttonClicked, setButtonClicked] = useState("");

  console.log("currentBid", currentBid)

  const noBids = !meLastBid && !participantLastBid && status === "negotiating";
  const rejectedByMe =
    status === "rejected" && session?.user.id !== completedBy;
  const inNegotiation = status === "negotiating";

  const statusController = noBids || rejectedByMe || inNegotiation;
  const router = useRouter();

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
    if (isLoading === false) {
      setLoadingState((prev) => {
        return {
          ...prev,
          yes: false,
          no: false,
          cancelled: false,
          accepted: false,
          completed: false,
          contact: false,
        };
      });
    }
  }, [isLoading]);

  let parsedImage;

  const sessionUser =
    listing.sellerId === session?.user.id ? listing.seller : listing.buyer;
  const nonSessionUser =
    listing.sellerId === session?.user.id ? listing.buyer : listing.seller;

  if (listing?.image) {
    parsedImage = JSON.parse(listing?.image || "");
  }
  const FormatPrice = Number(listing.price).toLocaleString();
  const formatLastBid = Number(currentBid.currentPrice).toLocaleString();
  const formatUserLastBid = Number(listing.price).toLocaleString();
  const formatParticipantLast = Number(listing.price).toLocaleString();

  return (
    <div
      className={`
    w-full
    rounded-lg
   
    `}
    >
      <div className="relative mx-auto w-full">
        <div className="relative inline-block duration-300 ease-in-out transition-transform transform hover:-translate-y-2 w-full shadow">
          <div className="shadow p-4 rounded-lg bg-white">
            <div className="flex justify-center relative rounded-lg overflow-hidden h-52">
              <div className="transition-transform duration-500 transform ease-in-out hover:scale-110 w-full">
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <img
                  src={
                    parsedImage && parsedImage[0]
                      ? parsedImage[0]
                      : "/images/cat.png"
                  }
                  alt="user"
                  width="100%"
                  height="100%"
                  className="h-full w-full object-cover object-center rounded-x absolute"
                />
              </div>

              <span className="absolute top-0 left-0 inline-flex mt-3 ml-3 px-3 py-2 rounded-lg z-10 bg-red-500 text-sm font-medium text-white select-none">
                {StatusChecker(status)}
              </span>
            </div>

            <div className="mt-4">
              <div className="flex items-start">
                <h2 className="flex-1 capitalize font-bold text-base md:text-xl text-gray-800 line-clamp-1">
                  {listing.title}
                </h2>
                <span className="text-sm text-gray-500">
                  {timeSinceCreated}
                </span>
              </div>
              <p className="-mt-3 text-sm text-gray-600 line-clamp-1">
                {listing.category}
              </p>
            </div>
          </div>
          <div className="px-4">
            <div className="text-md font-bold text-center flex flex-col items-center mt-6">
              {status === "rejected" ||
              status === "cancelled" ||
              status === "expired"
                ? "Last"
                : status === "completed" || status === "accepted"
                ? "Ageeed"
                : "Current"}{" "}
              offer
            </div>
            <div className="-mt-1 flex justify-center gap-1">
              By
              <Link
                href={`/dashboard/profile/${currentBid.byUserId}`}
                className="underline ml-[2px]"
              >
                {currentBid.byUsername}
              </Link>
            </div>
            <div
              className={`font-extrabold text-4xl flex gap-2 mx-auto items-center justify-center`}
            >
              <div
                className={`text-5xl text-center flex justify-center ${
                  status === "rejected" && "text-red-500 line-through"
                }`}
              >
                {currentBid.currentPrice &&
                  currentBid.currentPrice !== "0" &&
                  `£${Number(currentBid.currentPrice).toLocaleString()}`}
              </div>
              <div
                className={`text-xl mt-4 ${
                  status === "rejected" &&
                  "text-red-500 line-through text-center flex justify-center"
                }`}
              >
                {currentBid.currentPrice == "0" ||
                  (currentBid.currentPrice == "" &&
                    listing.price === "0 " &&
                    `Open offer`)}
              </div>
            </div>

            <div className="pb-6">
              <div className=" gap-2 text-sm text-white font-bold mb-6 items-start">
                {currentBid.byUserId !== session?.user?.id &&
                  currentBid.currentPrice !== "0" &&
                  currentBid.currentPrice !== "" &&
                  status === "negotiating" && (
                    <div className="w-2/3 flex gap-2 mx-auto justify-center">
                      <div className="flex flex-col justify-center  items-center gap-4">
                        <Button
                          isLoading={loadingState.yes}
                          accept
                          onClick={() =>
                            handleStatusChange("accepted", session?.user.id)
                          }
                          className="rounded-xl px-3 py-1 text-center w-10"
                        >
                          YES
                        </Button>
                        <Image
                          src={
                            session?.user?.id === listing.sellerId
                              ? catAccept
                              : dogAccept
                          }
                          alt="user"
                          className="rounded-xl px-6"
                        />
                      </div>
                      <div className="flex flex-col justify-center items-center  gap-4">
                        <Button
                          cancel
                          isLoading={loadingState.no}
                          onClick={() =>
                            handleStatusChange("rejected", session?.user.id)
                          }
                          className="rounded-xl px-3 py-1 text-center bg-orange-default border border-orange-500"
                        >
                          NO
                        </Button>
                        <Image
                          src={
                            session?.user?.id === listing.sellerId
                              ? catTerminate
                              : dogTerminate
                          }
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
                    status={status}
                    setStatus={setStatus}
                  />
                </div>
              )}
              {status !== "cancelled" &&
                status !== "accepted" &&
                status !== "completed" && (
                  <div className="flex flex-col items-center gap-4 mt-4 w-full">
                    <Button
                      cancel
                      options={{ color: "danger", size: "lg" }}
                      isLoading={loadingState.cancelled}
                      onClick={() =>
                        handleStatusChange("cancelled", session?.user.id)
                      }
                    >
                      TERMINATE
                    </Button>
                  </div>
                )}
              {status === "accepted" && (
                <div className="flex flex-col items-center gap-4 mt-4 w-full">
                  <Button
                    secondary
                    outline
                    options={{ color: "primary", size: "lg" }}
                    isLoading={loadingState.contact}
                    onClick={() =>
                      handleFinalise(session?.user.id, participant.id)
                    }
                  >
                    Arrange to{" "}
                    {completedBy === session?.user.id &&
                    listing.type === "sellerOffer"
                      ? "get paid"
                      : "get your item"}
                  </Button>
                  {completedBy === session?.user.id &&
                    status === "accepted" && (
                      <Button
                        accept
                        options={{ size: "lg" }}
                        isLoading={loadingState.completed}
                        onClick={() =>
                          handleStatusChange("completed", session?.user.id)
                        }
                      >
                        Complete offer
                      </Button>
                    )}
                </div>
              )}
              {status === "completed" && (
                <Button
                  primary
                  options={{ size: "lg" }}
                  isLoading={loadingState.contact}
                  onClick={() => (
                    handleFinalise(session?.user.id, participant.id),
                    setLoadingState((prev) => {
                      return {
                        ...prev,
                        contact: true,
                      };
                    })
                  )}
                >
                  Contact{" "}
                  {session?.user.id === listing.sellerId ? "Buyer" : "Seller"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="relative rounded-full inline-block duration-300 ease-in-out transition-transform transform hover:-translate-y-2 w-full shadow">
        <div className="grid grid-cols-2 my-4 mx-4">
          <div className="flex items-center">
            <div className="relative">
              <div className="rounded-full w-6 h-6 md:w-8 md:h-8 bg-gray-200"></div>
              <span className="absolute top-0 right-0 inline-block w-3 h-3 bg-primary-red rounded-full"></span>
            </div>

            <p className="ml-2 text-gray-800 line-clamp-1">{session?.user.username}</p>
          </div>

          <div className="flex justify-end">
            <p className="inline-block font-semibold text-primary whitespace-nowrap leading-tight rounded-xl">
              <span className="text-sm uppercase">£</span>
              <span className="text-lg">{meLastBid?.price && Number(meLastBid?.price).toLocaleString()}</span>
            </p>
          </div>
        </div>
      </div>
      <div className="relative rounded-full inline-block duration-300 ease-in-out transition-transform transform hover:-translate-y-2 w-full shadow">
        <div className="grid grid-cols-2 my-4 mx-4">
          <div className="flex items-center">
            <div className="relative">
              <div className="rounded-full w-6 h-6 md:w-8 md:h-8 bg-gray-200"></div>
              <span className="absolute top-0 right-0 inline-block w-3 h-3 bg-primary-red rounded-full"></span>
            </div>

            <p className="ml-2 text-gray-800 line-clamp-1">{participant?.username}</p>
          </div>

          <div className="flex justify-end">
            <p className="inline-block font-semibold text-primary whitespace-nowrap leading-tight rounded-xl">
              
              <span className="text-lg">{participantLastBid?.price ? <span className="text-sm uppercase">{`£ ${Number(participantLastBid?.price).toLocaleString()}`}</span> : "no offers yet"}</span>
            </p>
          </div>
        </div>
      </div>
      <div
        className={`
         mt-4 
         p-4 
         rounded-xl 
         shadow
         border
         ${status === "accepted" && "bg-green-50 border-green-100"}
         ${status === "completed" && "bg-green-50 border-green-100"}
         ${status === "rejected" && "bg-red-50 border-red-100"}
         ${status === "cancelled" && "bg-red-50 border-red-100"}
         ${status === "negotiating" && "bg-orange-50 border-orange-100"}
         ${status === "awaiting approval" && "bg-orange-50 border-orange-100"}
         `}
      >
        <div className="text-center flex flex-col">
          <div className="mt-6 border-b border-gray-200 pb-4 mb-4">
            <div className="flow-root">
              <ul role="list" className="-my-6 divide-y divide-gray-200">
                <li className="flex pb-6">
                  <div className="h-16 w-16 md:h-20 md:w-20 lg:h-[180px] lg:w-[180px] xl:h-16 xl:w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-white">
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
                    <div className="flex flex-col h-full">
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <h3 className="xl:w-[120px] 2xl:w-[250px]">
                          <div className="first-letter:uppercase text-left truncate md:text-md lg:text-lg xl:text-xl">
                            {listing.title}
                          </div>
                        </h3>
                      </div>
                      <div className="flex gap-2 text-sm mt-auto">
                        <div className="flex gap-1 items-center">
                          <MdOutlineSyncAlt />
                          <div>
                            {listing.type === "sellerOffer" ? "Sale" : "Buy"}
                          </div>
                        </div>
                        <div className="flex gap-1 items-center">
                          <MdOutlineCalendarMonth />
                          <div>{timeSinceCreated}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
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
            {currentBid.byUserId !== session?.user?.id &&
              currentBid.currentPrice !== "0" &&
              currentBid.currentPrice !== "" &&
              status === "negotiating" && (
                <div className="w-2/3 flex gap-2 mx-auto justify-center">
                  <div className="flex flex-col justify-center  items-center gap-4">
                    <Button
                      isLoading={loadingState.yes}
                      accept
                      onClick={() =>
                        handleStatusChange("accepted", session?.user.id)
                      }
                      className="rounded-xl px-3 py-1 text-center w-10"
                    >
                      YES
                    </Button>
                    <Image
                      src={
                        session?.user?.id === listing.sellerId
                          ? catAccept
                          : dogAccept
                      }
                      alt="user"
                      className="rounded-xl px-6"
                    />
                  </div>
                  <div className="flex flex-col justify-center items-center  gap-4">
                    <Button
                      cancel
                      isLoading={loadingState.no}
                      onClick={() =>
                        handleStatusChange("rejected", session?.user.id)
                      }
                      className="rounded-xl px-3 py-1 text-center bg-orange-default border border-orange-500"
                    >
                      NO
                    </Button>
                    <Image
                      src={
                        session?.user?.id === listing.sellerId
                          ? catTerminate
                          : dogTerminate
                      }
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
                status={status}
                setStatus={setStatus}
              />
            </div>
          )}
          {status !== "cancelled" &&
            status !== "accepted" &&
            status !== "completed" && (
              <div className="flex flex-col items-center gap-4 mt-4 w-full">
                <Button
                  cancel
                  options={{ color: "danger", size: "lg" }}
                  isLoading={loadingState.cancelled}
                  onClick={() =>
                    handleStatusChange("cancelled", session?.user.id)
                  }
                >
                  TERMINATE
                </Button>
              </div>
            )}
          {status === "accepted" && (
            <div className="flex flex-col items-center gap-4 mt-4 w-full">
              <Button
                secondary
                outline
                options={{ color: "primary", size: "lg" }}
                isLoading={loadingState.contact}
                onClick={() => handleFinalise(session?.user.id, participant.id)}
              >
                Arrange to{" "}
                {completedBy === session?.user.id &&
                listing.type === "sellerOffer"
                  ? "get paid"
                  : "get your item"}
              </Button>
              {completedBy === session?.user.id && status === "accepted" && (
                <Button
                  accept
                  options={{ size: "lg" }}
                  isLoading={loadingState.completed}
                  onClick={() =>
                    handleStatusChange("completed", session?.user.id)
                  }
                >
                  Complete offer
                </Button>
              )}
            </div>
          )}
          {status === "completed" && (
            <Button
              primary
              options={{ size: "lg" }}
              isLoading={loadingState.contact}
              onClick={() => (
                handleFinalise(session?.user.id, participant.id),
                setLoadingState((prev) => {
                  return {
                    ...prev,
                    contact: true,
                  };
                })
              )}
            >
              Contact{" "}
              {session?.user.id === listing.sellerId ? "Buyer" : "Seller"}
            </Button>
          )}
        </div>
      </div>
      <div
        className={`
      p-4
      mt-4
      rounded-lg
      shadow
      border
      ${status === "accepted" && "bg-green-50 border-green-100"}
      ${status === "completed" && "bg-green-50 border-green-100"}
      ${status === "rejected" && "bg-red-50 border-red-100"}
      ${status === "cancelled" && "bg-red-50 border-red-100"}
      ${status === "negotiating" && "bg-orange-50 border-orange-100 "}
      ${status === "awaiting approval" && "bg-orange-50 border-orange-100 "}
      `}
      >
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
                  {listing?.userId === nonSessionUser?.id &&
                    listing.price !== "0" &&
                    listing.price !== "" && (
                      <div>
                        {listing.price !== "0" && listing.price !== ""
                          ? `Start price: £${listing.price}`
                          : ""}
                      </div>
                    )}
                  <div>
                    {participantLastBid?.price
                      ? "Last bid: £" +
                        Number(participantLastBid?.price).toLocaleString()
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

export default OfferDetailsWidgetOld;
