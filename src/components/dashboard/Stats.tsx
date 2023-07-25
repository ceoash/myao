import React, { useEffect, useState } from "react";
import InfoCard from "./InfoCard";
import Link from "next/link";
import { Listing } from "@prisma/client";
import { adviceArray } from "@/data/adviceData";
import { set } from "date-fns";

interface StatsProps {
  title: string;
  totalStats: number;
  startOffer: () => void;
  friendsCount?: number;
  sentOffers?: number;
  receivedOffers?: number;
  sentPendingOffers?: number;
  receivedPendingOffers?: number;
  username?: string;
}

const Stats = ({
  title,
  totalStats,
  startOffer,
  friendsCount,
  sentOffers,
  receivedOffers,
  sentPendingOffers,
  receivedPendingOffers,
  username,
}: StatsProps) => {
  const categories: (
    | "Staying Safe"
    | "Fraud Prevention"
    | "Engagement"
    | "Random"
  )[] = ["Staying Safe", "Fraud Prevention", "Engagement", "Random"];
  const sent = sentOffers;
  const received = receivedOffers

  const [randomAdvice, setRandomAdvice] = useState({ key: "", value: { id: 0, advice: "Loading..." } });

  function getRandomAdvice() {
    function getRandomItem(array: any[]) {
      if(!array || array.length === 0) {
        return null; 
      }
      const randomIndex = Math.floor(Math.random() * array.length);
      return array[randomIndex];
    }


    const randomCategoryKey = getRandomItem(categories);
    const randomAdvice = adviceArray[randomCategoryKey] ? getRandomItem(adviceArray[randomCategoryKey]) : null;
    return {key: randomCategoryKey, value: randomAdvice, id: randomAdvice?.id};
  }

  useEffect(() => {
    const advice = getRandomAdvice();
    if (advice.value) {
      setRandomAdvice(advice);
    }
  }, [adviceArray]) 

  
  return (
    <div className="col-span-8">
      <div className="flex justify-between gap-2 items-start">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <Link href={`/dashboard/friends`} className="font-bold -mb-4 cursor-pointer">
          {friendsCount ? friendsCount : 0} Friend{friendsCount === 1 ? "" : "s"}
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InfoCard
          title={`Good day, ${username}`}
          button={{ label: "Create Offer", onClick: startOffer }}
          color={`green`}
          className="bg-green-100"
        />
        <InfoCard
          title={`Offers sent`}
          number={sent}
          icon={`/icons/cat-accept.png`}
          badge={sentPendingOffers ? `${sentPendingOffers} new` : "0 new"}
          color={`orange`}
          span={`col-span-1`}
          className="bg-orange-100"
        />
        <InfoCard
          title={`Offers Received`}
          number={received}
          icon={`/icons/dog-accept.png`}
          badge={receivedPendingOffers ? `${receivedPendingOffers} new` : "0 new"}
          color={`orange`}
          span={`col-span-1`}
          className="bg-orange-100"
        />
        <InfoCard
          key={randomAdvice.key + Math.floor(Math.random() * 1000)}
          title={randomAdvice.key}
          text={randomAdvice?.value?.advice || "Loading..."}
          color={`purple`}
          className="bg-purple-100"
          button={{label: "Learn More", onClick: () => {setRandomAdvice(getRandomAdvice())}}}
        />
      </div>
    </div>
  );
};

export default Stats;
