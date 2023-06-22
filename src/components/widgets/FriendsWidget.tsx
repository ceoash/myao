import { User } from "@prisma/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";

interface FriendsWidgetProps {
    session: any;
    friends: any[];
}
const FriendsWidget = ({ session, friends}: FriendsWidgetProps) => {

  const port = config.PORT || "http://localhost:3001";
  const socket = io(port);
  const [friendsList, setFriendsList] = useState<User[]>(friends);
  const onRemoveFriendClick = async (friendId: string) => {
    try {
      const res = await fetch("/api/deleteFriend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          followerId: session.user.id,
          followingId: friendId,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setFriendsList(friendsList.filter((friend) => friend.id !== friendId));

      toast.success("Friend removed!");
      socket.emit('remove_friend', { followerId: session.user.id, followingId: friendId });

    } catch (error) {
      console.error("Error removing friend:", error);
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

        setFriendsList(prevFriendsList => 
          prevFriendsList.map(friend =>
            friend.id === data.follower.id ? { ...friend, accepted: true } : friend
          )
        );
        
  
        if (!res.ok) {
          throw new Error(data.error);
        }

        toast.success("Friend request accepted!");
        socket.emit('accept_friend', { friendshipId });

      } catch (error) {
        console.error("Error accepting friend request:", error);
      }

      
  }

  useEffect(() => {
    socket.on('friend_added', (data) => {
      
      setFriendsList(prevFriendsList => [...prevFriendsList, data.follower]);
    });
  
    socket.on('friend_accepted', (data) => {
      setFriendsList(prevFriendsList => 
        prevFriendsList.map(friend => 
          friend.id === data ? { ...friend, accepted: true } : friend
        )
      );
    });
  
    socket.on('friend_removed', (data) => {
      setFriendsList(prevFriendsList => 
        prevFriendsList.filter((friend) => 
          friend.id !== data.followingId && friend.id !== data.followerId
        )
      );
    });

    return () => {
      socket.off('friend_added');
      socket.off('friend_accepted');
      socket.off('friend_removed');
    };
  }, [friendsList, setFriendsList]);

  console.log("friendsList", friendsList);
  return (
    <ul className="flex flex-col pl-0 mb-0 rounded-lg">
        {friendsList.length > 0 ? (
            friendsList.map((friend: any) => {
                return (
                <li key={friend.id} className="relative flex items-center px-0 mb-2 bg-white border-0 rounded-t-lg text-inherit">
                    <div className="inline-flex items-center justify-center w-8 h-12 mr-4 text-white transition-all duration-200 text-base ease-soft-in-out rounded-xl">
                        <Link href={`/dashboard/profile/${friend.id}`}>
                        <img
                            src={
                            friend?.profile?.image ||
                            "images/placeholders/avatar.png"
                            }
                            alt="profile picture"
                            className="w-full shadow-soft-2xl rounded-full border-2 border-gray-200 p-[1px]"
                        />
                        </Link>
                    </div>
                    <div className="flex flex-col items-start justify-center">
                        <h6 className="mb-0 leading-normal text-sm">
                        {friend.username} 
                       
                        </h6>
                    </div>
                    {  
                        friend.relationshipStatus === "following" && 
                            
                    (
                        <button
                        onClick={() => onRemoveFriendClick(friend.id)}
                        className="inline-block py-3 pl-0 pr-4 mb-0 ml-auto font-bold text-center  align-middle transition-all bg-transparent border-0 rounded-lg shadow-none cursor-pointer leading-pro text-xs ease-soft-in hover:scale-102 hover:active:scale-102 active:opacity-85 text-orange-500 hover:text-orange-800 hover:shadow-none active:scale-100"
                    >
                    {  
                        !friend.accepted && 
                        "Requested"
                        }
                    
                    {  
                        friend.accepted && 
                        "Unfollow"
                        }
                    
                    </button>

                    )}

                {  friend.relationshipStatus === "follower" &&  !friend.accepted &&  (
                    
                    <button
                    onClick={() => handleAccept(friend.friendshipId)}
                    className="inline-block py-3 pl-0 pr-4 mb-0 ml-auto font-bold text-center  align-middle transition-all bg-transparent border-0 rounded-lg shadow-none cursor-pointer leading-pro text-xs ease-soft-in hover:scale-102 hover:active:scale-102 active:opacity-85 text-orange-500 hover:text-orange-800 hover:shadow-none active:scale-100"
                    >
                 
                    Accept
                    </button>
                    )}
                {  friend.relationshipStatus === "follower" &&  friend.accepted &&  (
                    
                    <button
                    onClick={() => onRemoveFriendClick(friend.id)}
                    className="inline-block py-3 pl-0 pr-4 mb-0 ml-auto font-bold text-center  align-middle transition-all bg-transparent border-0 rounded-lg shadow-none cursor-pointer leading-pro text-xs ease-soft-in hover:scale-102 hover:active:scale-102 active:opacity-85 text-orange-500 hover:text-orange-800 hover:shadow-none active:scale-100">
                 
                    Unfollow
                    </button>
                    )}
                </li>
            )})
            ) : ( <i>No friends yet</i> )}
    </ul>
  )
}

export default FriendsWidget