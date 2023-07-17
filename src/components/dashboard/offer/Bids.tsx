import { timeInterval, timeSince } from "@/utils/formatTime";
import { Bid } from "@prisma/client";
import Link from "next/link";
import React, { use, useEffect, useState } from "react";
import BidContainer from "./Bid";

interface BidsProps {
  bids: Bid[];
}

const Bids = ({ bids }: BidsProps) => {

    
  return (
    <>{bids?.map((bid: any) => <BidContainer key={bid.id} bid={bid} />).reverse()}</>
  );
};

export default Bids;
