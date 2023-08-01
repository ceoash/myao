import { Meta } from "@/layouts/meta";
import { Dash } from "@/templates/dash";
import { GetServerSideProps } from "next";
import getListingsByUserId from "@/actions/getListingsByUserId";
import getUserById from "@/actions/getUserById";
import Offer from "@/components/offers/Offer";
import UserCard from "@/components/widgets/UserCard";
import { BiUser } from "react-icons/bi";
import { BsFillStarFill, BsPostcard } from "react-icons/bs";
import Card from "@/components/dashboard/Card";
import getRequestsByUserId from "@/actions/getRequestsByUserId";
import { getSession } from "next-auth/react";
import useMessageModal from "@/hooks/useMessageModal";
import { toast } from "react-hot-toast";
import checkFriendship from "@/actions/checkFriendship";
import axios from "axios";
import { Socket, io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { config } from "@/config";
import Link from "next/link";

const profile = ({ user, listings, requests, session, isFriend }: any) => {
  
  const [friend, setFriend] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const offers = listings?.map((listing: any) => (
    <Offer key={listing.id} {...listing} />
  ));
  const userId = session?.user.id;
  const recipientId = user?.id;
  const socketRef = useRef<Socket>();

  useEffect(() => {
    socketRef.current = io(config.PORT);
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  console.log(socketRef)


  useEffect(() => {
    setFriend(isFriend)
  },[isFriend])


  const handleFollow = async () => {
    if (!friend) {
      try {
        const response = await axios.post("/api/addFriend", {
          followerId: session?.user?.id,
          followingId: user.id,
        });

        toast.success("Friend request sent to ");
        socketRef.current?.emit("add_friend", response.data.responseFriendship);
         socketRef.current?.emit(
          "update_activities",
          response.data.transactionResult,
          response.data.responseFriendship.followerId,
          response.data.responseFriendship.followingId,
        );
        setFriend(true)
        

      } catch (error) {
        toast.error("failed to follow user");
      }
    } else {
      try {
        const response = await axios.post("/api/deleteFriend", {
          followerId: session?.user?.id,
          followingId: user.id,
        });
        toast.success("Unfollowed " );
        if(response.data) {
          socketRef.current?.emit("remove_friend", response.data);
          setFriend(false)  
          console.log("res", response.data)

        }
      } catch (error) {
        toast.error("failed to unfollow user");
      }
    }
  };

  useEffect(() => {
    if (!session.user.id) return;
    if (!socketRef) return;

    socketRef.current && socketRef.current.emit("register", session?.user?.id)
    socketRef.current && socketRef.current.on("friend_blocked", () => {
      setIsBlocked(true);
    });

    socketRef.current && socketRef.current.on("friend_unblocked", () => {
      setIsBlocked(false);
    });

    socketRef.current && socketRef.current.on("friend_added", (friend) => {
      console.log("added", friend)
      setFriend(true);
    });

    socketRef.current && socketRef.current.on("friend_removed", (friend) => {
      console.log("added", friend)
      setFriend(false);
     
      console.log("friend removed", friend);
    });
    return () => {
      socketRef.current && socketRef.current.disconnect()
    };
  }, [session.user.id]);

  const messageModal = useMessageModal();
  return (
    <Dash meta={<Meta title="" description="" />}>
      <div className="mt-6 xl:hidden">
        <UserCard
          currentUser={user}
          session={session}
          sales={listings.length}
          offers={listings.length}
          friendsCount={0}
          onMessageClick={() => messageModal.onOpen(user.id, recipientId)}
          onAddFriendClick={handleFollow}
          isFriend={friend}
          onRemoveFriendClick={handleFollow}
          isPublic={true}
        />
      </div>
      <div className="xl:flex gap-6 mb-10 xl:mt-10 px-6">
        <div className="w-full xl:w-9/12 h-64">
          <Card title={`Public Offers`} icon={<BsPostcard />}>
            <p>No public offers yet</p>
          </Card>
          {/* <Satisfication /> */}
          <Card title={`Reviews`} icon={<BsFillStarFill />}>
            <p>No reviews yet</p>
          </Card>
        </div>
        <div className="xl:flex-1 hidden xl:block">
          <UserCard
            currentUser={user}
            session={session}
            sales={listings.length}
            offers={listings.length}
            friendsCount={0}
            onMessageClick={() => messageModal.onOpen(user.id, recipientId)}
            onAddFriendClick={handleFollow}
            isFriend={friend}
            onRemoveFriendClick={handleFollow}
            isPublic={true}
          />
          <Card title={`Contact`}>
            <div className="flex gap-2 items-center">
              <BiUser />
              <span className="underline">{user.username}</span>
              <span className="underline">{user?.profile?.website}</span>
            </div>
          </Card>
          {user.profile?.bio && (
            <Card title={`Bio`}>
              <p>{user.profile?.bio}</p>
            </Card>
          )}
          {user.profile?.socialLinks && (
            <Card title={`Social Links`}>
              {user.profile?.socialLinks?.map((link: any) => (
                <div className="flex gap-2 items-center">
                  <Link href={link.url} target="_blank" rel="noreferrer">
                    {link.url}
                  </Link>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </Dash>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const session = await getSession(context);
    const id = context.params?.id;

    if (!session) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    if (typeof id !== "string") {
      throw new Error("Invalid user ID");
    }
    const user = await getUserById({ id: id as string });
    const listings = await getListingsByUserId(user.id);
    const requests = await getRequestsByUserId(user.id);

    const isFriend = await checkFriendship({
      userId1: session?.user.id,
      userId2: user.id,
    });

    return {
      props: {
        user,
        listings,
        requests,
        session,
        isFriend,
      },
    };
  } catch (error) {
    console.error("Error fetching user/listing:", error);
    return {
      props: {
        user: null,
        listings: null,
        requests: null,
        session: null,
        isFriend: false,
      },
    };
  }
};

export default profile;
