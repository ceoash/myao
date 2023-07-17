import { Bid, Listing, Profile, User } from "@prisma/client";
import Link from "next/link";
import Button from "../Button";
import PriceWidget from "@/components/widgets/PriceWidget";
import StatusChecker from "@/utils/status";
import { BiCalendar, BiCategoryAlt } from "react-icons/bi";
import { color } from "html2canvas/dist/types/css/types/color";
import { FaThumbsUp } from "react-icons/fa";

interface SafeUser extends User {
  profile: Profile;
}

interface SafeListing extends Listing {
  seller: SafeUser;
  buyer: SafeUser;
  bidder: SafeUser;
}

interface OfferDetailsWidgetProps {
  listing: SafeListing;
  status: string;
  session: any;
  bidder: SafeUser;
  bidPrice: string;
  timeSinceCreated: string | null;
  bids: any;
  me: any;
  participant: any;
  handleStatusChange: (status: string, userId: string) => void;
  handleBidPriceChange: (updatedBidPrice: string) => void;
  setBidder: (bidder: string) => void;
}
const OfferDetailsWidget = ({
  listing,
  status,
  session,
  bidder,
  bidPrice,
  timeSinceCreated,
  handleStatusChange,
  handleBidPriceChange,
  setBidder,
  me,
  participant,
  bids,
}: OfferDetailsWidgetProps) => {

  let parsedImage
  if (listing?.image){
    parsedImage = JSON.parse(listing?.image || "");
  }
  

  const meLastBid = [...bids].reverse().find((bid: Bid) => bid.userId === session.user.id);
  const participantLastBid = [...bids].reverse().find((bid: Bid) => bid.userId !== session.user.id);

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
          <Link
            href={"/dashboard/profile/" + me.id}
            className="cursor-pointer"
          >
            <div className="">
              <div className="flex gap-3">
                <span className="w-[50px] lg:w-1/5">
                  <img
                    src={
                      me?.profile?.image
                        ? me?.profile?.image
                        : "/images/placeholders/avatar.png"
                    }
                    alt="user avatar"
                    className="rounded-full border border-gray-200"
                  />
                </span>
                <div className="w-full">
                  <div className="capitalize font-bold text-2xl flex justify-between items-center">
                    You{" "}
                    <img
                      src={
                        listing.seller.id === me.id
                          ? "/images/dog.png"
                          : "/images/cat.png"
                      }
                      alt=""
                      className="h-6 "
                    />
                  </div>
                  <div className=" flex gap-2 text-[12px]  xl:text-[14px] text-gray-600">
                    {listing.userId === me.id && (
                      <div>Start price: £{listing.price}</div>
                    )}
                    <div>Last bid: £{meLastBid ? meLastBid.price : 0}</div>
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
                      src={parsedImage && parsedImage[0] ? parsedImage[0] : "/images/cat.png"}
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
              href={`/dashboard/profile/${listing.bidderId}`}
              className="underline ml-[2px]"
            >
              {bids.length > 0 ? bids[bids.length - 1].user.username : listing.bidder.username}
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
              £{bids.length > 0 ? bids[bids.length - 1].price : listing.price}
            </div>
            {/* 
                    <div>
                      {bidder.id === listing.buyer.id &&
                      session?.user.id === bidder.id ? (
                        <img src="/images/cat.png" className="h-6" />
                      ) : (
                        <img src="/images/dog.png" className="h-6" />
                      )}
                    </div>
                    */}
          </div>
          {listing.status && (
            <div className="flex justify-center pb-2 rounded-xl mb-2">
              {StatusChecker(listing.status)}
            </div>
          )}
        </div>
        {status === "negotiating" && (
          <div>
            <div className="flex justify-center gap-2 text-sm text-white font-bold mb-6 items-start">
              {bidder.id !== session?.user.id && (
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
              <div className="flex flex-col justify-center w-1/3">
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
            </div>
            <div className="">
              <PriceWidget
                listingId={listing.id}
                onBidPriceChange={() => handleBidPriceChange}
                bid={bidPrice}
                isBuyer={listing.buyer.id === session?.user.id}
                onBidderChange={setBidder}
                bids={bids}
              />
            </div>
          </div>
        )}
       
        {status === "awaiting approval" &&
          listing.userId !== session?.user?.id && (
            <div className="flex justify-center gap-2 mb-4">
              <Button
                options={{ primary: true }}
                onClick={() =>
                  handleStatusChange("negotiating", session?.user.id)
                }
              >
                <div className="flex gap-1 items-center">
                  <div>
                    <FaThumbsUp />
                  </div>
                  <div>Let's haggle</div>
                </div>
              </Button>
              <Button cancel link={`#`} className="" />
            </div>
          )}
      </div>
      <div className="bg-white p-4 mt-4 rounded-lg border border-white shadow">
      <Link
            href={"/dashboard/profile/" + participant.id}
            className="cursor-pointer"
          >
            <div className="">
              <div className="flex gap-3">
                <span className="w-[50px] lg:w-1/5">
                  <img
                    src={
                      participant?.profile?.image
                        ? participant?.profile?.image
                        : "/images/placeholders/avatar.png"
                    }
                    alt="user avatar"
                    className="rounded-full border border-gray-200"
                  />
                </span>
                <div className="w-full">
                  <div className="capitalize font-bold text-2xl flex justify-between items-center">
                    {participant.username}
                    <img
                      src={
                        listing.seller.id === participant.id
                          ? "/images/dog.png"
                          : "/images/cat.png"
                      }
                      alt=""
                      className="h-6 "
                    />
                  </div>
                  <div className=" flex gap-2 text-[12px]  xl:text-[14px] text-gray-600 ">
                    {listing.userId === participant.id && (
                      <div>Start price: £{listing.price}</div>
                    )}
                    <div>Last bid: £{participantLastBid ? participantLastBid.price : 0}</div>
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
