import React, { use, useEffect, useRef, useState } from 'react';
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

interface PriceWidgetProps {
  listingId: string;
  onBidPriceChange: (updatedBidPrice: string) => void;
  bid: string | null;
  isBuyer?: boolean;
  onBidderChange?: (bidder: string) => void;
  currentPrice?: string;
  bids?: any;
}

const PriceWidget = ({ listingId, onBidPriceChange, bid, bids, onBidderChange, currentPrice }: PriceWidgetProps) => {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bidPrice, setBidPrice] = useState<string | null>(null);
  const socketRef = useRef<Socket>();
  const [currentBids, setCurrentBids] = useState<any>([]);

  useEffect(() => {
    setCurrentBids(bids);
  }, [bids]);

  useEffect(() => {
    socketRef.current = io(config.PORT);
    socketRef.current.emit('join_room', listingId);
    socketRef.current.on('update_bidPrice', (newBidPrice: string | null) => {
      console.log(`Updating bid price to ${newBidPrice}`);
      setBidPrice(newBidPrice);
    });
    
    return () => {
      socketRef.current?.emit('leave_room', listingId);
      socketRef.current?.off('update_bidPrice');
      socketRef.current?.disconnect();
    };
  }, [listingId]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data: any) => {
    setIsLoading(true);

    data.id = listingId;
    data.bid = parseFloat(data.price);
    data.status = 'counterOffer';
    data.bidById = session?.user.id;

    try {
      const response = await axios.post("/api/submitBid", data);
      console.log("data", data);
      const updatedListing: any | ErrorResponse = response.data.listing;
      const transactions : any | ErrorResponse = response.data.transactionResult;
      console.log("notifications", transactions);
      console.log("response", response.data);

      if ('error' in updatedListing) {
        console.log("Bid not updated:", updatedListing.error);
       
      } else {
        console.log("Bid updated successfully:", updatedListing);
        onBidPriceChange(updatedListing.bid !== null ? updatedListing.bid.toString() : null);
        if (onBidderChange) {
          onBidderChange(updatedListing.bidder);
        }

        const previousBid = currentBids[currentBids.length - 1].price;

        socketRef.current?.emit('update_bidPrice', {
          newBidPrice: updatedListing.bid !== null ? updatedListing.bid.toString() : null,
          listingId,
          updatedBidder: updatedListing.bidder,
          previousPrice: previousBid,
        });
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
        <Input id='price' placeholder='0.00' label='' formatPrice required register={register} />
      </div>
      <Button label='Make your offer' onClick={handleSubmit(onSubmit)} disabled={isSubmitting} />
    </div>
  );
};

export default PriceWidget;
