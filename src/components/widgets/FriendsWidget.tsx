import { User } from "@prisma/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Socket, io } from "socket.io-client";
import { config } from "@/config";
import axios from "axios";
import { set } from "date-fns";
import { ImUserMinus, ImUserPlus } from "react-icons/im";
import { MdDoNotDisturb } from "react-icons/md";
import { FaCheck, FaTimes } from "react-icons/fa";
interface FriendsWidgetProps {
  session: any;
  friendsList: User[];
  setFriendsList: React.Dispatch<React.SetStateAction<User[]>>;
}

const FriendsWidget = ({
  session,
  friendsList,
  setFriendsList,
}: FriendsWidgetProps) => {


  const socket  = io(config.PORT)

  const onRemoveFriendClick = async (userId: string) => {
    try {
      axios
        .post("/api/deleteFriend", {
          followerId: session.userId,
          followingId: userId,
        })
        .then(
          (response) => {
            console.log("friend response", response.data); 
            if (socket) {
            socket.emit('remove_friend', response.data);
            }
            setFriendsList((prev) => {
              return prev.filter((friend) => friend.id === response.data.id)
            });
            toast.success("Friend removed!");
          },
          (error) => {
            console.log(error);
          }
        );
    } catch (error) {
      console.error("Error removing friend:");
    }
  };
      

  const handleAccept = async (friendshipId: string) => {
    try {
      const res = await fetch("/api/acceptFriendship", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          friendshipId: friendshipId,
        }),
      });
      const data = await res.json();

      setFriendsList((prevFriendsList) => {
        return prevFriendsList.map((friend) =>
          friend.id === data.id ? { ...friend, accepted: true } : friend
        );
      });

      
      if (!res.ok) {
        throw new Error(data.error);
      }

      if (data.error) {
        console.error(data.error);
      }

      toast.success("Friend request accepted!");
      if (socket) {
      socket.emit("accept_friendship", data.responseFriendship);
      socket.emit("update_activities", data.transactionResult, data.responseFriendship.followerId, data.responseFriendship.followingId);
      }

    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };


  return (
    <ul className="flex flex-col pl-0 rounded-xl flex-grow h-full">
      {friendsList && friendsList.length > 0 ? (
        friendsList.map((friend: any) => {
          return (
            <li
              key={friend.id}
              className="relative flex items-center px-0 mb-2 bg-white border-0 rounded-t-xl text-inherit"
            >
              <div className="inline-flex items-center justify-center w-8 h-12 mr-4 text-white transition-all duration-200 text-base ease-soft-in-out rounded-xl">
                <Link href={`/dashboard/profile/${friend.id}`}>
                  <img
                    src={
                      friend?.profile?.image || "/images/placeholders/avatar.png"
                    }
                    alt="profile picture"
                    className="w-full shadow-soft-2xl rounded-full border-2 border-gray-200 p-[1px]"
                  />
                </Link>
              </div>
              <div className="flex flex-col items-start justify-center">
                <h6 className="mb-0 leading-normal text-sm flex gap-2">
                  <span className="font-bold">{friend.username}</span>
                  {friend.relationshipStatus === "following" &&
                    !friend.accepted && (
                      <span className="italic">{"(pending)"}</span>
                    )}
                </h6>
              </div>
              {friend.relationshipStatus === "following" && (
                <button
                  onClick={() => onRemoveFriendClick(friend.id)}
                  className="inline-block py-1 px-2 mb-0 ml-auto font-bold text-center  align-middle transition-all bg-transparent border-2 border-orange-400 rounded-lg shadow-none cursor-pointer leading-pro text-xs ease-soft-in hover:scale-102 hover:active:scale-102 active:opacity-85 text-orange-500 hover:text-orange-800 hover:shadow-none active:scale-100"
                >
                  Remove
                </button>
              )}

              {friend.relationshipStatus === "follower" && !friend.accepted && (
                <div className="flex gap-2 ml-auto items-center">
                  <button
                    onClick={() => handleAccept(friend.friendshipId)}
                    className="inline-block py-1 px-2 mb-0 ml-auto font-bold text-center  align-middle transition-all bg-transparent border-2 border-orange-400 rounded-lg shadow-none cursor-pointer leading-pro text-xs ease-soft-in hover:scale-102 hover:active:scale-102 active:opacity-85 text-orange-500 hover:text-orange-800 hover:shadow-none active:scale-100"
                  >
                    <FaCheck className="text-md" />
                  </button>
                  <button
                    onClick={() => onRemoveFriendClick(friend.id)}
                    className="inline-block py-1 px-2 mb-0 ml-auto font-bold text-center  align-middle transition-all bg-transparent border-2 border-orange-400 rounded-lg shadow-none cursor-pointer leading-pro text-xs ease-soft-in hover:scale-102 hover:active:scale-102 active:opacity-85 text-orange-500 hover:text-orange-800 hover:shadow-none active:scale-100"
                  >
                    <FaTimes className="text-md" />
                  </button>
                </div>
              )}
              {friend.relationshipStatus === "follower" && friend.accepted && (
                <button
                  onClick={() => onRemoveFriendClick(friend.id)}
                  className="inline-block py-1 px-2 mb-0 ml-auto font-bold text-center  align-middle transition-all bg-transparent border border-orange-400 rounded-lg shadow-none cursor-pointer leading-pro text-xs ease-soft-in hover:scale-102 hover:active:scale-102 active:opacity-85 text-orange-500 hover:text-orange-800 hover:shadow-none active:scale-100"
                >
                  <ImUserMinus className="text-md" />
                </button>
              )}
            </li>
          );
        })
      ) : (
        <i>No friends yet</i>
      )}
    </ul>
  );
};

export default FriendsWidget;
