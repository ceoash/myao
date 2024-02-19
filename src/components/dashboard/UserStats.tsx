import Image from "next/image";
import Skeleton from "react-loading-skeleton";
import Button from "./Button";
import { BiStar } from "react-icons/bi";
import { useEffect, useState } from "react";

interface UserStatsProps {
  userLoading: boolean;
  participant: any;
  id: string;
  startPrice: number;
}

const percentageChange = (oldValue: number, newValue: number) => {
  const change = ((newValue - oldValue) / oldValue) * 100;
  return change.toFixed(0);
}

const UserStats = ({ userLoading, participant, id, startPrice }: UserStatsProps) => {
  const [stats, setStats] = useState<{
    higestOffer: number;
    lowestOffer: number;
    lastOffer: number;
    count: number;
    trustScore: number;
  } | null>({
    higestOffer: 0,
    lowestOffer: 0,
    lastOffer: 0,
    count: 0,
    trustScore: 0,
  });

  const lastOfferPercentage = percentageChange(startPrice, stats?.lastOffer || 0);
  const highestOfferPercentage = percentageChange(startPrice, stats?.higestOffer || 0);
  const lowestOfferPercentage = percentageChange(startPrice, stats?.lowestOffer || 0);


  const fetchStats = async () => {
    let api = `/api/listings/userStats?id=${id}&userId=${participant?.id}`;
    const res = await fetch(api);
    const data = await res.json();

    console.log(data)
    setStats((prev) => ({ ...prev, ...data }));
    return data;
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-2 auto-cols-fr gap-2 z-10 bg-white border-x border-b rounded-b">
      <div className="flex flex-col p-6 items-center col-span-2 lg:col-span-1">
        <div className="p-4 w-24 h-24 rounded-full relative">
          {userLoading ? (
            <Skeleton
              circle
              width={70}
              height={70}
              className=" border p-1 border-gray-200 rounded-full"
            />
          ) : (
            <Image
              src={
                participant?.profile?.image
                  ? participant?.profile.image
                  : `/images/placeholders/avatar.png`
              }
              className="border p-1 border-gray-200 rounded-full"
              alt="Avatar"
              style={{ objectFit: "cover" }}
              width={70}
              height={70}
            />
          )}
        </div>
        <div className="px-4 text-center">
          <h4>
            {userLoading ? <Skeleton width={100} height={16} /> : participant?.username}
          </h4>
          <div className="text-xl text-gray-400 mb-4">
            <BiStar className="inline-block text-orange-500" />
            <BiStar className="inline-block text-orange-500" />
            <BiStar className="inline-block text-orange-500" />
            <BiStar className="inline-block text-orange-500" />
            <BiStar className="inline-block text-orange-500" />
          </div>
          {participant?.profile?.bio && (
            <>
              <p className="font-bold">Member since</p>
              <p className="mb-4">
                {new Date(participant?.createdAt).toLocaleDateString("en-gb", {
                  dateStyle: "long",
                })}
              </p>
            </>
          )}
          <div className="mb-4">
            {participant?.averageResponseTime && (
              <p>
                Average response time:{" "}
                {userLoading ? (
                  <Skeleton width={30} />
                ) : (
                  participant?.averageResponseTime
                )}
              </p>
            )}
            {participant?.averageCompletionTime && (
              <p>
                Average completion time:{" "}
                {userLoading ? (
                  <Skeleton width={30} />
                ) : (
                  participant?.averageCompletionTime || 0
                )}
              </p>
            )}
          </div>
          <div className="flex gap-1 w-full justify-center">
            <Button
              link={`/dashboard/profile/${participant?.id}`}
              label={`Profile`}
            />
            <Button
              link={`/dashboard/profile/${participant?.id}`}
              label={`Report`}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 mb-auto gap-4 mt-6 mr-6 text-gray-500">
        <div className="border rounded-2xl px-6 py-2">
          <p className="text-sm font-semibold  mb-2">Counter Offers</p>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl mb-0 leading-9 font-bold ">
              {stats?.count}
            </h2>
            
          </div>
        </div>
        <div className="border rounded-2xl px-6 py-2">
          <p className="text-sm font-semibold  mb-2">Last Offer</p>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl mb-0 leading-9 font-bold ">
              £{stats?.lastOffer}
            </h2>
            <div className="flex items-center gap-1">
              <p className="text-xs leading-[18px] ">{lastOfferPercentage || 0}%</p>
              {Number(lastOfferPercentage) > 0 ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8.45488 5.60777L14 4L12.6198 9.6061L10.898 7.9532L8.12069 10.8463C8.02641 10.9445 7.89615 11 7.76 11C7.62385 11 7.49359 10.9445 7.39931 10.8463L5.36 8.72199L2.36069 11.8463C2.16946 12.0455 1.85294 12.0519 1.65373 11.8607C1.45453 11.6695 1.44807 11.3529 1.63931 11.1537L4.99931 7.65373C5.09359 7.55552 5.22385 7.5 5.36 7.5C5.49615 7.5 5.62641 7.55552 5.72069 7.65373L7.76 9.77801L10.1766 7.26067L8.45488 5.60777Z"
                  fill="#1C1C1C"
                ></path>
              </svg>
              ) : (
                <svg
                width="16"
                height="16"
                className="rotate-180"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8.45488 5.60777L14 4L12.6198 9.6061L10.898 7.9532L8.12069 10.8463C8.02641 10.9445 7.89615 11 7.76 11C7.62385 11 7.49359 10.9445 7.39931 10.8463L5.36 8.72199L2.36069 11.8463C2.16946 12.0455 1.85294 12.0519 1.65373 11.8607C1.45453 11.6695 1.44807 11.3529 1.63931 11.1537L4.99931 7.65373C5.09359 7.55552 5.22385 7.5 5.36 7.5C5.49615 7.5 5.62641 7.55552 5.72069 7.65373L7.76 9.77801L10.1766 7.26067L8.45488 5.60777Z"
                  fill="#1C1C1C"
                ></path>
              </svg>
              )}
            </div>
          </div>
        </div>
        <div className="border rounded-2xl px-6 py-2">
          <p className="text-sm font-semibold  mb-2">Highest Offer</p>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl mb-0 leading-9 font-bold ">
              £{stats?.higestOffer}
            </h2>
            <div className="flex items-center gap-1">
              <p className="text-xs leading-[18px] ">{highestOfferPercentage || 0}%</p>
              {Number(highestOfferPercentage) > 0 ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8.45488 5.60777L14 4L12.6198 9.6061L10.898 7.9532L8.12069 10.8463C8.02641 10.9445 7.89615 11 7.76 11C7.62385 11 7.49359 10.9445 7.39931 10.8463L5.36 8.72199L2.36069 11.8463C2.16946 12.0455 1.85294 12.0519 1.65373 11.8607C1.45453 11.6695 1.44807 11.3529 1.63931 11.1537L4.99931 7.65373C5.09359 7.55552 5.22385 7.5 5.36 7.5C5.49615 7.5 5.62641 7.55552 5.72069 7.65373L7.76 9.77801L10.1766 7.26067L8.45488 5.60777Z"
                  fill="#1C1C1C"
                ></path>
              </svg>
              ) : (
                <svg
                width="16"
                height="16"
                className="rotate-180"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8.45488 5.60777L14 4L12.6198 9.6061L10.898 7.9532L8.12069 10.8463C8.02641 10.9445 7.89615 11 7.76 11C7.62385 11 7.49359 10.9445 7.39931 10.8463L5.36 8.72199L2.36069 11.8463C2.16946 12.0455 1.85294 12.0519 1.65373 11.8607C1.45453 11.6695 1.44807 11.3529 1.63931 11.1537L4.99931 7.65373C5.09359 7.55552 5.22385 7.5 5.36 7.5C5.49615 7.5 5.62641 7.55552 5.72069 7.65373L7.76 9.77801L10.1766 7.26067L8.45488 5.60777Z"
                  fill="#1C1C1C"
                ></path>
              </svg>
              )}
             
            </div>
          </div>
        </div>
        <div className="border rounded-2xl px-6 py-2">
          <p className="text-sm font-semibold  mb-2">Lowest Offer</p>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl mb-0 leading-9 font-bold ">
              £{stats?.lowestOffer}
            </h2>
            <div className="flex items-center gap-1">
            <p className="text-xs leading-[18px] ">{lowestOfferPercentage || 0}%</p>
            {Number(lowestOfferPercentage) > 0 ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8.45488 5.60777L14 4L12.6198 9.6061L10.898 7.9532L8.12069 10.8463C8.02641 10.9445 7.89615 11 7.76 11C7.62385 11 7.49359 10.9445 7.39931 10.8463L5.36 8.72199L2.36069 11.8463C2.16946 12.0455 1.85294 12.0519 1.65373 11.8607C1.45453 11.6695 1.44807 11.3529 1.63931 11.1537L4.99931 7.65373C5.09359 7.55552 5.22385 7.5 5.36 7.5C5.49615 7.5 5.62641 7.55552 5.72069 7.65373L7.76 9.77801L10.1766 7.26067L8.45488 5.60777Z"
                  fill="#1C1C1C"
                ></path>
              </svg>
              ) : (
                <svg
                width="16"
                height="16"
                className="rotate-180"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8.45488 5.60777L14 4L12.6198 9.6061L10.898 7.9532L8.12069 10.8463C8.02641 10.9445 7.89615 11 7.76 11C7.62385 11 7.49359 10.9445 7.39931 10.8463L5.36 8.72199L2.36069 11.8463C2.16946 12.0455 1.85294 12.0519 1.65373 11.8607C1.45453 11.6695 1.44807 11.3529 1.63931 11.1537L4.99931 7.65373C5.09359 7.55552 5.22385 7.5 5.36 7.5C5.49615 7.5 5.62641 7.55552 5.72069 7.65373L7.76 9.77801L10.1766 7.26067L8.45488 5.60777Z"
                  fill="#1C1C1C"
                ></path>
              </svg>
              )}
          </div>
        </div>
        </div>
      </div>
      {/* <div className="flex flex-col pb-4 md:p-4 gap-3 col-span-2 lg:col-span-1">
        <div className="text-center">
          <h3>Stats</h3>
        </div>
        <div>
          
        </div>
        <div className="text-center">
          <h2 className="-mb-2">
            {userLoading ? (
              <Skeleton width={30} />
            ) : (
              participant?.completedSentCount +
              participant?.completedReceivedCount
            )}
          </h2>
          <p>Offers Completed</p>
        </div>
        <div className="text-center">
          <h2 className="-mb-2">
            {userLoading ? (
              <Skeleton width={30} />
            ) : (
              participant?.cancelledReceivedCount +
              participant?.cancelledSentCount
            )}
          </h2>
          <p>Offers Cancelled</p>
        </div>
        <div className="text-center">
          <h2 className="-mb-2">
            {userLoading ? <Skeleton width={30} /> : participant?.bidsCount}
          </h2>
          <p>Bids Placed</p>
        </div>
        <div className="text-center">
          <h2 className="-mb-2">
            {userLoading ? <Skeleton width={30} /> : participant?.trustScore + '%'}
          </h2>
          <p>Trust Score</p>
        </div>
      </div> */}
    </div>
  );
};

export default UserStats;
