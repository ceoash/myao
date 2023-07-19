import { timeInterval, timeSince } from "@/utils/formatTime";
import { Bid } from "@prisma/client";
import Link from "next/link";
import React, { use, useEffect, useState } from "react";
import BidContainer from "./Bid";

interface BidsProps {
  bids: Bid[];
}

const Bids = ({ bids }: BidsProps) => {

  const [localBids, setLocalbids] = useState<any>([]);

  console.log("bids", bids);

  useEffect(() => {
    const reversedBids = [...bids].reverse();
    setLocalbids(reversedBids);
  }, [bids]);

    
  return (
    <>{bids?.map((bid: any) => <BidContainer key={bid.id} bid={bid} />).reverse()}</>
  );
};

export default Bids;
