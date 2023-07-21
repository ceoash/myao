import { timeInterval, timeSince } from "@/utils/formatTime";
import { Bid } from "@prisma/client";
import Link from "next/link";
import React, { use, useEffect, useState } from "react";
import BidContainer from "./Bid";

interface BidsProps {
  bids: Bid[];
  participant: any;
  me: any;
}

const Bids = ({ bids, participant, me }: BidsProps) => {

  if (!participant || !me) return null;
    
  return (
    <>{bids?.map((bid: any) => <BidContainer key={bid.id} bid={bid} participant={participant} me={me} />).reverse()}</>
  );
};

export default Bids;
