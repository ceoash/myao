
import React, { useEffect, useState } from "react";
import { BiBlock, BiCheck, BiMessageAdd, BiStar, BiUserCheck, BiUserMinus } from "react-icons/bi";
import { User } from "@/types";
import Button from "../dashboard/Button";
import { Session } from "next-auth";
import { FaUserCheck, FaUserMinus } from "react-icons/fa";

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
  handleBlock?: () => void;
  isBlocked?: boolean;
  session: Session;
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
  handleBlock,
  isBlocked,
  isFriend,
  isPublic,
  session,
}: UserCardProps) => {

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
          <span className="italic text-sm">
            Joined {new Date(currentUser.createdAt).toLocaleDateString("en-gb", {dateStyle: "long"}) }
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
            <div className="font-bold">Sent</div>
            <div>{offers}</div>
          </div>
          <div className="text-center w-full">
            <div className="font-bold">Received</div>
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
          {!isBlocked && (
          <>
            <Button
              onClick={handleClick}
              outline
              options={{ primary: true }}
            >
              <div className="flex gap-2 items-center">
              {friend === false ? (
                <FaUserCheck />
              ) : (
                <FaUserMinus />
              )}
              {friend === false ? "Add" : "Remove"}
              </div>
            </Button>

            <Button
              onClick={onMessageClick}
            >
              <div className="flex gap-2 items-center">
              <BiMessageAdd />
              Message
              </div>
            </Button>
            </>
            
          )}
            <Button
              onClick={handleBlock}
              cancel={isBlocked}
            >
             { isBlocked ? <div className="flex gap-1 items-center"><BiCheck /> Unblock</div> : <div className="flex gap-1 items-center"><BiBlock /> Block</div> }
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default UserCard;
