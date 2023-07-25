import React, { Dispatch, SetStateAction, use, useEffect, useRef, useState } from 'react';
import Input from '../inputs/Input';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Button from '../dashboard/Button';
import { ErrorResponse } from '../modals/UserSearchModal';
import { io, Socket } from 'socket.io-client';
import { config } from '@/config';
import { toast } from 'react-hot-toast';
import { set } from 'date-fns';
import { Bid, User } from '@prisma/client';
import { randomInt } from 'crypto';
import PriceInput from '../inputs/PriceInput';
import { da } from 'date-fns/locale';

interface PriceWidgetProps {
  listing: any;
  isBuyer?: boolean;
  socketRef: React.MutableRefObject<Socket | undefined>;
  setCurrentBid: Dispatch<SetStateAction<{
    currentPrice: string;
    byUserId: string;
    byUsername: string;
    me: Bid;
    participant: Bid;
  }>>;
  currentBid?: any;
  bids?: any;
  sessionUser: any
  setBids: Dispatch<SetStateAction<Bid[]>>;
  setStatus: Dispatch<SetStateAction<string>>;
  status: string;
}

const PriceWidget = ({ listing, setBids, bids, setCurrentBid, currentBid, sessionUser, socketRef, status, setStatus }: PriceWidgetProps) => {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bidPrice, setBidPrice] = useState<string | null>(null);
  const [currentBids, setCurrentBids] = useState<any>([]);

  const currentPrice = currentBid.currentPrice;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      price: '0',
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data: any) => {
    setIsLoading(true);

    console.log("data", data);

    data.id = listing.id;
    data.bid = parseFloat(data.price);
    data.status = 'counterOffer';
    data.bidById = session?.user.id;

    if(data.price == currentPrice) {
      toast.error("You can't bid the same price as the current bid!");
      setIsLoading(false);
      return;
    }


    try {
      const response = await axios.post("/api/submitBid", {
        price: data.price,
        id: data.id,
        userId: session?.user.id,
      });
      const updatedListing: any | ErrorResponse = response.data.listing;
      const transactions : any | ErrorResponse = response.data.transactionResult;

      if ('error' in updatedListing) {
        console.log("Bid not updated:", updatedListing.error);
      } else {
        console.log("Bid updated:", updatedListing);
        const myLastBid = updatedListing.bids.find(
          (bid: any) => bid.userId === session?.user.id
        );

        setCurrentBid((prev) => {
          const newBid = {
          ...prev,
          currentPrice: updatedListing.bids && updatedListing.bids.length > 0 && updatedListing.bids[0].price || 0,
          byUserId: sessionUser?.id,
          byUsername: sessionUser?.username || "",
          me: myLastBid,
          }
          return newBid;
        });
        const now = Date.now();
        let newBid: Bid;
        
        
        const userId = sessionUser?.id
        const username = sessionUser?.username
        const price = data.price
        const listingId = listing.id
        const previous = currentBid.currentPrice

        socketRef.current?.emit('update_bid', {price, userId, username, listingId, previous});
        socketRef.current?.emit('update_activities', {
          activities: transactions,
          participant1Id: updatedListing.sellerId,
          participant2Id: updatedListing.buyerId,
        });
        toast.success("Bid submitted!");
      }

      reset();
    } catch (err) {
      console.log("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className='mb-4'>
        <PriceInput id='price' placeholder={"0.00"} label='' formatPrice required register={register} />
      </div>
      <div className='flex justify-center'>

      <Button primary options={{ size: "lg"}} isLoading={isLoading} label={currentBid.byUserId === session?.user.id ? "UPADTE BID" : "BID"} onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className='flex'  />
      </div>
    </div>
  );
};

export default PriceWidget;
