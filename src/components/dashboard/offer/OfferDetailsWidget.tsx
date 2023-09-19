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
  MdArrowCircleDown,
  MdArrowCircleUp,
  MdOutlineSwapVerticalCircle,
} from "react-icons/md";
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

interface OfferDetailsWidgetProps {
  listing: CustomListing;
  status: string;
  session: any;
  timeSinceCreated: string | null;
  bids: any;
  me: any;
  participant: any;
  events: {
    id: string;
    event: string;
    date: string;
    userId: string;
    price: string;
  }[];
  isLoading?: boolean;
  handleFinalise: (userId: string, participantId: string) => void;
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
  setBids,
  setStatus,
  setCurrentBid,
  setLoadingState,
  handleFinalise,
  handleStatusChange,
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

  const owner = bids.length > 0 && bids[bids.length - 1].userId === session?.user.id || listing.sellerId === listing.userId ? listing.seller : listing.buyer;
  const receiver = bids.length > 0 && bids[bids.length - 1].userId === listing.sellerId ? listing.buyer : listing.seller || listing.sellerId === listing.userId ? listing.buyer : listing.seller;
 
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

  const sessionUser = listing.sellerId === session?.user.id ? listing.seller : listing.buyer;

  if (listing?.image) {
    parsedImage = JSON.parse(listing?.image || "");
  }


  return (
    <div className={`
        w-full
        rounded-lg
        border
        p-4
        border-gray-200
        ${ status === "rejected" || status === "cancelled"
            ? "bg-red-100  border-red-50"
            : status === "accepted" || status === "completed"
            ? "bg-green-100 border-green-50"
            : " bg-orange-default border-gray-200"
        }
        `}
    >
      <div className="relative mx-auto w-full">
        <Link
          href={`/dashboard/profile/${session?.user.id}`}
          className={`relative rounded-lg inline-block duration-300 ease-in-out transition-transform transform hover:-translate-y-2 w-full shadow mb-4 
        ${
          status === "rejected" || status === "cancelled"
            ? "bg-red-50 text-red-500 border-red-100"
            : status === "accepted" || status === "completed"
            ? "bg-green-50 text-green-500 border-green-100"
            : "bg-gray-50 border-gray-200"
        } border  shadow`}
        >
          <div className="grid grid-cols-2 my-4 mx-4">
            <div className="flex items-center">
              <div className="relative">
                <div className="rounded-full w-6 h-6 md:w-8 md:h-8 bg-white">
                  <span className="absolute top-0 right-0 inline-block w-3 h-3 bg-primary-red rounded-full"></span>
                  <Image
                    src={
                      listing.seller.profile?.image
                        ? listing.seller.profile?.image
                        : dog
                    }
                    className="rounded-full"
                    alt=""
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              </div>
              <p className="ml-2 !container text-gray-800 text-md xl:text-md font-bold">
                You {/*  {session?.user?.id} - {events && events[0]?.userId} */} {session?.user.id === listing.sellerId ? <span className="!font-medium text-gray-600 text-sm"> (seller)</span> : <span className="!font-medium text-gray-600 text-sm"> (buyer)</span>}
              </p>
            </div>

            <div className="flex justify-end">
              <div className="inline-block font-semibold text-primary whitespace-nowrap leading-tight rounded-xl">
                <span className="text-sm">
                  {meLastBid?.price ? (
                    <div className="text-right">
                      <p className="text-xs text-gray-800">Latest Bid</p>{" "}
                      <span className="text-sm uppercase">{`£${Number(
                        meLastBid?.price
                      ).toLocaleString()}`}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-800">no offers yet</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </Link>

        <div className="w-full flex justify-center">
          {bids &&
            bids[bids.length - 1]?.userId &&
            bids[bids.length - 1]?.userId === session?.user.id && (
              <MdArrowCircleDown
                className={`text-[70px] md:text-[70px] lg:text-[70px] xl:text-[60px] xl:-mt-10 2xl:text-[70px] -my-10 md:-mt-14 z-10 rounded-full ${
                  status === "rejected" || status === "cancelled"
                    ? "bg-red-50 text-red-400 border-red-100"
                    : status === "accepted" || status === "completed"
                    ? "bg-green-50 text-green-400 border-green-100"
                    : "text-orange-default bg-gray-50 border-gray-200"
                } border shadow`}
              />
            )}
        </div>

        <div
          className={`relative inline-block duration-300 ease-in-out transition-transform transform hover:-translate-y-2 w-full shadow rounded-lg ${
            status === "rejected" || status === "cancelled"
              ? "bg-red-50 border-red-100"
              : status === "accepted" || status === "completed"
              ? "bg-green-50 border-green-100"
              : "bg-white border-gray-200"
          } border  shadow`}
        >
          <div className="p-4 flex md:hidden gap-4 ">
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

              <div className="-mt-4 flex items-start justify-between flex-1">
                <p className=" text-sm  line-clamp-1">{listing.category}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 h-1 shadow-2xl mb-4 lg:mt-4 lg:border-0" />
         
          <div className="md:hidden w-full flex justify-center mb-4">
            {StatusChecker(status)}
          
          </div>
          <div className="px-6">
            <div className="text-lg -mb-3 font-bold text-center flex flex-col items-center ">
              {status === "rejected" ||
              status === "cancelled" ||
              status === "expired"
                ? "Last" + " "
                : status === "completed" || status === "accepted"
                ? "Ageeed" + " "
                : !currentBid.currentPrice ||
                  currentBid.currentPrice == "" ?
                  ( currentBid.currentPrice == "0" &&
                    (listing.price === "" || listing.price === "0"
                      && "Open" + " "
                      )): "Current" + " " }
              offer
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
              ></div>
            </div>

            <div className="-mt-2 text-center">
              <div className="flex justify-center gap-1 ">
                <span>By</span>
                <Link
                  href={`/dashboard/profile/${currentBid.byUserId}`}
                  className="underline ml-[2px]"
                >
                  {currentBid.byUsername === session?.user?.username
                    ? "You"
                    : currentBid.byUsername || ""}
                </Link>
              </div>



              {!currentBid.currentPrice ||
                currentBid.currentPrice == "" ||
                currentBid.currentPrice == "0" ? ( listing.price === "" ||
                listing.price === "0" && (
                  <p className="block w-full mt-4 italic">
                    {listing.userId === session?.user?.id
                      ? `Awaiting bid from ${participant?.username || ""}`
                      : "Enter a bid to start negotiating"}
                  </p>
                )) : currentBid.byUserId !== session?.user?.id && status === "negotiating" ? (
                  <p className="block w-full mt-4 italic">Would you like to accept?</p>

                ) : ( status === "negotiating"  ? (
                  <p className="block w-full mt-4 italic">
                    Awaiting response from {participant?.username || ""}
                  </p>) : ""
                )}
            </div>

            { bids && bids.length > 0 && bids[bids.length - 1]?.userId !== session?.user?.id
            && (
              <>
              <div className="py-2 ">
                <div className=" gap-2 text-sm  font-bold mb-2 items-start">
                  <div className="w-2/3 flex gap-2 mx-auto justify-center">
                    {status === "negotiating" && (
                      <>
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
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              </>
            ) }
            {!bids && listing.userId !== session?.user?.id && listing.price !== "" && listing.price !== "0" 
            && (
              <>
              <div className="py-2 ">
                <div className=" gap-2 text-sm  font-bold mb-2 items-start">
                  <div className="w-2/3 flex gap-2 mx-auto justify-center">
                    {status === "negotiating" && (
                      <>
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
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              </>
            ) }
            { status === "awaiting approval" &&
              listing.userId !== session?.user?.id ? (
              <div className="flex justify-center gap-2 mb-8 w-full mt-4">
                <Button
                  options={{ primary: true, size: "lg" }}
                  isLoading={loadingState.negotiating}
                  onClick={() =>
                    handleStatusChange("negotiating", session?.user.id)
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
              <div className="mb-8"></div>
            )}
          </div>
        </div>
      </div>
    
      <div className="relative inline-block  w-full  rounded-lg mt-4 ">
        <div className="w-full flex justify-center">
          {currentBid &&
            currentBid.byUserId &&
            currentBid.byUserId === participant.id && (
              <MdArrowCircleUp
                className={`text-[70px] md:text-[70px] lg:text-[70px] xl:text-[60px] xl:-mt-10 2xl:text-[70px] -my-10 md:-mt-14 z-10 rounded-full  ${
                  status === "rejected" || status === "cancelled"
                    ? "bg-red-50 text-red-500 border-red-100"
                    : status === "accepted" || status === "completed"
                    ? "bg-green-50 text-green-400 border-green-100"
                    : "text-orange-default bg-gray-50 border-gray-200"
                } border  shadow`}
              />
            )}
          {!bids ||
            (bids.length === 0 && (
              <MdOutlineSwapVerticalCircle
                className={`text-[70px] md:text-[70px] lg:text-[70px] xl:text-[60px] xl:-mt-10 2xl:text-[70px] -my-10 md:-mt-10 z-10 rounded-full -mb-6  ${
                  status === "rejected" || status === "cancelled"
                    ? "bg-red-50 text-red-400 border-red-100"
                    : status === "accepted" || status === "completed"
                    ? "bg-green-50 text-green-400 border-green-100"
                    : "bg-gray-50 border-gray-200 text-orange-default"
                } border shadow`}
              />
            ))}
        </div>
        <Link
          href={`/dashboard/profile/${participant?.id}`}
          className={`relative rounded-lg inline-block duration-300 ease-in-out transition-transform text-md lg:text-lg transform hover:-translate-y-2 w-full ${
            status === "rejected" || status === "cancelled"
              ? "bg-red-50 text-red-500 border-red-100"
              : status === "accepted" || status === "completed"
              ? "bg-green-50 text-green-500 border-green-100"
              : "bg-gray-50 border-gray-200"
          } border shadow`}
        >
          <div className="grid grid-cols-2 my-4 mx-4">
            <div className="flex items-center">
              <div className="relative">
                <div className="rounded-full w-6 h-6 md:w-8 md:h-8 ">
                  <span className="absolute top-0 right-0 inline-block w-3 h-3 bg-primary-red rounded-full"></span>
                  <Image
                    src={
                      listing.buyer.profile?.image
                        ? listing.buyer.profile?.image
                        : cat
                    }
                    alt=""
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              </div>
              <p className="ml-2 text-gray-800 text-sm xl:text-md font-bold">
                {participant?.username}
              </p>
            </div>
            <div className="flex justify-end">
              <div className="inline-block font-semibold text-primary whitespace-nowrap leading-tight rounded-xl">
                <span className="text-sm">
                  {participantLastBid?.price ? (
                    <div className="text-right">
                      <p className="text-xs text-gray-800">Latest Bid</p>{" "}
                      <span className="text-sm uppercase">{`£${Number(
                        participantLastBid?.price
                      ).toLocaleString()}`}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-800">no offers yet</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {events &&
        events.length > 0 &&
        ((status === "rejected" &&
          events[0].userId === session?.user?.id) ||
          (events[0].event !== "completed" &&
            events[0].event !== "accepted" && (
              <div
                className={`border ${
                  status === "rejected"
                    ? "border-red-300 bg-red-200"
                    : "border-orange-300 bg-orange-default"
                }  px-4 pb-4 pt-1 rounded-xl shadow mt-6`}
              >
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
            )))}

      {/* <div className="mt-6 space-x-2">
        <Button primary={toggleMenu.summary} onClick={() => setToggleMenu({description: false, events: false, summary: true})} label="Summary" options={{size: "xs"}} />
        <Button primary={toggleMenu.description} onClick={() => setToggleMenu({description: true, events: false, summary: false})} label="Description" options={{size: "xs"}} />
        <Button primary={toggleMenu.events} onClick={() => setToggleMenu({description: false, events: true, summary: false})} label="Events" options={{size: "xs"}} />
      </div> 
 */}
      {toggleMenu.events && events && events.length > 0 && (
        <Card className="mt-6">
          {events.map((event) => (
            <div className="flex justify-between items-end border-b border-gray-200 py-2.5">
              <div className="flex items-start">
                <div className="relative">
                  <div className="rounded-full w-6 h-6 md:w-8 md:h-8 bg-white">
                    <span className="absolute top-0 right-0 inline-block w-3 h-3 bg-primary-red rounded-full"></span>
                    <Image
                      src={
                        event.userId === listing.seller.id
                          ?  dog
                          :  cat
                      }
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
                    {event.userId === listing.seller.id
                      ? listing.seller.username
                      : listing.buyer.username}
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
          className={`mt-6 grid grid-cols-1 md:grid-cols-2 border rounded-lg px-4 shadow  pt-6 pb-6 mb-6 auto-cols-fr gap-4 relative ${
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
      {status !== "cancelled" &&
        status !== "accepted" &&
        status !== "completed" && (
          <div className="col-span-2 -mt-1 flex gap-2">
            <Button
              label="TERMINATE"
              cancel
              options={{ size: "lg" }}
              onClick={() => handleStatusChange("cancelled", session?.user.id)}
            />
          </div>
        )}
      {status === "accepted" && (
        <div className="flex flex-col items-center gap-4 mt-4 w-full">
          {listing.buyerId === session?.user.id && status === "accepted" && (
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
          Contact {session?.user.id === listing.sellerId ? "Buyer" : "Seller"}
        </Button>
      )}
    </div>
  );
};

export default OfferDetailsWidget;
