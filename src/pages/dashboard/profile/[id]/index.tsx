import { Meta } from "@/layouts/meta";
import { Dash } from "@/templates/dash";
import { GetServerSideProps } from "next";
import getListingsByUserId from "@/actions/getListingsByUserId";
import getUserById from "@/actions/getUserById";
import Offer from "@/components/offers/Offer";
import UserCard from "@/components/widgets/UserCard";
import Satisfication from "@/components/widgets/Satisfication";
import { BiStar, BiUser } from "react-icons/bi";
import { BsPostcard } from "react-icons/bs";
import Card from "@/components/Card";
import getRequestsByUserId from "@/actions/getRequestsByUserId";
import { getSession } from "next-auth/react";
import useMessageModal from "@/hooks/useMessageModal";
import { toast } from "react-hot-toast";
import checkFriendship from "@/actions/checkFriendship";
import axios from "axios";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import { config } from "@/config";
let socket: any;


const profile = ({ user, listings, requests, session, isFriend }: any) => {
  const offers = listings?.map((listing: any) => (
    <Offer key={listing.id} {...listing} />
  ));

  const [friend, setFriend] = useState(isFriend);
    const port = config.PORT;
  useEffect(() => {
    socket = io(port);
    
    socket.on("friend_added", (friendship: any) => {
      if (friendship.followerId === session.user.id && friendship.followingId === user.id) {
        setFriend(true);
      }
    });

    socket.on("friend_removed", (friendship: any) => {
      if (friendship.followerId === session.user.id && friendship.followingId === user.id) {
        setFriend(false);
      }
    });

    return () => {
      socket.off();
    }
  }, [session.user.id, user.id]);
  


  const addFriend = async () => {
    try {
      axios
        .post("/api/addFriend", {
          followerId: session.user.id,
          followingId: user.id,
        })
        .then(
          (response) => {
            console.log("response", response.data);
            socket.emit('add_friend', response.data);
            toast.success("Friend request sent!");
          },
          (error) => {
            console.log(error);
          }
        );
    } catch (error) {
      console.error("Error adding friend:");
    }
  };

  const onRemoveFriendClick = async () => {
    try {
      axios
        .post("/api/deleteFriend", {
          followerId: session.user.id,
          followingId: user.id,
        })
        .then(
          (response) => {
            socket.emit('remove_friend', response.data);
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

  const userId = session?.user.id;
  const recipientId = user?.id;

  const messageModal = useMessageModal();
  return (
    <Dash meta={<Meta title="" description="" />}>
      <div className="mt-6 xl:hidden">
        <UserCard
          currentUser={user}
          sales={listings.length}
          offers={listings.length}
          messages={0}
          onMessageClick={() => messageModal.onOpen(userId, recipientId)}
          onAddFriendClick={addFriend}
          isFriend={isFriend}
          onRemoveFriendClick={onRemoveFriendClick}
          isPublic={true}
        />
      </div>
      <div className="xl:flex gap-6 mb-10 xl:mt-10">
        <div className="w-full xl:w-9/12 h-64">
          <Card title={`Public Offers`} icon={<BsPostcard />}>
            <p>No public offers yet</p>
          </Card>
          {/* <Satisfication /> */}
          <Card title={`Reviews`} icon={<BiStar />}>
            <p>No reviews yet</p>
          </Card>
        </div>
        <div className="xl:flex-1 hidden xl:block">
        <UserCard
          currentUser={user}
          sales={listings.length}
          offers={listings.length}
          messages={0}
          onMessageClick={() => messageModal.onOpen(userId, recipientId)}
          onAddFriendClick={addFriend}
          isFriend={isFriend}
          onRemoveFriendClick={onRemoveFriendClick}
          isPublic={true}
        />
    
          <Card title={`Contact`}>
            <div className="flex gap-2 items-center">
              <BiUser />
              <span className="underline">{user.username}</span>
            </div>
          </Card>
          {user.profile?.bio && (
            <Card title={`Bio`} body={user.profile?.bio} sidebar />
          )}
          {user.profile?.socialLinks && (
            <Card
              title={`Social Links`}
              body={user.profile?.socialLinks}
              sidebar
            />
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
