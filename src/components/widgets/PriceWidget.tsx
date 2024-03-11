import axios from 'axios';
import Button from '../dashboard/Button';
import PriceInput from '../inputs/PriceInput';
import { Dispatch, SetStateAction, useState } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Bid } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useSocketContext } from '@/context/SocketContext';
import { Session } from 'next-auth';
import Spinner from '../Spinner';
import useDataModal from '@/hooks/useDataModal';

interface PriceWidgetProps {
  listing: any;
  status: string;
  events: any;
  currentBid: {
    currentPrice: string | number;
    byUserId: string;
    byUsername: string;
    me: {
      name?: string;
      price: string | number;
      previous: string | number;
    }
    participant: {
      name?: string;
      price: string | number;
      previous: string | number;
    }
  };
  bids: Bid[];
  setBids: Dispatch<React.SetStateAction<Bid[]>>;
  setCurrentBid: any;
  setStatus: Dispatch<React.SetStateAction<string>>;
  handleStatusChange: (status: string, userId: string) => void;
  handleUpdateDetails: (listing: {
    title?: string;
    description?: string;
    price?: number;
    category?: string;
    subcategory?: string;
  }) => void;

}

export interface ErrorResponse {
  error: string;
}

const PriceWidget = ({ listing,
  currentBid,
  status,
  bids,
  setBids,
  events,
  handleStatusChange,
  handleUpdateDetails, }: PriceWidgetProps) => {

  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bid, setBid] = useState<null | number>(null);
  const socket = useSocketContext();

  const modal = useDataModal();
  const currentPrice = currentBid.currentPrice;

  const updateInitialOffer = async () => {
    setIsLoading(true);
    if (bid === null) {
      toast.error("Please enter a offer price");
      return;
    }
    handleUpdateDetails({ price: bid  });
    setBid(null);
    setIsLoading(false);
  }

  const updateBid = async (num: number | string | null) => {
    if (num === null) {
      toast.error("Please enter a offer price");
      return;
    }
    if (typeof num === "string") {
      num = parseFloat(num);
    }
    if (num === 0) {
      toast.error("Please enter a offer price");
      return;
    }

    if (num === currentBid.currentPrice) {
      toast.error("You can't submit the same price as the current offer!");
      return;
    }

    if (listing.buyerId === session?.user.id && currentBid?.participant?.price && typeof currentBid?.participant.price === "number" && num > currentBid.participant.price ) {
      toast.error(`You can not submit a offer higher than £${currentBid.participant.price}!`);
      return;
    }

    if (listing.sellerId === session?.user.id && currentBid?.participant?.price && typeof currentBid?.participant.price === "number" && num < currentBid.participant.price) {
      toast.error(`You can not submit a offer lower £${currentBid.participant.price}!`);
      return;
    }

    let data = {
      price: num,
      id: listing.id,
      status: "counterOffer",
    };
    setIsLoading(true);

    try {
      setIsLoading(true);
      const response = await axios.post("/api/submitBid", {
        price: data.price,
        id: data.id,
        userId: session?.user.id,
      });
      const updatedListing: any | ErrorResponse = response.data.listing;
      const transactions: any | ErrorResponse = response.data.transactionResult;

      if ("error" in updatedListing) {
        toast.error("Offer not updated");
        setIsLoading(false);
      } else {
        const myLastBid = updatedListing.bids.find(
          (bid: any) => bid.userId === session?.user.id
        );

        const userId = session?.user?.id;
        const username = session?.user?.username;
        const price = data.price;
        const listingId = listing.id;
        const previous = currentBid.currentPrice;
        const sellerId = listing?.sellerId || "";
        const buyerId = listing?.buyerId || "";

        socket.emit("update_bid", {
          price: num,
          userId,
          username,
          listingId,
          previous,
          buyerId,
          sellerId,
        });

        toast.success("New offer submitted!");
      }
      setIsLoading(false);
      setBid(null);
    } catch (err) {
      console.log("Something went wrong!");
    }
    setIsLoading(false);
  };

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      updateBid(bid);
    }
  };

  return (
    events &&
      events.length > 0 &&
      events[0].event !== "cancelled" &&
      events[0].event !== "completed" &&
      events[0].event !== "accepted" ? (
        <div className="flex justify-between border rounded-lg border-orange-300 shadow  p-2 bg-orange-200">
          <div className='w-full'>
            <div className="flex rounded divide-x bg-orange-200 border border-orange-100">
              <span className="p-2 px-3 text-md text-orange-500 mr-1">£</span>
              <input
                type="number"
                disabled={isLoading}
                className="w-full  px-2 hover:outline outline-orange-300 rounded-l "
                placeholder="0.00"
                value={bid ? bid : ""}
                onChange={(e) => setBid(Number(e.target.value) > 0 ? Number(e.target.value) : null)}
                onKeyDown={handleKeyDown}
              />
              {bids.length > 0 ? (
                <button
                  onClick={() => updateBid(bid)}
                  disabled={isLoading}
                  className="whitespace-nowrap p-2 px-3 text-sm hover:opacity-80 text-white bg-gradient-to-b from-orange-300 to-orange-400 rounded-r"
                >
                  {isLoading ? (
                    <Spinner />
                  ) : currentBid.byUserId === session?.user?.id ? (
                    "Update Offer"
                  ) : (
                    "Counter Offer"
                  )}
                </button>
              ) : listing?.user?.id === session?.user?.id ? (
                <button
                  disabled={isLoading}
                  onClick={() => updateBid(bid)}
                  className="whitespace-nowrap p-2 px-3 text-sm hover:opacity-80 text-white bg-gradient-to-b from-orange-300 to-orange-400 rounded-r"
                >
                  {isLoading ? <Spinner /> : "Update Offer"}
                </button>
              ) : (
                <button
                  disabled={isLoading}
                  onClick={() => updateBid(bid)}
                  className="whitespace-nowrap p-2 px-3 text-sm hover:opacity-80 text-white bg-gradient-to-b from-orange-300 to-orange-400 rounded-r"
                >
                  {isLoading ? <Spinner /> : "Counter"}
                </button>
              )}
            </div>
          </div>

          {status !== "cancelled" &&
            status !== "accepted" &&
            status !== "completed" && (
              <div className="flex justify-end">
                <button
                  disabled={isLoading}
                  onClick={() =>
                    handleStatusChange("cancelled", session?.user.id)
                  }
                  className="p-2 rounded whitespace-nowrap px-4  bg-gradient-to-b from-red-400 to-red-600 text-white  hover:opacity-80 border border-red-100 border-l-0 "
                >
                  Terminate
                </button>
              </div>
            )}
        </div>
      ) : ( listing.userId === session?.user.id && status === "awaiting approval" ?
      (
      <div className="flex  justify-between   p-2 rounded-lg border-orange-300 shadow  bg-orange-200">
        <div className='w-full'>
          <div className="flex rounded  divide-x bg-gray-50">
            <span className="p-2 px-3">£</span>
            <input
              type="number"
              className="w-full  px-2"
              placeholder="0.00"
              value={bid ? bid : ""}
              disabled={isLoading}
              onChange={(e) => setBid(Number(e.target.value) > 0 ? Number(e.target.value) : null)}
            />
              <button
                onClick={updateInitialOffer}
                disabled={isLoading}
                className="whitespace-nowrap p-2 px-3 text-sm bg-gradient-to-b from-orange-400 to-orange-600 text-white  hover:opacity-80 border border-red-100 border-l-0"
              >
                {isLoading ? (
                  <Spinner />
                ) : "Update Offer" }
               
              </button>
            
          </div>
        </div>
        

        <div className="flex justify-end">
          <button
             onClick={() =>
              handleStatusChange("cancelled", session?.user.id)
            }
            disabled={isLoading}
            className=" rounded whitespace-nowrap px-4 bg-gradient-to-b from-red-400 to-red-600 text-white  border border-red-100 border-l-0 hover:opacity-80  "
          >
            Terminate
          </button>
        </div>
    
      </div>
    ) : null )

  );
};

export default PriceWidget;
