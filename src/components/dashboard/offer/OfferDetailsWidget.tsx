import { Bid, Profile, Review, User } from "@prisma/client";
import Link from "next/link";
import Button from "../Button";
import PriceWidget from "@/components/widgets/PriceWidget";
import { FaPencilAlt, FaThumbsUp } from "react-icons/fa";
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
import dogTerminate from "@/images/dog-terminate.png";
import catAccept from "@/images/cat-accept.png";
import catTerminate from "@/images/cat-reject.png";
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
  listing,
  status,
  session,
  handleStatusChange,
  currentBid,
  setCurrentBid,
  setBids,
  setStatus,
  isLoading,
  completedBy,
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

  const edit = useOfferEditModal();
  const { options } = listing;

  const noBids = !meLastBid && !participantLastBid && status === "negotiating";
  const rejectedByMe = status === "rejected" && session?.user.id !== completedBy;
  const inNegotiation = status === "negotiating";

  const statusController = noBids || rejectedByMe || inNegotiation;

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
    listing.sellerId === session?.user.id ? listing.seller : listing.buyer;
  const nonSessionUser =
    listing.sellerId === session?.user.id ? listing.buyer : listing.seller;

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
            : " bg-orange-default border-gray-200" }
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
                <div className="rounded-full w-6 h-6 md:w-8 md:h-8 bg-white"></div>
                <span className="absolute top-0 right-0 inline-block w-3 h-3 bg-primary-red rounded-full"></span>
                <Image
                  src={
                    listing.seller.profile?.image
                      ? listing.seller.profile?.image
                      : dog
                  }
                  alt=""
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <p className="ml-2 !container text-gray-800 line-clamp-1 text-lg font-bold">
                You
              </p>
            </div>

            <div className="flex justify-end">
              <p className="inline-block font-semibold text-primary whitespace-nowrap leading-tight rounded-xl">
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
              </p>
            </div>
          </div>
        </Link>

        <div
          className={`relative inline-block duration-300 ease-in-out transition-transform transform hover:-translate-y-2 w-full shadow rounded-lg ${
            status === "rejected" || status === "cancelled"
              ? "bg-red-50 border-red-100"
              : status === "accepted" || status === "completed"
              ? "bg-green-50 border-green-100"
              : "bg-white border-gray-200"
          } border  shadow`}
        >
          <div className="p-4 flex gap-4 ">
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

          <div className="border-t border-gray-200 h-1 shadow-2xl mb-4" />
          <div className="md:hidden w-full flex justify-center mb-4">{StatusChecker(status)}</div> 
          <div className="px-6">
            <div className="text-lg -mb-3 font-bold text-center flex flex-col items-center ">
              {status === "rejected" ||
              status === "cancelled" ||
              status === "expired"
                ? "Last"
                : status === "completed" || status === "accepted"
                ? "Ageeed"
                : "Current"}{" "}
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
              >
                {currentBid.currentPrice == "0" ||
                  (currentBid.currentPrice == "" &&
                    listing.price === "0 " &&
                    `Open offer`)}
              </div>
            </div>

            <div className="-mt-2 flex justify-center gap-1 ">
              By
              <Link
                href={`/dashboard/profile/${currentBid.byUserId}`}
                className="underline ml-[2px]"
              >
                {currentBid.byUsername}
              </Link>
            </div>

            <div className="py-2 pt-6">
              <div className=" gap-2 text-sm  font-bold mb-6 items-start">
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
                        <div className="relative h-16 w-16 mx-6">
                          <Image
                            src={
                              session?.user?.id === listing.sellerId
                                ? catAccept
                                : dogAccept
                            }
                            alt="user"
                            className="rounded-xl"
                          />
                        </div>
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
                        <div className="relative h-16 w-16 mx-6">
                          <Image
                            src={
                              session?.user?.id === listing.sellerId
                                ? catTerminate
                                : dogTerminate
                            }
                            alt="user"
                            className=" rounded-xl"
                          />
                        </div>
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
            </div>
          </div>
        </div>
      </div>

      <div className="relative inline-block  w-full  rounded-lg mt-4 ">
        <div className="w-full flex justify-center">
          {bids &&
          bids[bids.length - 1]?.userId &&
          bids[bids.length - 1]?.userId === session?.user.id ? (
            <MdArrowCircleUp
              className={`text-[70px] md:text-[70px] lg:text-[90px] xl:text-[60px] xl:-mt-10 2xl:text-[70px] -my-10 md:-mt-14 z-10 rounded-full  ${
                status === "rejected" || status === "cancelled"
                  ? "bg-red-50 text-red-500 border-red-100"
                  : status === "accepted" || status === "completed"
                  ? "bg-green-50 text-green-400 border-green-100"
                  : "text-orange-default bg-gray-50 border-gray-200"
              } border  shadow`}
            />
          ) : bids &&
            bids[bids.length - 1]?.userId &&
            bids[bids.length - 1]?.userId !== session?.user.id ? (
            <MdArrowCircleDown
              className={`text-[70px] md:text-[70px] lg:text-[90px] xl:text-[60px] xl:-mt-10 2xl:text-[70px] -my-10 md:-mt-14 z-10 rounded-full ${
                status === "rejected" || status === "cancelled"
                  ? "bg-red-50 text-red-400 border-red-100"
                  : status === "accepted" || status === "completed"
                  ? "bg-green-50 text-green-400 border-green-100"
                  : "text-orange-default bg-gray-50 border-gray-200"
              } border shadow`}
            />
          ) : (
            <MdOutlineSwapVerticalCircle
              className={`text-[70px] md:text-[70px] lg:text-[90px] xl:text-[60px] xl:-mt-10 2xl:text-[70px] -my-10 md:-mt-14 z-10 rounded-full  ${
                status === "rejected" || status === "cancelled"
                  ? "bg-red-50 text-red-400 border-red-100"
                  : status === "accepted" || status === "completed"
                  ? "bg-green-50 text-green-400 border-green-100"
                  : "bg-gray-50 border-gray-200 text-orange-default"
              } border shadow`}
            />
          )}
        </div>
        <Link
          href={`/dashboard/profile/${participant?.id}`}
          className={`relative rounded-lg inline-block duration-300 ease-in-out transition-transform transform hover:-translate-y-2 w-full ${
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
                <div className="rounded-full w-6 h-6 md:w-8 md:h-8 "></div>
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
              <p className="ml-2 text-gray-800 line-clamp-1 text-lg font-bold">
                {participant?.username}
              </p>
            </div>
            <div className="flex justify-end">
              <p className="inline-block font-semibold text-primary whitespace-nowrap leading-tight rounded-xl">
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
              </p>
            </div>
          </div>
        </Link>
      </div>

      {statusController && (
        <div className="border border-orange-300 bg-orange-default px-4 pb-4 pt-1 rounded-xl shadow mt-6">
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
      {status !== "cancelled" &&
        status !== "accepted" &&
        status !== "completed" && (
          <div className="col-span-2 -mt-1 flex gap-2">
            <Button
              label="Terminate"
              cancel
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
