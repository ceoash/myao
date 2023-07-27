import removeFriend from "@/pages/api/deleteFriend";
import { on } from "events";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { BiStar } from "react-icons/bi";
import { User } from "@/types";
import { ImUserPlus, ImUserMinus } from "react-icons/im";
import Button from "../dashboard/Button";

interface UserCardProps {
  currentUser: User;
  sales: number;
  offers: number;
  friendsCount: number;
  dashboard?: boolean;
  profile?: boolean;
  isPublic?: boolean;
  onMessageClick?: () => void;
  onAddFriendClick?: () => void;
  isFriend?: boolean;
  onRemoveFriendClick?: () => void;
  session: any;
}

const UserCard = ({
  currentUser,
  sales,
  offers,
  friendsCount,
  dashboard,
  profile,
  onMessageClick,
  onAddFriendClick,
  onRemoveFriendClick,
  isFriend,
  isPublic,
  session,
}: UserCardProps) => {

  console.log("session", session)
  console.log("session", currentUser)

  const [friend, setFriend] = useState(false)

  useEffect(() => {
    setFriend(isFriend || false)
  }, [isFriend]
  )
  
  const handleClick = async () => {
    if (friend) {
      try {
        await onRemoveFriendClick?.();
        setFriend(false);
      } catch (error) {
        console.error("Error removing friend:", error);
      }
    } else {
      try {
        await onAddFriendClick?.();
        setFriend(true);
      } catch (error) {
        console.error("Error adding friend:", error);
      }
    }
  };

  return (
    <div
      id="profile-card"
      className="w-full py-6 bg-white border rounded-xl px-6 border-gray-200 mb-6"
    >
      <div className="flex gap-4 lg:flex-col items-center mb-4">
        <div className="flex w-1/3  md:w-1/5 lg:w-full ">
          <div className=" mx-auto">
            <img
              src={
                currentUser?.profile?.image || "/images/placeholders/avatar.png"
              }
              className="w-full rounded-full border border-gray-200 p-2 max-w-[200px] shadow"
            />
          </div>
        </div>

        <div className="flex flex-col  mb-2 lg:text-center ">
          <span className="text-xl md:text-2xl font-medium capitalize">
            {currentUser?.username || "No name"}
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
            <div className="font-bold">Friends</div>
            <div>{friendsCount}</div>
          </div>
        </div>
      )}

      <div className="mt-5 flex gap-2 text-sm text-center">
        {dashboard ? (
          <>
            {!profile || session?.user.id === currentUser.id ? (
              <Button
                link="/dashboard/my-profile"
                className="px-4 py-2 bg-orange-400  w-full text-white border border-orange-400 text-md rounded hover:shadow hover:bg-orange-400  mb-2 cursor-pointer font-bold"
              >
                View Profile
              </Button>
            ) : (
              <Button
                link={"/dashboard/profile/" + currentUser?.id}
                className="px-4 py-2 !bg-orange-400  w-full text-white border border-orange-400 text-md rounded hover:shadow hover:bg-orange-400  mb-2 cursor-pointer font-bold"
              >
                Preview
              </Button>
            )}
            <Button
              link="/dashboard/settings"
              className="px-4 py-2   w-full text-orange-500 border border-orange-400 text-md rounded hover:shadow hover:bg-orange-400 hover:text-white  mb-2 cursor-pointer font-bold"
            >
              Edit
            </Button>
          </>
        ) : (
          <>
            <button
              onClick={handleClick}
              type="button"
              className="inline-flex items-center justify-center px-3 gap-1  rounded-xl border text-white bg-orange-400 hover:bg-white hover:text-orange-500 hover:border-orange-400  transition"
            >
              {friend === false ? (
                <ImUserPlus className="text-md" />
              ) : (
                <ImUserMinus className="text-md" />
              )}
              {friend === false ? "Add" : "Remove"}
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-2 justify-center h-10 px-3 rounded-xl border border-gray-200 hover:border-gray-400 text-gray-800 hover:text-gray-900 transition"
              onClick={onMessageClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                fill="currentColor"
                className="bi bi-chat-fill"
                viewBox="0 0 16 16"
              >
                <path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6-.097 1.016-.417 2.13-.771 2.966-.079.186.074.394.273.362 2.256-.37 3.597-.938 4.18-1.234A9.06 9.06 0 0 0 8 15z" />
              </svg>
              Message
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default UserCard;
