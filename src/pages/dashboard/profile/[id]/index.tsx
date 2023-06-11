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

const profile = ({ user, listings, requests, session, isFriend }: any) => {
const offers = listings?.map((listing: any) => (
  <Offer key={listing.id} {...listing} />
));

console.log("isFriend", isFriend);  
interface IParams {
  id: string;
}

const addFriend = async () => {
  try {
    const res = await fetch("/api/addFriend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userAddsId: session.user.id,
        friendAddsId: user.id,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error);
    }

    // TODO: Handle success (show a success message, etc.)
    toast.success("Friend request sent!");
  } catch (error) {
    // TODO: Handle error (show an error message, etc.)
    console.error("Error adding friend:");
  }
};

const userId = session?.user.id;
const recipientId = user?.id;

const onRemoveFriendClick = async () => {
  try {
    const res = await fetch("/api/deleteFriend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userAddsId: userId,
        friendAddsId: recipientId,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error);
    }

    // TODO: Handle success (show a success message, etc.)
    toast.success("Friend removed!");
  } catch (error) {
    // TODO: Handle error (show an error message, etc.)
    console.error("Error removing friend:");
  }
}



const messageModal = useMessageModal();
return (
  <Dash meta={<Meta title="" description="" />}>
    <div className="my-6 lg:hidden">
      <UserCard
        currentUser={user}
        sales={listings.length}
        offers={listings.length}
        messages={0}
      />
    </div>
    <div className="md:flex gap-6 mb-10 lg:mt-10">
      <div className="w-full lg:w-9/12 h-64">
        <Card title={`Public Offers`} icon={<BsPostcard />}>
          <p>No public offers yet</p>
        </Card>
        <Satisfication />
        <Card title={`Reviews`} icon={<BiStar />}>
          <p>No reviews yet</p>
        </Card>
      </div>
      <div className="lg:flex-1 hidden lg:block">
        <UserCard
          currentUser={user}
          sales={requests.length}
          offers={listings.length}
          messages={0}
          onMessageClick={() => messageModal.onOpen(userId, recipientId)}
          onAddFriendClick={addFriend}
          isFriend={isFriend}
          onRemoveFriendClick={onRemoveFriendClick} 

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
  const isFriend = await checkFriendship({ userId1: session?.user.id, userId2: user.id })

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
