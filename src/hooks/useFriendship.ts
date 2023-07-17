import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import io from "socket.io-client";

interface useFriendshipProps{
    session: any;
    user: any;
    config: any;
}

const useFriendship = (userId: string, recipientId: string, config: any, isFriend: boolean) => {
  let socket: any;

  const [friend, setFriend] = useState(false);
  const port = config.PORT;

  useEffect(() => {
    setFriend(isFriend)
},[])

  useEffect(() => {
    socket = io(port);
    socket.emit("register", userId);

    socket.on("friend_added", () => {
      setFriend(true);
    });

    socket.on("friend_removed", () => {
      setFriend(false);
    });

    return () => {
      socket.off("friend_added");
      socket.off("friend_removed");
    };
  }, [userId, recipientId, port]);

  const addFriend = async () => {
    try {
      const response = await axios.post("/api/addFriend", {
        followerId: userId,
        followingId: recipientId,
      });

      console.log("response", response.data);
      socket.emit("add_friend", response.data.responseFriendship);
      socket.emit(
        "update_activities",
        response.data.transactionResult,
        response.data.responseFriendship.followerId,
        response.data.responseFriendship.followingId
      );
      toast.success("Friend request sent!");
    } catch (error) {
      console.error("Error adding friend:", error);
    }
  };

  const removeFriend = async () => {
    try {
      const response = await axios.post("/api/deleteFriend", {
        followerId: userId,
        followingId: recipientId,
      });

      socket.emit("remove_friend", response.data);
      toast.success("Friend removed!");
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  return { friend, addFriend, removeFriend };
};

export default useFriendship;
