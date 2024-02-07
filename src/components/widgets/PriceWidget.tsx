import axios from 'axios';
import Button from '../dashboard/Button';
import PriceInput from '../inputs/PriceInput';
import { Dispatch, SetStateAction, useState } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Bid } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useSocketContext } from '@/context/SocketContext';

interface PriceWidgetProps {
  listing: any;
  isBuyer?: boolean;
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

export interface ErrorResponse {
  error: string;
}

const PriceWidget = ({ listing, setCurrentBid, currentBid, sessionUser, status }: PriceWidgetProps) => {

  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentPrice = currentBid.currentPrice;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      price: '',
    },
  });

  const socket = useSocketContext();

  const onSubmit: SubmitHandler<FieldValues> = async (data: any) => {
    setIsLoading(true);
    data.id = listing.id;
    data.bid = parseFloat(data.price);
    data.status = 'counterOffer';
    data.bidById = session?.user.id;

    if(data.price == currentPrice) {
      toast.error("You can't bid the same price as the current bid!");
      setIsLoading(false);
      return;
    }
    if(data.price == "") {
      toast.error("Enter a bid price");
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
        console.log("Offer not updated:", updatedListing.error);
      } else {

        const myLastBid = updatedListing.bids.find((bid: any) => bid.userId === session?.user.id);

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
        
        const userId = sessionUser?.id
        const username = sessionUser?.username
        const price = data.price
        const listingId = listing.id
        const previous = currentBid.currentPrice
        const sellerId = listing.sellerId
        const buyerId = listing.buyerId

        socket.emit('update_bid', { price, userId, username, listingId, previous, buyerId, sellerId });
        socket.emit('update_activities', 
          transactions,
          updatedListing.sellerId,
          updatedListing.buyerId,
        );
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
        <PriceInput 
          sidebar
          id='price' 
          placeholder={"0.00"} 
          label='' 
          formatPrice 
          register={register} 
          status={status}
          registerOptions={{
            pattern: {
              value: /^\d+(\.\d{1,2})?$/,
              message: "Please enter a valid price (up to two decimal places)"
            }
          }} 
        />
      </div>
      <div className='flex justify-center'>
        <Button 
          primary={ status === 'rejected' ? false : true } 
          cancel={ status === 'rejected' ? true : false } 
          className={'!border-0 flex'} 
          options={{ 
            size: "lg" 
          }}  
          isLoading={isLoading} 
          label={ 
            currentBid && 
            currentBid.currentPrice && 
            currentBid.currentPrice !== "0" && 
            currentBid.currentPrice !== "" && 
            currentBid.byUserId === session?.user.id ? "UPDATE OFFER" : currentBid && currentBid.byUserId !== session?.user.id ? "COUNTER OFFER" : "PLACE OFFER"
          } 
          onClick={handleSubmit(onSubmit)} 
          disabled={isSubmitting}   />
      </div>
    </div>
  );
};

export default PriceWidget;
