import useOfferEditModal from '@/hooks/useOfferEditModal';
import { Session } from 'next-auth';
import Link from 'next/link'
import { Dispatch } from 'react';
import { FaPencilAlt } from 'react-icons/fa';

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

const Header = ({listing, currentBid, status, session}: HeaderProps) => {
  const edit = useOfferEditModal()
  return (
    <div className="flex md:mx-1 mt-6 justify-between mb-2 relative pb-4 md:pb-8">
          <div>
            <div className="text-gray-900 text-xl  md:text-2xl  font-bold first-letter:uppercase w-full relative">
              {listing.title}
            </div>
            <div className=" w-full text-gray-500 relative mr-4">
              {listing.category}
              </div>
          </div>
          <div className='flex gap-2 justify-between'>

          

          
          <div className="block">
            {currentBid.currentPrice && currentBid.currentPrice !== "" && currentBid.currentPrice !== "0"  && (
              <div className="text-right text-sm">
                {status === "accepted" ? (
                  <div className='mb-0.5'>Agreed price</div>
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
            <div className="font-extrabold md:text-lg lg:text-xl xl:text-2xl xl:-mt-1.5 text-right ">
              {currentBid.currentPrice && currentBid.currentPrice !== '0' && currentBid.currentPrice !== ''
                ? `£${Number(currentBid.currentPrice === '0' || currentBid.currentPrice === ''  ? '0.00' : currentBid.currentPrice).toLocaleString()}`  :  listing.price !== "" &&  listing.price !== "0" || status === "cancelled" || status === "rejected" ? `£${Number(listing.price === '0' || listing.price === '' || listing.price === 0 ? '0.00' : listing.price).toLocaleString()}` : <div className="p-1 rounded-lg text-sm border-lg border border-gray-200 bg-gray-50 mt-2 text-orange-alt">Open Offer</div>}
            </div>
          </div>
          
          </div>
        </div>
  )
}

export default Header