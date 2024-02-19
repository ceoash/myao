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
    
    {bids.length === 0 ? <div className="p-4 px-5 ">No offers yet</div> : bids?.map((bid: any) => <BidContainer key={bid.id} bid={bid} participant={participant} me={me} />).reverse()}
    </>
  );
};

export default Bids;
