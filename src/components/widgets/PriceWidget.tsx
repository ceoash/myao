import React, { Dispatch, SetStateAction, use, useEffect, useRef, useState } from 'react';
import Input from '../inputs/Input';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Button from '../Button';
import { ErrorResponse } from '../modals/UserSearchModal';
import { io, Socket } from 'socket.io-client';
import { config } from '@/config';
import { toast } from 'react-hot-toast';
import { set } from 'date-fns';
import { Bid, User } from '@prisma/client';
import { randomInt } from 'crypto';
import PriceInput from '../inputs/PriceInput';

interface PriceWidgetProps {
  listingId: string;
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
  me: any
  setBids: Dispatch<SetStateAction<Bid[]>>;
}

const PriceWidget = ({ listingId, setBids, bids, setCurrentBid, currentBid, me, socketRef }: PriceWidgetProps) => {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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

    data.id = listingId;
    data.bid = parseFloat(data.price);
    data.status = 'counterOffer';
    data.bidById = session?.user.id;


    try {
      const response = await axios.post("/api/submitBid", {
        price: data.price,
        listingId: listingId,
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
          byUserId: me.id,
          byUsername: me.username || "",
          me: myLastBid,
          }
          return newBid;
        });
        const now = Date.now();
        let newBid: Bid;
        
        setBids((prev) => {
          let temporaryId = (Math.random() + 1).toString(36).substring(7);
            newBid = {
            id: temporaryId,
            price: data.price,
            userId: session?.user.id,
            listingId: listingId,
            previous: prev[prev.length - 1]?.price,
            createdAt: new Date(now),
            updatedAt: new Date(now),
          }
          const newBids = [ ...prev, newBid];
          return newBids;
        });
        const userId = me.id
        const username = me.username
        const price = data.price

        socketRef.current?.emit('update_bid', {price, userId, username, listingId});
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
      <div className='mb-2'>
        <PriceInput id='price' placeholder={"0.00"} label='' formatPrice required register={register} />
      </div>
      <Button label='Make your offer' onClick={handleSubmit(onSubmit)} disabled={isSubmitting} />
    </div>
  );
};

export default PriceWidget;
