import removeFriend from "@/pages/api/deleteFriend";
import { on } from "events";
import Link from "next/link";
import React, { useState } from "react";
import { BiStar } from "react-icons/bi";
import { User } from "@/types";

interface UserCardProps {
  currentUser: User;
  sales: number;
  offers: number;
  messages: number;
  dashboard?: boolean;
  profile?: boolean;
  isPublic?: boolean;
  onMessageClick?: () => void;
  onAddFriendClick?: () => void;
  isFriend?: boolean;
  onRemoveFriendClick?: () => void;
}

const UserCard = ({
  currentUser,
  sales,
  offers,
  messages,
  dashboard,
  profile,
  onMessageClick,
  onAddFriendClick,
  onRemoveFriendClick,
  isFriend,
  isPublic
}: UserCardProps) => {
  const [friend, setFriend] = useState(isFriend);

  const handleClick = async () => {
    if (friend) {
      try {
        await onRemoveFriendClick?.(); 
        setFriend(!friend);
      } catch (error) {
        console.error("Error removing friend:", error);
      }
    } else {
      try {
        await onAddFriendClick?.(); 
        setFriend(!friend);
      } catch (error) {
        console.error("Error adding friend:", error);
      }
    }
  };
  
  return (
    <div
      id="profile-card"
      className="w-full py-6 bg-white border-2 rounded-md px-6 border-gray-200 mb-6"
    >
      <div className="flex gap-4 lg:flex-col items-center mb-4">
        <div className="flex w-1/3  md:w-1/5 lg:w-full ">
          <div className=" mx-auto">
            <img
              src={
                currentUser?.profile?.image || "/images/placeholders/avatar.png"
              }
              className="w-full rounded-full border-2 border-gray-200 p-2 max-w-[200px]"
            />
          </div>
        </div>

        <div className="flex flex-col  mb-2 lg:text-center ">
          <span className="text-xl md:text-2xl font-medium capitalize">
            {currentUser?.name || "No name"}
          </span>
          <span className="text-xl text-gray-400">
            <BiStar className="inline-block text-orange-500" />
            <BiStar className="inline-block text-orange-500" />
            <BiStar className="inline-block text-orange-500" />
            <BiStar className="inline-block text-orange-500" />
            <BiStar className="inline-block text-orange-500" />
          </span>
        </div>
      </div>
      {!isPublic && (
        <div className="grid grid-cols-3 justify-between">
          <div className="text-center w-full">
            <div className="font-bold">Offers</div>
            <div>{offers}</div>
          </div>
          <div className="text-center w-full">
            <div className="font-bold">Requests</div>
            <div>{sales}</div>
          </div>
          <div className="text-center w-full">
            <div className="font-bold">Messages</div>
            <div>{messages}</div>
          </div>
        </div>
      )}

      <div className="mt-5 flex gap-2 text-sm text-center">
        {dashboard ? (
          <>
            {!profile ? (
              <Link
                href="/dashboard/my-profile"
                className="px-4 py-2 bg-orange-500  w-full text-white border border-orange-500 text-md rounded hover:shadow hover:bg-orange-500  mb-2"
              >
                View Profile
              </Link>
            ) : (
              <Link
                href={"/dashboard/profile/" + currentUser?.id}
                className="px-4 py-2 bg-orange-500  w-full text-white border border-orange-500 text-md rounded hover:shadow hover:bg-orange-500  mb-2"
              >
                Preview
              </Link>
            )}
            <Link
              href="/dashboard/settings"
              className="px-4 py-2 bg-white  w-full text-orange-500 border border-orange-500 text-md rounded hover:shadow hover:bg-orange-500 hover:text-white  mb-2"
            >
              Edit
            </Link>
          </>
        ) : (
          <>
            
              <div
                onClick={handleClick}
                className="px-4 py-2 bg-orange-500  w-full text-white border border-orange-500 text-md rounded hover:shadow hover:bg-orange-500  mb-2"
              >
                {friend === false ? ( "Add User" ) : ( "Remove User" )}
              </div>
            

            <div
              onClick={onMessageClick}
              className="px-4 py-2 bg-orange-500  w-full text-white border border-orange-500 text-md rounded hover:shadow hover:bg-orange-500  mb-2"
            >
              Message
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserCard;
