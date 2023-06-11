import React, { useState } from 'react'
import Input from '../inputs/Input'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import useOfferModal from '@/hooks/useOfferModal';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Button from '../Button';
import { ErrorResponse } from '../modals/UserSearchModal';
import { Listing } from '@prisma/client';

interface PriceWidgetProps {
  listingId: string;
  onBidPriceChange: (updatedBidPrice: string | null) => void;
  bid: string | null;
}

const PriceWidget = ({listingId, onBidPriceChange, bid}: PriceWidgetProps) => {

  const { data: session, status } = useSession(); // Get the session and status from next-auth/react

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bidPrice, setBidPrice] = useState<string | null>(bid);

  const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
      } = useForm<FieldValues>({
        defaultValues: {
          email: "",  
        },
      });

      

      const onSubmit: SubmitHandler<FieldValues> = async (data: any) => {

       
       
        if (status === "authenticated" && session?.user) {
          data.buyerId = session.user.id;
          console.log("User authenticated");
        
        } else {
          // Handle the case when the user is unauthenticated or the session doesn't contain the user object
          // For example, you can redirect the user to the login page or show an error message
          console.log("User is not authenticated");
          return;
        }
        setIsLoading(true);

        data.id = listingId;
        data.bid = parseFloat(data.price);
        data.status = 'counterOffer';

        await axios
      .post("/api/submitBid", data)
      .then((response) => {
        const updatedListing: Listing | ErrorResponse = response.data;

        if ("error" in updatedListing) {
          // Handle error response
          console.log("Bid not updated:", updatedListing.error);
        } else {
          // Handle successful response
          console.log("Bid updated successfully:", updatedListing);

          // Update the bid price in the parent component using the onBidPriceChange callback
          onBidPriceChange(updatedListing.bid !== null ? updatedListing.bid.toString() : null);
        }

        reset();
      })
      .catch((err) => {
        console.log("Something went wrong!");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  return (
    <div>
      <h5 className='text-sm md:text-md'>COUNTER OFFER</h5>
      <div className='mb-2'>
      <Input id={'price'} placeholder="£ 0.00" label="" formatPrice required register={register} />
      </div>
      <Button label='Save bid' onClick={handleSubmit(onSubmit)}  disabled={isSubmitting}  />
    </div>
  )
}

export default PriceWidget