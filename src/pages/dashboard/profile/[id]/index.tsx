import { Meta } from "@/layouts/meta";
import { Dash } from "@/templates/dash";
import { GetServerSideProps } from "next";
import getListingsByUserId from "@/actions/getListingsByUserId";
import getUserById from "@/actions/getUserById";
import Offer from "@/components/offers/Offer";
import UserCard from "@/components/widgets/UserCard";
import Satisfication from "@/components/widgets/Satisfication";
import { BiUser } from "react-icons/bi";
import { BsFillStarFill, BsPostcard } from "react-icons/bs";
import Card from "@/components/dashboard/Card";
import getRequestsByUserId from "@/actions/getRequestsByUserId";
import { getSession } from "next-auth/react";
import useMessageModal from "@/hooks/useMessageModal";
import { toast } from "react-hot-toast";
import checkFriendship from "@/actions/checkFriendship";
import axios from "axios";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import { config } from "@/config";
import { set } from "date-fns";
import useFriendship from "@/hooks/useFriendship";

const profile = ({ user, listings, requests, session, isFriend }: any) => {
  const offers = listings?.map((listing: any) => (
    <Offer key={listing.id} {...listing} />
  ));
  const userId = session?.user.id;
  const recipientId = user?.id;

  const { friend, addFriend, removeFriend } = useFriendship(userId, recipientId, config, isFriend);

  console.log(friend)
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
          onMessageClick={() => messageModal.onOpen(userId, recipientId)}
          onAddFriendClick={addFriend}
          isFriend={friend}
          onRemoveFriendClick={removeFriend}
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
            onMessageClick={() => messageModal.onOpen(userId, recipientId)}
            onAddFriendClick={addFriend}
            isFriend={friend}
            onRemoveFriendClick={removeFriend}
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
                  <a href={link.url} target="_blank" rel="noreferrer">
                    {link.url}
                  </a>
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
