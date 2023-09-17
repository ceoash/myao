import BidContainer from "./Bid";
import { Bid } from "@prisma/client";

interface BidsProps {
  bids: Bid[];
  participant: any;
  me: any;
}

const Bids = ({ bids, participant, me }: BidsProps) => {

  if (!participant || !me) return null;
    
  return (
    <>
    
    {bids.length === 0 ? <span>No bids yet</span> : bids?.map((bid: any) => <BidContainer key={bid.id} bid={bid} participant={participant} me={me} />).reverse()}
    </>
  );
};

export default Bids;
