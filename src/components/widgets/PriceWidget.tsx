import React, { useEffect, useRef, useState } from 'react';
import Input from '../inputs/Input';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Button from '../Button';
import { ErrorResponse } from '../modals/UserSearchModal';
import { io, Socket } from 'socket.io-client';
import { config } from '@/config';

interface PriceWidgetProps {
  listingId: string;
  onBidPriceChange: (updatedBidPrice: string | null) => void;
  bid: string | null;
  isBuyer?: boolean;
  onBidderChange?: (bidder: string) => void;
}

const PriceWidget = ({ listingId, onBidPriceChange, bid, isBuyer, onBidderChange }: PriceWidgetProps) => {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bidPrice, setBidPrice] = useState<string | null>(bid);
  const socketRef = useRef<Socket>();

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
      const updatedListing: any | ErrorResponse = response.data;

      if ('error' in updatedListing) {
        console.log("Bid not updated:", updatedListing.error);
       
      } else {
        console.log("Bid updated successfully:", updatedListing);
        onBidPriceChange(updatedListing.bid !== null ? updatedListing.bid.toString() : null);
        if (onBidderChange) {
          onBidderChange(updatedListing.bidder);
        }
  
        socketRef.current?.emit('update_bidPrice', {
          newBidPrice: updatedListing.bid !== null ? updatedListing.bid.toString() : null,
          listingId
        });
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
      <h5 className='text-sm md:text-md'>{isBuyer === false ? "NEW" : "COUNTER"} OFFER</h5>
      <div className='mb-2'>
        <Input id='price' placeholder='£ 0.00' label='' formatPrice required register={register} />
      </div>
      <Button label='Send bid' onClick={handleSubmit(onSubmit)} disabled={isSubmitting} />
    </div>
  );
};

export default PriceWidget;
