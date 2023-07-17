import { Activity } from "@/interfaces/authenticated";
import { AppConfig } from "@/utils/AppConfig";
import { timeInterval, timeSince } from "@/utils/formatTime";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ActivityCardProps {
  className?: string;
  activity?: Activity;
  tall?: boolean;
}

const ActivityCard = ({ activity, className, tall }: ActivityCardProps) => {
  const [timeSinceCreated, setTimeSinceCreated] = useState<string | null>(null);

  useEffect(() => {
    if (activity?.createdAt) {
      const createdAt = new Date(activity.createdAt);
      timeInterval(createdAt, setTimeSinceCreated);
    }
  }, [activity?.createdAt]);

  let category = "";

  switch (activity?.type) {
    case "newListing":
      category = "New Listing";
      break;
    case "newOffer":
      category = "Offer";
      break;
    case "updatedOffer":
      category = "Offer";
      break;
    case "offer":
      category = "Offer";
      break;
    case "NewConversationMessage":
      category = "Message";
      break;
    case "NewDirectMessage":
      category = "Message";
      break;
    case "SettingsUpdated":
      category = "Settings";
      break;
    case "PasswordUpdated":
      category = "Password";
      break;
    case "ProfileUpdated":
      category = "Profile";
      break;
    case "BidSubmitted":
      category = "Offer";
      break;
    case "BidAccepted":
      category = "Offer";
      break;
    case "FriendRequest":
      category = "Friend";
      break;
    case "FriendAccepted":
      category = "Friend";
      break;
    case "WizardComplete":
      category = "Friend";
      break;
    case "user":
      category = "User";
      break;
    case "newFriend":
      category = "Friend";
      break;
    default:
      category = "";
      break;
  }

  console.log(activity);

  return (
    <div className="p-4 bg-white border rounded-xl text-gray-800 space-y-2 mb-4">
      <Link href={activity?.action || "#"} className="">
        {tall && (
          <div className="flex justify-between">
            <div className="text-gray-400 text-xs">{activity?.type}</div>
            <div className="text-gray-400 text-xs">{timeSinceCreated}</div>
          </div>
        )}
        <div className="font-bold">{activity?.message}</div>
        <div className="text-sm text-gray-600">
          <div className="flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                fill="currentColor"
                className="text-gray-800 inline align-middle mr-1"
                viewBox="0 0 16 16"
              >
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
              </svg>
              <div>
                <div>{activity?.value}</div>
              </div>
              
            </div>
            {!tall && <div>{timeSinceCreated}</div>}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ActivityCard;
