import useOfferEditModal from "@/hooks/useOfferEditModal";
import { Session } from "next-auth";
import Link from "next/link";
import { Dispatch } from "react";
import { FaPencilAlt } from "react-icons/fa";

interface HeaderProps {
  listing: any;
  session: Session;
  status: string;
  currentBid: {
    currentPrice: string;
    byUserId: string;
    byUsername: string;
  };
}

const Header = ({ listing, currentBid, status, session }: HeaderProps) => {
  const edit = useOfferEditModal();
  const parsedImage = listing.image && JSON.parse(listing.image);
  return (
    <div className="flex mb-6 justify-between relative bg-white rounded-xl border border-gray-200 p-4 md:pb-0 lg:pb-4 overflow-hidden">
      <div className="flex gap-2 xl:mb-4">
        <div className=" relative rounded-lg  w-20 h-14 overflow-hidden">
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

        <div className="">
          <div className="text-gray-900 text-xl  md:text-2xl  font-bold first-letter:uppercase w-full relative">
            {listing.title}
          </div>
          <div className=" w-full text-gray-500 relative mr-4 text-sm -mt-0.5">
            {listing.category}
          </div>
        </div>
      </div>

      <div className="gap-2 justify-between hidden md:flex mb-6 lg:mb-0">
        <div className="block">
          {currentBid.currentPrice &&
            currentBid.currentPrice !== "" &&
            currentBid.currentPrice !== "0" && (
              <div className="text-right text-sm">
                {status === "accepted" ? (
                  <div className="mb-0.5">Agreed price</div>
                ) : (
                  <div className="text-right mb-0.5">
                    Bid by
                    <Link
                      href={`/dashboard/profile/${currentBid.byUserId}`}
                      className="underline ml-[2px]"
                    >
                      {currentBid.byUsername}
                    </Link>
                  </div>
                )}
              </div>
            )}
          <div className="font-extrabold md:text-lg lg:text-xl xl:text-2xl text-right -mt-0.5 ">
            {currentBid.currentPrice &&
            currentBid.currentPrice !== "0" &&
            currentBid.currentPrice !== "" ? (
              `£${Number(
                currentBid.currentPrice === "0" ||
                  currentBid.currentPrice === ""
                  ? "0.00"
                  : currentBid.currentPrice
              ).toLocaleString()}`
            ) : (listing.price !== "" && listing.price !== "0") ||
              status === "cancelled" ||
              status === "rejected" ? (
              `£${Number(
                listing.price === "0" ||
                  listing.price === "" ||
                  listing.price === 0
                  ? "0.00"
                  : listing.price
              ).toLocaleString()}`
            ) : (
              <span className="inline-flex items-center bg-orange-100 text-gray-800 text-sm  mr-2 px-2.5 py-0.5 rounded-full ">
              <span className="w-2 h-2 mr-1 bg-orange-400 rounded-full"></span>
              Open offer
            </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
