import { ExtendedActivity } from "@/interfaces/authenticated";
import { AppConfig } from "@/utils/AppConfig";
import { notificationIcon } from "@/utils/checkers";
import { timeInterval, timeSince } from "@/utils/formatTime";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { CiChat1, CiCreditCard1, CiInboxIn, CiSettings, CiShoppingTag, CiUser } from "react-icons/ci";

interface ActivityCardProps {
  className?: string;
  activity?: ExtendedActivity;
  tall?: boolean;
  icon?: React.ReactNode;
  page?: boolean
}

const ActivityCard = ({ activity, className, tall, icon, page }: ActivityCardProps) => {
  const [timeSinceCreated, setTimeSinceCreated] = useState<string | null>(null);

  useEffect(() => {
    if (activity?.createdAt) {
      const createdAt = new Date(activity.createdAt);
      timeInterval(createdAt, setTimeSinceCreated);
    }
  }, [activity?.createdAt]);

  const  activityIcon = notificationIcon(activity?.type || "info");

  let status;

  if (activity?.listing?.status === "cancelled") {
    status = "Terminated";
  } else {
    status = activity?.listing?.status;
  }
  return (
    <div className="pb-2 rounded-lg text-gray-800 space-y-2 mb-2">
      <Link href={activity?.userActivity?.action || "#"} className="">
        <div className="flex gap-3 items-start">
          {activityIcon}
          <div>
            <p className={`text-sm text-gray-800 flex-nowrap truncate ${page ? 'w-full' : 'xl:max-w-[150px]'}`}>{activity?.message}</p>
            <div className="text-gray-600 text-xs">{timeSinceCreated}</div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ActivityCard;
