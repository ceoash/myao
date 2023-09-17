import Link from "next/link";
import axios from "axios";
import useQuickConnect from "@/hooks/useQuickConnect";
import Button from "../dashboard/Button";
import { User } from "@prisma/client";
import { toast } from "react-hot-toast";
import { FaUserCheck, FaUserMinus } from "react-icons/fa";
import { useSocketContext } from "@/context/SocketContext";

interface FriendsWidgetProps {
  session: any;
  friendsList: User[];
  dispatch: React.Dispatch<any>;
}

const FriendsWidget = ({
  session,
  friendsList,
  dispatch,
}: FriendsWidgetProps) => {

  const socket = useSocketContext();
  const connect = useQuickConnect();

  const onRemoveFriendClick = async (userId: string) => {
    try {
      await axios
        .post("/api/deleteFriend", {
          followerId: session?.user?.id,
          followingId: userId,
        })
        .then(
          (response) => {
            console.log("friend response", response.data);
            if (socket) socket.emit("friend", response.data, "remove");
            if (response.data.followerId === session?.user.id) {
              dispatch({ type: "remove", payload: { id: response.data.followingId } });
            } else {
              dispatch({ type: "remove", payload: { id: response.data.followerId } });
            }
            toast.success("Friend removed!");
          },
          (error) => console.log(error)
        );
    } catch (error) {
      console.error("Error removing friend:");
    }
  };

  const handleAccept = async (friendshipId: string) => {
    try {
    await axios.post("/api/acceptFriendship",{ 
        friendshipId: friendshipId,
      }).then((response) => {
        const data = response.data
        console.log("data", data)

        dispatch({ type: "accept", payload: data.responseFriendship.followerId });

        if (socket) {
          console.log("socket emit", socket)
          socket.emit("friend", data.responseFriendship, 'accept');
          socket.emit(
            "update_activities",
            data.transactionResult,
            data.responseFriendship.followerId,
            data.responseFriendship.followingId,
            [ data.followerNotification, data.followingNotification ],
            []
          );
        }
        toast.success("Friend request accepted!");
      })
      .catch((error) => console.log(error));

      
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  return (
    <ul className="flex flex-col pl-0 px-4 pt-2 pb-0 bg-white border border-gray-200 rounded-xl">
      {friendsList && friendsList.length > 0 ? (
        friendsList.map((friend: any) => {
          return (
            <li
              key={friend.id}
              className="relative flex items-center justify-between px-0 mb-2 bg-white border-0 rounded-t-xl text-inherit"
            >
              <div className="flex items-center">
              <div className="inline-flex items-center justify-center w-10 h-14 mx-4 text-white transition-all duration-200 text-base ease-soft-in-out rounded-xl">
                <Link href={`/dashboard/profile/${friend.id}`}>
                  <img
                    src={
                      friend?.profile?.image ||
                      "/images/placeholders/avatar.png"
                    }
                    alt="profile picture"
                    className="w-full shadow-soft-2xl rounded-full border-2 border-gray-200 p-[1px]"
                  />
                </Link>
              </div>
              <div className="flex flex-col items-start justify-center">
                <h4 className="mb-0 leading-normal text-md md:flex gap-2 items-center">
                  <div className="font-bold">{friend.username}</div>
                  {
                    !friend.accepted && (
                      <div className="italic text-sm text-gray-500 font-normal">{"(awaiting approval)"}</div>
                    )}
                </h4>
              </div>
              </div>
             
              <div className="flex items-center ml-auto gap-2">

                <div className="flex gap-2 items-center">
                  {friend.accepted === false && friend.relationshipStatus === "follower" && (

                  <button
                    onClick={() => handleAccept(friend.friendshipId)}
                    className="flex items-center ml-auto gap-1 border border-gray-200 rounded-lg text-sm bg-gray-50 p-1 px-2 hover:bg-gray-50"
                  >
                    <FaUserCheck className="text-[10px]" />
                    Accept
                  </button>

                  )}
                  <button
                    onClick={() => onRemoveFriendClick(friend.id)}
                    className="flex items-center ml-auto gap-1 border border-gray-200 rounded-lg text-sm bg-gray-50 p-1 px-2 hover:bg-gray-50"
                  >
                    <FaUserMinus className="text-[10px]" />
                    Remove
                  </button>
                </div>
             
              </div>
            </li>
          );
        }).reverse()
      ) : (
        <div className="min-w-full transition">
               
                    <div className="flex flex-col items-center justify-center h-full text-center rounded-xl bg-white   py-16 ">
                    <div className="text-gray-700 text-lg font-bold  mx-4 mb-2 text-center">
                      No friends yet{" "}
                      <p className="text-gray-700 text-sm mt-2 font-normal mb-3">
                        You can get connected with other users by clicking the button below.
                      </p>
                    </div>
                    <Button
                      primary
                      label="Get connected"
                      onClick={() => connect.onOpen(null, session?.user?.id, false)}
                    />
                  </div>
            
                </div>
      )}
    </ul>
  );
};

export default FriendsWidget;
