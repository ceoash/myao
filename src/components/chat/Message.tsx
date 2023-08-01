import { timeInterval, timeSince } from "@/utils/formatTime";
import Link from "next/link";
import { useEffect, useState, forwardRef } from "react";
import { BiDotsVerticalRounded, BiStar } from "react-icons/bi";
import Button from "../dashboard/Button";
import { MdDoNotDisturb } from "react-icons/md";
import { FaCheck, FaTimes, FaTrash } from "react-icons/fa";
import StatusChecker from "@/utils/status";

type MessageProps = {
  message: any;
  session: any;
  chat?: boolean;
};

const MessageComponent = forwardRef<HTMLDivElement, MessageProps>(
  ({ message, session, chat }, ref) => {
    const [timeSinceCreated, setTimeSinceCreated] = useState<string | null>(
      null
    );


    useEffect(() => {
      const createdAt = new Date(message.createdAt);
      timeInterval(createdAt, setTimeSinceCreated);
    }, [message.createdAt]);

    if (message.listingId) {
      return (
        <>
          {message.listingId && (
            <div className="col-span-12 flex justify-center items-center py-4">
              <div className="hidden lg:block border-b border-b-gray-200 h-2 flex-1"></div>
              <div className="px-4">
                <div className="font-bold flex gap-2 items-center">
                  <div className="rounded-full p-1 bg-orange-200 text-white">
                    {
                      message.user.id === session.user.id ? <img src="/images/cat.png" className="w-6 p-[1px]" /> : <img src="/images/dog.png" className="w-6 p-[1px]" />
                    }
                    
                  </div>
                  <div className="text-gray-500">
                    {message.user.id === session.user.id
                      ? "You created a offer"
                      : "You received a offer"}
                  </div>
                  <Link href={`/dashboard/offers/${message.listing?.id}`}>
                    <div className="text-orange-300 hover:underline text-sm">
                      View offer
                    </div>
                  </Link>
                </div>
              </div>
              <div className="border-b hidden lg:block border-gray-200 h-2 flex-1"></div>
            </div>
          )}
          <div
            ref={ref}
            className={`flex gap-2 w-1/2 ${
              message.user.id === session.user.id
                ? "justify-end ml-auto"
                : "justify-start mr-auto"
            }`}
          >
            <Link
              href={`/dashboard/profile/${message.user.id}`}
              className="flex items-center justify-end h-10 w-10 rounded-full text-white flex-shrink-0"
            >
              <img
                src={
                  message?.user?.profile?.image ||
                  "/images/placeholders/avatar.png"
                }
                className="rounded-full border-2 border-gray-200 p-1"
              />
            </Link>
            <div
              className={` py-2 px-4 rounded-lg  ${
                message.user.id === session.user.id
                  ? " bg-orange-200 text-gray-700"
                  : " bg-gray-100 text-gray-700"
              }`}
            >
              <div
                className={`${
                  message.listingId && "lg:grid grid-cols-12 gap-4"
                }`}
              >
                <Link
                  href={`/dashboard/offers/${message.listing?.id}`}
                  className="col-span-4"
                >
                  {message?.image && !message.listingId && (
                    <div className="my-2">
                      <img
                        src={`${message.image}`}
                        className="w-full rounded-lg"
                      />
                    </div>
                  )}
                  {message.listingId && (
                    <div className="my-2">
                      <img
                        src={`${
                          message.image ? message.image : "/images/cat.png"
                        }`}
                        className="w-full rounded-lg"
                      />
                    </div>
                  )}
                </Link>
                {message.listingId && (
                  <div className="flex flex-col  col-span-8">
                    <div className="flex justify-between font-bold items-center">
                      <Link href={`/dashboard/offers/${message.listing?.id}`}>
                        <div className="mt-2 first-letter:uppercase">
                          {message?.listing.title || "unkown title"}
                        </div>
                      </Link>
                      <div className="md:text-lg lg:text-2xl">
                        £
                        {message?.listing.bids
                          ? message.listing.bids[ message.listing.bids.length - 1 ].price
                          : message.listing.price}
                      </div>
                    </div>
                    <div className="flex flex-col h-full justify-between">
                    <div className="text-sm mt-1">{StatusChecker(message?.listing?.status) }</div>

                      
                      <div className="flex justify-between mb-4 mt-4 lg:mt-auto">
                        <div className="flex gap-2 items-center font-bold text-sm">
                          <img
                            src={
                              message?.listing.sellerId === session.user.id
                                ? message?.listing.buyer?.profile?.image
                                : message?.listing.seller?.profile?.image ||
                                  "/images/placeholders/avatar.png"
                            }
                            className="rounded-full border border-orange-50 bg-orange-50 p-[1px] w-[30px] h-[30px] obj"
                          />
                          <p>
                            {message?.listing.sellerId === session.user.id
                              ? message?.listing.buyer?.username
                              : message?.listing.seller?.username ||
                                "unkown user"}
                          </p>
                        </div>
                     
                      </div>
                    </div>
                  </div>
                )}
                {!message.listingId && message?.text && (
                  <p className="text-sm">{message.text}</p>
                )}
                {!message.listingId && (
                  <div className="text-xs text-gray-500 flex col-span-8">
                    <i>{timeSinceCreated}</i>
                  </div>
                )}
              </div>
            </div>
          </div>
          { !message.listingId && (
            <div className={`w-1/2 text-xs text-gray-500 flex ${ message?.user.id === session?.user.id ? "justify-end ml-auto" : "justify-start" } -mt-2`}>
            <i>{timeSinceCreated}</i>
          </div>
          )}
        </>
      );
    }

    return (
      <div
        ref={ref}
        className={`flex gap-2 w-1/2 ${
          message.user.id === session.user.id
            ? "justify-end ml-auto"
            : "justify-start mr-auto"
        }`}
      >
        <div className="flex items-center justify-end h-10 w-10 rounded-full text-white flex-shrink-0">
          <img
            src={
              message?.user?.profile?.image || "/images/placeholders/avatar.png"
            }
            className="rounded-full border-2 border-gray-200 p-1"
          />
        </div>
        <div
          className={` py-2 px-4 rounded-lg  ${
            message.user.id === session.user.id
              ? " bg-orange-200 text-gray-700"
              : " bg-gray-100 text-gray-700"
          }`}
        >
          <div className="font-bold">
            {message.user.id === session.user.id ? (
              "You"
            ) : (
              <Link href={`/dashboard/profile/${message.user?.username}`}>
                {message.user?.username}
              </Link>
            )}
          </div>
          <div>
            {message?.image && (
              <div>
                <img src={message.image} className="w-full" />
              </div>
            )}

            {message?.type !== "offer" && message?.text && (
              <p className="text-sm">{message.text}</p>
            )}
            <div className="text-xs text-gray-500">
              <i>{timeSinceCreated}</i>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default MessageComponent;
