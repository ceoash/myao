import InfoCard from "./InfoCard";
import Link from "next/link";
import { useEffect, useState } from "react";
import { adviceArray } from "@/data/adviceData";
import { getTimeOfDay } from "@/utils/formatTime";

interface StatsProps {
  title: string | React.ReactNode;
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
  const [timeOfDay, setTimeOfDay] = useState<string | null>(null);


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
    setTimeOfDay(getTimeOfDay())
  },[])

  useEffect(() => {
    const advice = getRandomAdvice();
    if (advice.value) {
      setRandomAdvice(advice);
    }
  }, [adviceArray]) 

  getTimeOfDay();

  return (
    <div className="col-span-12 ">
      <div className="flex justify-between gap-2 items-start">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <Link href={`/dashboard/friends`} className="font-bold -mb-4 cursor-pointer">
          {friendsCount ? friendsCount : 0} Friend{friendsCount === 1 ? "" : "s"}
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InfoCard
          title={`${timeOfDay ? timeOfDay : "Welcome to your dashboard"}, ${username}`}
          button={{ label: "Create Offer", onClick: startOffer, options: {primary: true, size: "2xl"}, lg: true }}
          color={`orange`}
          className="bg-orange-100 flex justify-between"
        />
        {/* <InfoCard
          title={`Offers sent`}
          number={sent}
          icon={`/icons/cat-accept.png`}
          badge={sentPendingOffers ? `${sentPendingOffers} new` : "0 new"}
          color={`orange`}
          span={`col-span-1`}
          className="bg-orange-100"
          link="/dashboard/trades?sent=true"
        />
        <InfoCard
          title={`Offers Received`}
          number={received}
          icon={`/icons/dog-accept.png`}
          badge={receivedPendingOffers ? `${receivedPendingOffers} new` : "0 new"}
          color={`orange`}
          span={`col-span-1`}
          className="bg-orange-100"
          link="/dashboard/trades?sent=true"
        /> */}
        {/* <InfoCard
          key={randomAdvice.key + Math.floor(Math.random() * 1000)}
          title={randomAdvice.key}
          text={randomAdvice?.value?.advice || "Loading..."}
          color={`purple`}
          className="bg-purple-100"
          button={{label: "Learn More", onClick: () => {setRandomAdvice(getRandomAdvice())}}}
        /> */}
      </div>
    </div>
  );
};

export default Stats;
