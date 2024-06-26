import Link from "next/link";
import Button from "../Button";
import PriceWidget from "@/components/widgets/PriceWidget";
import { Bid } from "@prisma/client";
import { FaPencilAlt, FaThumbsUp } from "react-icons/fa";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import cat from "@/images/cat-neutral.png";
import dog from "@/images/dog-neutral.png";
import Image from "next/image";
import StripeCheckout from "@/components/StripeCheckout";

import {
  TbArrowBigDown,
  TbArrowBigDownFilled,
  TbArrowBigDownLinesFilled,
  TbArrowBigUp,
  TbArrowBigUpFilled,
  TbArrowBigUpLinesFilled,
  TbInfoHexagon,
} from "react-icons/tb";
import { MdOutlineSwapVerticalCircle } from "react-icons/md";
import { CustomListing } from "@/interfaces/authenticated";
import {
  CiCalendar,
  CiDeliveryTruck,
  CiLocationOn,
  CiMedicalCross,
} from "react-icons/ci";
import useOfferEditModal from "@/hooks/useOfferEditModal";
import StatusChecker from "@/utils/status";
import Card from "../Card";
import { tempId } from "@/utils/generate";

interface OfferDetailsWidgetProps {
  listing: CustomListing;
  status: string;
  session: any;
  timeSinceCreated: string | null;
  bids: any;
  me: any;
  participant: any;
  serverBids?: any;
  events: {
    id: string;
    event: string;
    date: string;
    userId: string;
    price: string | number;
  }[];
  isLoading?: boolean;
  handleFinalise: (userId: string, participantId: string) => void;
  handleStatusChange: (status: string, userId: string) => void;
  updateListing: (listing: {
    title?: string;
    description?: string;
    price?: number;
    category?: string;
    subcategory?: string;
  }) => void;
  setStatus: Dispatch<SetStateAction<string>>;
  setCurrentBid: Dispatch<
    SetStateAction<{
      currentPrice: string | number;
      byUserId: string;
      byUsername: string;
      me: Bid;
      participant: Bid;
      final?: boolean
    }>
  >;
  loadingState: {
    cancelled: boolean;
    accepted: boolean;
    completed: boolean;
    contact: boolean;
    yes: boolean;
    no: boolean;
    haggling: boolean;
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
      haggling: boolean;
      user: boolean;
      status: boolean;
      loading: boolean;
    }>
  >;
  currentBid: {
    currentPrice: string | number;
    byUserId: string;
    byUsername: string;
    me: Bid;
    participant: Bid;
    final?: boolean
  };
  setBids: Dispatch<SetStateAction<Bid[]>>;
  setEvents: Dispatch<SetStateAction<any>>;
  setCurrentListing: Dispatch<SetStateAction<any>>;
}
const OfferDetailsWidget = ({
  bids,
  listing,
  status,
  session,
  isLoading,
  currentBid,
  events,
  loadingState,
  participant,
  serverBids,
  setBids,
  setStatus,
  setCurrentBid,
  setLoadingState,
  handleFinalise,
  handleStatusChange,
  updateListing,
  setEvents,
  setCurrentListing,
}: OfferDetailsWidgetProps) => {
  const [meLastBid, setMeLastBid] = useState<any>();
  const [participantLastBid, setParticipantLastBid] = useState<any>();
  const [mostRecentBid, setMostRecentBid] = useState<any>();
  const [toggleMenu, setToggleMenu] = useState({
    description: false,
    summary: true,
    events: false,
  });
  const edit = useOfferEditModal();
  const { options } = listing;

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
    listing?.sellerId === session?.user.id
      ? listing?.seller
      : listing?.buyer || session?.user;

  if (listing?.image) { parsedImage = JSON.parse(listing?.image || ""); }

  const now = new Date();

  return (
    <div
      className={`
        w-full
        rounded-lg
        border
        p-4
        border-gray-200
        ${
          status === "rejected" || status === "cancelled"
            ? "bg-red-100  border-red-50"
            : status === "accepted" || status === "completed"
            ? "bg-green-100 border-green-50"
            : " bg-gradient-to-b  from-orange-400 to-orange-300 bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-70 border-gray-200"
        }
        `}
    >
      {/*       <h4 className="pb-2 text-md -mt-2">Trading Card</h4>
       */}
      <div className="relative mx-auto w-full">
        <Link
          href={`/dashboard/profile/${session?.user.id}`}
          className={`relative rounded-lg inline-block duration-300 ease-in-out transition-transform transform hover:-translate-y-2 w-full shadow mb-4  border
        ${
          status === "rejected" || status === "cancelled"
            ? "bg-red-50 text-red-500 border-red-100"
            : status === "accepted" || status === "completed"
            ? "bg-green-50 text-green-500 border-green-100"
            : currentBid?.currentPrice &&
              currentBid?.byUserId === session?.user.id &&
              status === "haggling"
            ? "bg-orange-50 text-orange-500 border-orange-100"
            : "bg-orange-50 border-gray-200"
        } border  shadow`}
        >
          <div className="grid grid-cols-2 my-4 mx-4">
            <div className="flex items-center">
              <div className="relative">
                <div className="rounded-full w-6 h-6 md:w-8 md:h-8 bg-white">
                  <span className="absolute top-0 right-0 inline-block w-3 h-3 bg-primary-red rounded-full"></span>
                  <Image
                    src={
                      sessionUser.id === listing?.sellerId
                        ? listing?.seller?.profile?.image || dog
                        : listing?.buyer?.profile?.image || cat
                    }
                    className="rounded-full"
                    alt=""
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              </div>
              <p className="ml-2 !container text-gray-800 text-md xl:text-md font-bold">
                You {/*  {session?.user?.id} - {events && events[0]?.userId} */}{" "}
                {session?.user.id === listing?.sellerId ? (
                  <span className="!font-medium text-orange-600 text-sm">
                   Seller
                  </span>
                ) : (
                  <span className="!font-medium text-orange-600 text-sm">
                    Buyer
                  </span>
                )}
              </p>
            </div>

            <div className="flex justify-end">
              <div className="inline-block font-semibold text-primary whitespace-nowrap leading-tight rounded-xl">
                <span className="text-sm">
                  {(events &&
                    events.length > 0 &&
                    events?.[0].event === "cancelled" &&
                    events?.[0].userId === sessionUser.id) ||
                  (events &&
                    events.length > 0 &&
                    events?.[0].event === "approved" &&
                    events?.[0].userId === sessionUser.id) ||
                  (events &&
                    events.length > 0 &&
                    events?.[0].event === "completed" &&
                    events?.[0].userId === sessionUser.id) ||
                  (events &&
                    events.length > 0 &&
                    events?.[0].event === "accepted" &&
                    events?.[0].userId === sessionUser.id) ? (
                    <div className="text-right">
                      <p className="text-xs ">
                        {events &&
                        events.length > 0 &&
                        events?.[0].event === "cancelled" &&
                        events?.[0].userId === sessionUser.id
                          ? "Cancelled"
                          : events &&
                            events.length > 0 &&
                            events?.[0].event === "approved" &&
                            events?.[0].userId === sessionUser.id
                          ? "Approved"
                          : events &&
                            events.length > 0 &&
                            events?.[0].event === "completed" &&
                            events?.[0].userId === sessionUser.id
                          ? "Completed"
                          : events &&
                            events.length > 0 &&
                            events?.[0].event === "accepted" &&
                            events?.[0].userId === sessionUser.id
                          ? "Accepted"
                          : ""}
                      </p>
                      <p className="text-xs">
                        {new Date(events?.[0].date).toLocaleString("en-GB")}
                      </p>
                    </div>
                  ) : meLastBid?.price ? (
                    <div className="text-right">
                      <p className="text-xs text-gray-800">Latest Offer</p>{" "}
                      <span className="text-sm uppercase">{`£${Number(
                        meLastBid?.price
                      ).toLocaleString("en-GB")}`}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-800">no offers yet</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </Link>

        <div className="w-full flex justify-center mt-2 -mb-2 ">
          {Number(currentBid?.currentPrice) > 0 &&
            status !== "cancelled" &&
            status !== "accepted" &&
            status !== "completed" &&
            currentBid?.byUserId === session?.user.id && (
              <TbArrowBigDownFilled
                className={` shadow-sm transition-all text-white/90 animate-bounce text-[50px] md:text-[50px] lg:text-[50px] xl:text-[40px] xl:-mt-10 2xl:text-[50px] -my-10 md:-mt-14 z-10 rounded-full p-2.5 ${
                  status === "rejected" || status === "cancelled"
                    ? "border-red-200  bg-gradient-to-t from-red-400 to-red-300"
                    : status === "accepted" || status === "completed"
                    ? "border-green-200  bg-gradient-to-t from-green-300 to-green-300"
                    : " bg-gradient-to-t from-orange-500 to-orange-300 border-orange-300"
                } border  shadow`}
              />
            )}
        </div>

        <div
          className={`relative inline-block duration-300 ease-in-out transition-transform transform hover:-translate-y-2 w-full shadow rounded-lg ${
            status === "rejected" || status === "cancelled"
              ? "bg-red-50 border-red-100"
              : status === "accepted" || status === "completed"
              ? "bg-green-50 border-green-100"
              : "bg-orange-50 border-orange-200"
          } border  shadow`}
        >
          <div className="flex p-4 xl:hidden border-b gap-4 ">
            <div className=" relative rounded-lg overflow-hidden w-20  h-14">
              <div className="transition-transform duration-500 transform ease-in-out hover:scale-110 ">
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
                  className="h-14 w-16 object-cover object-center rounded-lg absolute"
                />
              </div>
            </div>

            <div className=" w-full">
              <h2 className="flex-1 capitalize font-bold text-base md:text-xl text-gray-800 line-clamp-1">
                {listing.title}
              </h2>

              <div className="-mt-5 flex items-start justify-between flex-1">
                <p className=" text-sm  line-clamp-1">{listing.category}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 h-1 shadow-2xl mb-4 lg:mt-4 lg:border-0 md:hidden" />

          <div className="md:hidden w-full flex justify-center mb-4 md:mt-4">
            {StatusChecker(status)}
          </div>
          <div className="px-6">
            <div className="text-md -mb-1 font-bold text-center flex flex-col items-center md:mt-6 ">
              {currentBid.final  ? "Final Offer" + " " : 
              status === "rejected" ||
              status === "cancelled" 
                ? "Current Offer" + " "
                : status === "completed"
                ? "Accepted Offer" + " "
                : status === "accepted"
                ? "Accepted Offer" + " "
                : !currentBid.currentPrice || currentBid.currentPrice == ""
                ? currentBid.currentPrice == "0" &&
                  (listing.price === "" ||
                    (listing.price === "0" && "Open Offer"))
                : "Current Offer"}
                {status === "awaiting approval" && Number(listing.price) > 0 && (
                  "Starting Offer" )}
            </div>

            <div
              className={`font-extrabold text-4xl flex gap-2 mx-auto items-center justify-center`}
            >
              <div
                className={`text-4xl text-center flex justify-center ${
                  status === "rejected" && "text-red-500 line-through"
                }`}
              >
                {currentBid?.currentPrice && Number(currentBid.currentPrice) > 0
                  ? `£${Number(currentBid.currentPrice).toLocaleString("en-GB")}`
                  : listing.price && listing?.price !== "0"
                  ? `£${Number(listing.price).toLocaleString("en-GB")}`
                  : "Open Trade"}
              </div>
              <div
                className={`text-xl mt-4 ${
                  status === "rejected" &&
                  "text-red-500 line-through text-center flex justify-center"
                }`}
              ></div>
            </div>

            <div className="pb-4">
              <div className="flex justify-center gap-1 text-center ">
                <span>By</span>
                <Link
                  href={`/dashboard/profile/${currentBid.byUserId}`}
                  className="underline ml-[2px]"
                >
                  {currentBid.byUsername
                    ? currentBid.byUsername === session?.user?.username
                      ? "You"
                      : currentBid.byUsername || "(no username)"
                    : listing?.user?.username || "(no username)"}
                </Link>
              </div>

              {status === "awaiting approval" || status === "haggling" ? (
                (currentBid &&
                  currentBid.currentPrice &&
                  currentBid.byUserId !== sessionUser.id) ||
                (!currentBid.currentPrice &&
                  Number(listing.price) > 0 &&
                  listing.userId !== sessionUser.id) ? (
                  <div className="flex flex-col justify-center items-center w-full mb-3">
                    {bids && bids.length > 0 ?

                    <div className="w-2/3 flex gap-2 mx-auto justify-center pt-4">
                      {
                        <>
                          <div className="flex flex-col justify-center  items-center gap-4">
                            <Button
                              isLoading={loadingState.yes}
                              accept
                              onClick={() =>
                                handleStatusChange("completed", session?.user.id)
                              }
                              className="rounded-xl px-3 py-1 text-center w-10"
                            >
                              ACCEPT
                            </Button>
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
                              DECLINE
                            </Button>
                          </div>
                        </>
                      }
                    </div>
                 : (
                      <div className="flex justify-center mt-4 gap-2">
                       <div className="flex flex-col justify-center  items-center gap-4">
                            <Button
                              isLoading={loadingState.yes}
                              accept
                              onClick={() =>
                                handleStatusChange("completed", session?.user.id)
                              }
                              className="rounded-xl px-3 py-1 text-center w-10"
                            >
                              ACCEPT
                            </Button>
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
                              DECLINE
                            </Button>
                          </div></div>
                    )}
                  </div>

                ) : null
              )  : null}

              {status === "awaiting approval" && listing.userId !== sessionUser.id &&
              !currentBid?.currentPrice &&
              listing.price &&
              Number(listing.price) > 0 ? (
                <>
                  <div className="flex items-center mx-auto gap-1">
                    <p className="block w-full mt-2 italic">
                      <div className="flex justify-center items-center gap-1 w-full">
                        <div className="flex items-center mx-auto gap-1">
                          <TbInfoHexagon />
                          <p className="block w-full my-2 italic">
                            {listing.userId === session?.user?.id
                              ? `Awaiting response from ${
                                  participant?.username || ""
                                }`
                              : "Click lets haggle to make a counter offer"}
                          </p>
                        </div>
                      </div>
                    </p>
                  </div>
                </>
              ) : status === "awaiting approval" ? (
                <div className="flex  justify-center items-center w-full">
                  <div className="flex items-center mx-auto gap-1">
                    <TbInfoHexagon />
                    <p className="block w-full my-2 italic">
                      {currentBid?.byUserId ? currentBid?.byUserId !== session?.user?.id
                        ? `${
                            participant?.username || ""
                          } would like to negotiate with you`
                        : "Awaiting response" : (
                          listing.userId === session?.user?.id ? `Awaiting response from ${
                            participant?.username || ""
                          }` : "Click lets haggle to make a counter offer"
                        )}
                    </p>
                  </div>
                </div>
              ) : status === "haggling" ? (
                (currentBid &&
                  currentBid.currentPrice &&
                  Number(currentBid.currentPrice) > 0) ||
                (!currentBid.currentPrice &&
                  Number(listing.price) > 0 &&
                  listing.userId !== sessionUser.id) ? (
                  <div className="flex items-center mx-auto gap-1 mb-4">
                    <p className="block w-full mb-2 italic">
                      <div className="flex justify-center items-center gap-1 w-full">
                        <div className="flex items-center mx-auto gap-1">
                          <TbInfoHexagon />
                          <p className="block w-full my-2 italic text-sm">
                            {(currentBid?.currentPrice &&
                              currentBid.byUserId === session?.user?.id) ||
                            (!currentBid.currentPrice &&
                              listing.userId === session?.user?.id)
                              ? `Awaiting response from ${
                                  participant?.username || ""
                                }`
                              : currentBid?.currentPrice &&
                                currentBid.byUserId !== session?.user?.id
                              ? "Enter a counter offer to continue haggling"
                              : !currentBid.currentPrice &&
                                listing.userId !== session?.user?.id
                              ? "Enter a counter offer to start haggling"
                              : "Click lets haggle to make a counter offer"}
                          </p>
                        </div>
                      </div>
                    </p>
                  </div>
                ) : null
              ) : null}
            </div>

            {status === "awaiting approval" &&
            listing.userId !== session?.user?.id ? (
              <div className="flex justify-center flex-col gap-2 mb-8 w-full mt-2 ">
                <Button
                  options={{ primary: true, size: "lg" }}
                  isLoading={loadingState.haggling}
                  onClick={() =>
                    handleStatusChange("haggling", session?.user.id)
                  }
                >
                  <div className="flex gap-2 items-center">
                    <div>
                      <FaThumbsUp />
                    </div>
                    <div>Let's haggle</div>
                  </div>
                </Button>
              </div>
            ) : (
              <div className=""></div>
            )}
          </div>
        </div>
      </div>

      <div className="relative inline-block  w-full  rounded-lg my-4 ">
        <div className="w-full flex justify-center -mb-6 mt-6 xl:-mb-4 xl:mt-4">
          {Number(currentBid?.currentPrice) > 0 &&
            status !== "cancelled" &&
            status !== "accepted" &&
            status !== "completed" &&
            currentBid?.byUserId === participant.id && (
              <TbArrowBigUpFilled
                className={` transition-all shadow-sm text-white/90 animate-bounce text-[50px] md:text-[50px] lg:text-[50px] xl:text-[40px] xl:-mt-10 2xl:text-[50px] -my-10 md:-mt-14 z-10 rounded-full p-2.5 ${
                  status === "rejected" || status === "cancelled"
                    ? "border-red-200  bg-gradient-to-b from-red-400 to-red-300"
                    : status === "accepted" || status === "completed"
                    ? "border-green-200  bg-gradient-to-b from-green-300 to-green-300"
                    : "bg-gradient-to-b from-orange-400 to-orange-300 border-orange-300"
                } border  shadow`}
              />
            )}
        </div>
        <Link
          href={`/dashboard/profile/${participant?.id}`}
          className={`border relative rounded-lg inline-block duration-300 ease-in-out transition-transform text-md lg:text-lg transform hover:-translate-y-2 w-full ${
            status === "rejected" || status === "cancelled"
              ? "bg-red-50 text-red-500 border-red-100"
              : status === "accepted" || status === "completed"
              ? "bg-green-50 text-green-500 border-green-100"
              : currentBid?.currentPrice &&
                currentBid?.byUserId !== session?.user.id &&
                status === "haggling"
              ? "bg-orange-50 text-orange-500 border-orange-100"
              : "bg-orange-50 border-gray-200"
          } border shadow`}
        >
          <div className="grid grid-cols-2 my-4 mx-4">
            <div className="flex items-center">
              <div className="relative">
                <div className="rounded-full w-6 h-6 md:w-8 md:h-8 ">
                  <span className="absolute top-0 right-0 inline-block w-3 h-3 bg-primary-red rounded-full"></span>
                  <Image
                    className="rounded-full"
                    src={
                      participant?.profile?.image
                        ? participant?.profile?.image
                        : participant?.id === listing?.sellerId || null
                        ? dog
                        : cat
                    }
                    alt=""
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              </div>
              <p className="ml-2 text-gray-800 text-sm xl:text-md font-bold">
                {participant?.username} {session?.user?.id === listing?.sellerId ? (
                  <span className="!font-medium text-orange-600 text-sm">
                   Buyer
                  </span>
                ) : (
                  <span className="!font-medium text-orange-600 text-sm">
                    Seller
                  </span>
                )}
              </p>
            </div>
            <div className="flex justify-end">
              <div className="inline-block font-semibold text-primary whitespace-nowrap leading-tight rounded-xl">
                <div className="text-sm">
                  {(events &&
                    events.length > 0 &&
                    events?.[0].event === "cancelled" &&
                    events?.[0].userId === participant.id) ||
                  (events &&
                    events.length > 0 &&
                    events?.[0].event === "approved" &&
                    events?.[0].userId === participant.id) ||
                  (events &&
                    events.length > 0 &&
                    events?.[0].event === "completed" &&
                    events?.[0].userId === participant.id) ||
                  (events &&
                    events.length > 0 &&
                    events?.[0].event === "accepted" &&
                    events?.[0].userId === participant.id) ? (
                    <div className="text-right">
                      <p className="text-xs ">
                        {events &&
                        events.length > 0 &&
                        events?.[0].event === "cancelled" &&
                        events?.[0].userId === participant.id
                          ? "Cancelled"
                          : events &&
                            events.length > 0 &&
                            events?.[0].event === "approved" &&
                            events?.[0].userId === participant.id
                          ? "Approved"
                          : events &&
                            events.length > 0 &&
                            events?.[0].event === "completed" &&
                            events?.[0].userId === participant.id
                          ? "Completed"
                          : events &&
                            events.length > 0 &&
                            events?.[0].event === "accepted" &&
                            events?.[0].userId === participant.id
                          ? "Accepted"
                          : ""}
                      </p>
                      <p className="text-xs">
                        {new Date(events?.[0].date).toLocaleString("en-GB")}
                      </p>
                    </div>
                  ) : participantLastBid?.price ? (
                    <div className="text-right">
                      <p className="text-xs text-gray-800">Latest Offer</p>{" "}
                      <span className="text-sm uppercase">{`£${Number(
                        participantLastBid?.price
                      ).toLocaleString("en-GB")}`}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-800">no offers yet</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      <PriceWidget
        status={status}
        currentBid={currentBid}
        listing={listing}
        bids={bids}
        setBids={setBids}
        setCurrentBid={setCurrentBid}
        setStatus={setStatus}
        events={events}
        handleStatusChange={handleStatusChange}
        handleUpdateDetails={updateListing}
      />

      {listing.buyerId === session?.user.id && status === "accepted" && (
        <div className="flex flex-col items-center gap-4 mt-4 w-full ">
          <StripeCheckout
            session={session}
            listing={{
              id: listing.id,
              price: Number(
                currentBid.currentPrice
                  ? currentBid.currentPrice
                  : listing.price
              ),
              title: listing.title,
              buyer: {
                id: listing.buyerId,
                username: listing.buyer.username,
              },
              seller: {
                id: listing.sellerId,
                username: listing.seller.username,
              },
              status: status,
              image:
                parsedImage && parsedImage[0]
                  ? parsedImage[0]
                  : "/images/cat.png",
            }}
            handleStatusChange={handleStatusChange}
          />
        </div>
      )}
      {toggleMenu.events && events && events.length > 0 && (
        <Card className="mt-6">
          {events.map((event) => (
            <div className="flex justify-between items-end border-b border-gray-200 py-2.5">
              <div className="flex items-start">
                <div className="relative">
                  <div className="rounded-full w-6 h-6 md:w-8 md:h-8 bg-white">
                    <span className="absolute top-0 right-0 inline-block w-3 h-3 bg-primary-red rounded-full"></span>
                    <Image
                      src={event.userId === listing?.seller.id ? dog : cat}
                      alt=""
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                </div>
                <div className="ml-2  text-sm xl:text-md flex flex-col">
                  <div className="text-gray-800 font-bold">{event.event}</div>
                  <div>
                    {" "}
                    {event.userId === listing?.seller.id
                      ? listing?.seller.username || "Unknown"
                      : listing?.buyer.username || "Unknown"}
                  </div>
                </div>
              </div>
              <div className="flex items-end">
                <div className="text-xs text-gray-500">
                  {new Date(event.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "2-digit",
                  })}
                </div>
                <div className="text-xs text-gray-500 ml-2">
                  {new Date(event.date).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}
        </Card>
      )}
      {toggleMenu.description && (
        <div
          className={`mt-6  border rounded-lg px-4 shadow  pt-6 pb-6 mb-6  gap-4 relative ${
            status === "rejected" || status === "cancelled"
              ? "bg-red-50  border-red-100"
              : status === "accepted" || status === "completed"
              ? "bg-green-50  border-green-100"
              : "bg-gray-50 border-gray-200"
          } `}
        >
          {listing.description &&
            listing.description.split("\n").map((paragraph, index) => (
              <p
                key={index}
                className="text-sm md:text-md lg:text-sm xl:text-md"
              >
                {paragraph}
              </p>
            ))}
        </div>
      )}
      {toggleMenu.summary && (
        <div
          className={`xl:hidden mt-6 grid grid-cols-1 md:grid-cols-2 border rounded-lg px-4 shadow  pt-6 pb-6 mb-6 auto-cols-fr gap-4 relative ${
            status === "rejected" || status === "cancelled"
              ? "bg-red-50  border-red-100"
              : status === "accepted" || status === "completed"
              ? "bg-green-50  border-green-100"
              : "bg-gray-50 border-gray-200"
          } `}
        >
          {status !== "cancelled" &&
            status !== "accepted" &&
            status !== "completed" && (
              <FaPencilAlt
                className=" mt-4 mr-2 absolute top-1 right-1 text-gray-600  border p-1 rounded-full bg-white border-gray-200 text-2xl"
                onClick={() =>
                  edit.onOpen(session?.user, listing, "item", options)
                }
              />
            )}
          <h5 className="col-span-2">Item details</h5>
          <div className="flex-1">
            <div className="flex gap-2">
              <CiMedicalCross className="w-6 h-6" />
              <div className="text-sm md:text-md lg:text-sm xl:text-md">
                <p className="font-bold">Type</p>
                <p className="capitalize text-xs">{listing.type} </p>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex gap-2">
              <CiMedicalCross className="w-6 h-6" />
              <div className="text-sm md:text-md lg:text-sm xl:text-md">
                <p className="font-bold">Condition</p>
                <p className="capitalize text-xs">
                  {options && options?.condition}{" "}
                </p>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex gap-2">
              <CiLocationOn className="w-6 h-6" />
              <div className="text-sm md:text-md lg:text-sm xl:text-md">
                <p className="font-bold">Location</p>
                <p className="capitalize text-xs">
                  {options && options?.location?.city
                    ? options.location?.city
                    : options?.location?.region
                    ? options.location?.region
                    : "Unknown"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex gap-2">
              <CiDeliveryTruck className="w-6 h-6" />
              <div className="text-sm md:text-medium lg:text-sm xl:text-medium">
                <p className="font-bold">Pickup</p>
                <p className="capitalize text-xs">
                  {options?.pickup === "both"
                    ? "Collection or Delivery"
                    : options?.pickup === "delivery"
                    ? "Delivery"
                    : options?.pickup === "pickup"
                    ? "Collection"
                    : "Unknown"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex gap-2">
              <CiDeliveryTruck className="w-6 h-6" />
              <div className="text-sm md:text-md lg:text-sm xl:text-md">
                <p className="font-bold">Private</p>
                <p className="capitalize text-xs">Yes</p>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex gap-2">
              <CiCalendar className="w-6 h-6" />
              <div className="text-sm md:text-md lg:text-sm xl:text-md">
                <p className="font-bold">Created</p>
                <p className="text-xs">
                  {" "}
                  {new Date(listing.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {status === "completed" && (
        <Button
          className="xl:hidden"
          primary
          options={{ size: "lg" }}
          isLoading={loadingState.contact}
          onClick={() => (
            handleFinalise(session?.user.id, participant?.id),
            setLoadingState((prev) => {
              return {
                ...prev,
                contact: true,
              };
            })
          )}
        >
          Contact {session?.user.id === listing?.sellerId ? "Buyer" : "Seller"}
        </Button>
      )}
    </div>
  );
};

export default OfferDetailsWidget;
