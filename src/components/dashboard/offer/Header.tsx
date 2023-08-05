import Link from 'next/link'

interface HeaderProps {
    title: string;
    category: string;
    price: string;
    status: string;
    currentBid: {
        currentPrice: string;
        byUserId: string;
        byUsername: string;
    };
}

const Header = ({title, category, currentBid, price, status}: HeaderProps) => {
  return (
    <div className="md:flex md:justify-between mb-2">
          <div>
            <div className="text-gray-900 text-xl  md:text-2xl  font-bold first-letter:uppercase ">
              {title}
            </div>
            <div className="  text-gray-500">{category}</div>
            <div className="px-4 mt-2"></div>
          </div>
          <div className="hidden md:block">
            {currentBid.currentPrice && currentBid.currentPrice !== "" && currentBid.currentPrice !== "0"  && (
              <div className="text-right text-sm">
                {status === "accepted" ? (
                  <div>Agreed price</div>
                ) : (
                  <div className="text-right ">
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
            <div className="font-extrabold text-3xl text-right -mt-2">
              {currentBid.currentPrice && currentBid.currentPrice !== '0' && currentBid.currentPrice !== ''
                ? `£ ${currentBid.currentPrice}`  :  price !== "" &&  price !== "0" ? `£ ${price}` : <h5 className="underline mt-2">Open Offer</h5>}
            </div>
          </div>
        </div>
  )
}

export default Header