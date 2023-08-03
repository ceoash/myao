import Image from "next/image";
import React from "react";
import { BiStar } from "react-icons/bi";
import Skeleton from "react-loading-skeleton";
import Button from "./Button";

interface UserStatsProps {
    userLoading: boolean;
    participant: any;
}

const UserStats = ({ userLoading, participant,}: UserStatsProps) => {
  return (
    <div className="grid grid-cols-2 auto-cols-fr gap-2">
      <div className="flex flex-col p-4 items-center col-span-2 lg:col-span-1">
        <div className="p-4 w-40 h-40 rounded-full relative">
          {userLoading ? (
            <Skeleton
              circle
              width={150}
              height={150}
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
              fill
              style={{ objectFit: "cover" }}
            />
          )}
        </div>
        <div className="p-4 text-center">
          <h4>
            {userLoading ? <Skeleton width={30} /> : participant?.username}
          </h4>
          <div className="text-xl text-gray-400 mb-4">
            <BiStar className="inline-block text-orange-500" />
            <BiStar className="inline-block text-orange-500" />
            <BiStar className="inline-block text-orange-500" />
            <BiStar className="inline-block text-orange-500" />
            <BiStar className="inline-block text-orange-500" />
          </div>
          {participant?.profile?.bio && (
            <p className="mb-4">{participant?.profile?.bio}</p>
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
          <Button
            link={`/dashboard/profile/${participant?.id}`}
            label={`Profile`}
          />
        </div>
      </div>
      <div className="flex flex-col pb-4 md:p-4 gap-3 col-span-2 lg:col-span-1">
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
            {userLoading ? <Skeleton width={30} /> : participant?.trustScore}%
          </h2>
          <p>Trust Score</p>
        </div>
      </div>
    </div>
  );
};

export default UserStats;
