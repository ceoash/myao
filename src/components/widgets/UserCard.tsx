import React, { useEffect, useState } from "react";
import {
  BiBlock,
  BiCheck,
  BiMessageAdd,
  BiStar,
  BiUserCheck,
  BiUserMinus,
} from "react-icons/bi";
import { User } from "@/types";
import Button from "../dashboard/Button";
import { Session } from "next-auth";
import { FaUserCheck, FaUserMinus } from "react-icons/fa";

interface UserCardProps {
  onMessageClick?: () => void;
  handleBlock?: () => void;
  handleAccept?: () => void;
  handleFollow?: () => void;
  session: Session;
  status?: string;
  currentUser: User;
  sales: number;
  offers: number;
  friendsCount: number;
  dashboard?: boolean;
  profile?: boolean;
  isPublic?: boolean;
  isFriend?: boolean;
  isBlocked?: boolean;
  isAccepted?: boolean;
  header?: boolean;
}

const UserCard = ({
  onMessageClick,
  handleFollow,
  handleBlock,
  handleAccept,
  header,
  currentUser,
  sales,
  offers,
  friendsCount,
  dashboard,
  profile,
  isBlocked,
  isFriend,
  isAccepted,
  isPublic,
  session,
  status,
}: UserCardProps) => {

  return (
    <div
      id="profile-card"
      className={`w-full py-6  px-6  mb-6 bg-white  ${!header ? "rounded-xl border " : " border-b -mt-2"} border-gray-200`}
    >
      <div className="flex gap-4 lg:flex-col items-center mb-4">
        <div className={`flex ${header ? "max-w-[140px]" : "w-1/3  md:w-1/5 lg:w-full" }  `}>
          <div className=" mx-auto">
            <img
              src={
                currentUser?.profile?.image || "/images/placeholders/avatar.png"
              }
              className={`w-full rounded-full border border-gray-200 p-2 ${header ? "max-w-[100px]" : "max-w-[200px]" } shadow`}
            />
          </div>
        </div>

        <div className="flex flex-col  mb-2 lg:text-center ">
          <div className="text-xl lg:text-center md:text-2xl font-medium capitalize flex items-center lg:justify-center gap-2">
            {currentUser?.username || "No name"} 
            {currentUser?.verified && <BiCheck className="inline-block text-orange-500" />} 
            {isFriend && !isAccepted && status &&
            <span className="inline-flex items-center bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full"><span className="w-2 h-2 mr-1 bg-gray-500 rounded-full"></span>{status === 'follower' ? 'Pending' : 'Request sent'}</span>}
          </div>
          <span className="italic text-sm">
            Joined{" "}
            {new Date(currentUser.createdAt).toLocaleDateString("en-gb", {
              dateStyle: "long",
            })}
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

      <div className="mt-5 flex gap-2 text-sm text-center lg:justify-center">
        {dashboard ? (
          <>
            {!profile || session?.user.id === currentUser.id ? (
              <Button
                link="/dashboard/my-profile"
                className="px-4 py-2 bg-orange-default  w-full text-white border border-orange-default text-md rounded hover:shadow hover:bg-orange-default  mb-2 cursor-pointer font-bold"
              >
                View Profile
              </Button>
            ) : (
              <Button
                link={"/dashboard/profile/" + currentUser?.id}
                className="px-4 py-2 !bg-orange-default  w-full text-white border border-orange-default text-md rounded hover:shadow hover:bg-orange-default  mb-2 cursor-pointer font-bold"
              >
                Preview
              </Button>
            )}
            <Button
              link="/dashboard/settings"
              className="px-4 py-2   w-full text-orange-500 border border-orange-default text-md rounded hover:shadow hover:bg-orange-default hover:text-white  mb-2 cursor-pointer font-bold"
            >
              Edit
            </Button>
          </>
        ) : (
          <>
            {!isBlocked && (
              <>
              {isFriend && !isAccepted && status === "follower" && (
              <Button onClick={handleAccept} cancel={isBlocked}>
                Accept
              </Button>
              )}
                <Button
                  onClick={handleFollow}
                  outline
                  options={{ primary: true }}
                >
                  <div className="flex gap-2 items-center">
                    {isFriend === false ? <FaUserCheck /> : <FaUserMinus />}
                    {isFriend === false ? "Add" : "Remove"}
                  </div>
                </Button>

                <Button onClick={onMessageClick}>
                  <div className="flex gap-2 items-center">
                    <BiMessageAdd />
                    Message
                  </div>
                </Button>
              </>
            )}
            <Button onClick={handleBlock} cancel={isBlocked}>
              {isBlocked ? (
                <div className="flex gap-1 items-center">
                  <BiCheck /> Unblock
                </div>
              ) : (
                <div className="flex gap-1 items-center">
                  <BiBlock /> Block
                </div>
              )}
            </Button>
            
          </>
        )}
      </div>
    </div>
  );
};

export default UserCard;
