import { Meta } from "@/layouts/meta";
import { Dash } from "@/templates/dash";
import { GetServerSideProps } from "next";
import getUserById from "@/actions/getUserById";
import UserCard from "@/components/widgets/UserCard";
import { BsFillStarFill, BsPostcard } from "react-icons/bs";
import Card from "@/components/dashboard/Card";
import { getSession } from "next-auth/react";
import useMessageModal from "@/hooks/useMessageModal";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Socket, io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { config } from "@/config";
import getCurrentUser from "@/actions/getCurrentUser";
import { User } from "@prisma/client";
import { Session } from "next-auth";
import useConfirmationModal from "@/hooks/useConfirmationModal";
import InfoCard from "@/components/dashboard/InfoCard";
import Skeleton from "react-loading-skeleton";
import {
  MdHistory,
  MdMultipleStop,
  MdOutlineCircleNotifications,
  MdOutlineContactPage,
  MdOutlineContactless,
  MdOutlineLocationOn,
  MdOutlineLoyalty,
  MdOutlinePlaylistAddCheckCircle,
  MdOutlineSwapVerticalCircle,
  MdOutlineTimelapse,
  MdShowChart,
  MdTaskAlt,
} from "react-icons/md";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaUserFriends,
  FaYoutube,
} from "react-icons/fa";
import { Ri24HoursFill, RiProfileLine } from "react-icons/ri";
import { IoMdLink } from "react-icons/io";
import { IoShareSocialOutline } from "react-icons/io5";
import Button from "@/components/dashboard/Button";
import catAccept from "@/images/cat-accept.png";
import dogAccept from "@/images/dog-accept.png";
import Image from "next/image";
import { hi } from "date-fns/locale";

interface ProfieProps {
  user: User;
  session: Session;
  isFriend: boolean;
  isBlocked: boolean;
}

const profile = ({ user, session, isFriend, isBlocked }: any) => {
  const [friend, setFriend] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState("details");

  const [stats, setStats] = useState({
    sentCount: 0,
    receivedCount: 0,
    cancelledSentCount: 0,
    cancelledReceivedCount: 0,
    completedSentCount: 0,
    completedReceivedCount: 0,
    trustScore: 0,
    averageCompletionTime: 0,
    averageResponseTime: 0,
    bidsCount: 0,
    highestBid: 0,
    highestCompletedBid: 0,
  });

  const userId = session?.user.id;
  const recipientId = user?.id;
  const socketRef = useRef<Socket>();

  useEffect(() => {
    socketRef.current = io(config.PORT);
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  console.log(socketRef);

  useEffect(() => {
    const getUserStats = async () => {
      const userId = user?.id;
      const url = `/api/dashboard/getUserStats`;
      try {
        const response = await axios.post(url, {
          userId,
        });
        const stats = response.data;

        const totalListings = stats.sentCount + stats.receivedCount;
        const totalCancelledListings =
          stats.cancelledSentCount + stats.cancelledReceivedCount;
        const totalCompletedListings =
          stats.completedSentCount + stats.completedReceivedCount;
        const trustScore = Math.trunc(
          ((totalCompletedListings - totalCancelledListings) / totalListings) *
            100
        );
        setStats(stats);
      } catch (error) {
        console.error(error);
      }
    };
    getUserStats();
    setIsLoading(false);
  }, [user?.id]);

  useEffect(() => {
    setFriend(isFriend);
    setBlocked(isBlocked);
  }, [isFriend, isBlocked]);

  const confirmation = useConfirmationModal();

  const handleFollow = async () => {
    if (!friend) {
      try {
        const response = await axios.post("/api/addFriend", {
          followerId: session?.user?.id,
          followingId: user.id,
        });

        toast.success("Friend request sent to " + user?.username);
        socketRef.current?.emit("add_friend", response.data.responseFriendship);
        socketRef.current?.emit(
          "update_activities",
          response.data.transactionResult,
          response.data.responseFriendship.followerId,
          response.data.responseFriendship.followingId
        );
        setFriend(true);
      } catch (error) {
        toast.error("failed to follow user");
        console.log(error);
      }
    } else {
      try {
        confirmation.onOpen(
          `Are you sure you want to unfollow ${user?.username}?`,
          async () => {
            const response = await axios.post("/api/deleteFriend", {
              followerId: session?.user?.id,
              followingId: user.id,
            });

            toast.success("Unfollowed " + user?.username);

            if (response.data) {
              socketRef.current?.emit("remove_friend", response.data);
              setFriend(false);
              console.log("res", response.data);
            }
          }
        );
      } catch (error) {
        toast.error("failed to unfollow user");
        console.log(error);
      }
    }
  };

  const handleBlocked = async () => {
    try {
      confirmation.onOpen(
        "Are you sure you want to block this user?",
        async () => {
          await axios.post(
            !blocked ? "/api/blockFriend" : "/api/removeBlocked",
            {
              userBlockedId: session?.user?.id,
              friendBlockedId: user?.id,
            }
          );
          setBlocked(!blocked);
          toast.success(
            `${user?.username} has been ${blocked ? "blocked" : "unblocked"}`
          );
        }
      );
    } catch (error) {
      console.log(error);
      toast.error("failed to block user");
    }
  };

  useEffect(() => {
    if (!session.user.id) return;
    if (!socketRef) return;

    socketRef.current && socketRef.current.emit("register", session?.user?.id);

    socketRef.current &&
      socketRef.current.on("friend_added", (friend) => {
        setFriend(true);
      });

    socketRef.current &&
      socketRef.current.on("friend_removed", (friend) => {
        setFriend(false);
      });
    return () => {
      socketRef.current && socketRef.current.disconnect();
    };
  }, [session.user.id]);

  const messageModal = useMessageModal();

  const statsBody = (
    <>
      <div className="grid grid-cols-2 gap-6">
        <div className="col-span-2 lg:col-span-1 flex flex-col justify-center items-center border border-orange-100 rounded-xl p-6 mb-6 bg-orange-50"></div>
      </div>
    </>
  );

  const details = (
    <>
      {user?.profile?.bio && (
        <div className="col-span-12 lg:col-span-8">
          <Card title={`Bio`} icon={<RiProfileLine />}>
            <p>
              {user?.profile?.bio || <span className="italic">No bio yet</span>}
            </p>
          </Card>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6 mb-6 border border-gray-50 rounded-lg">
        <div className="flex items-center">
          <MdHistory className="text-[36px] -mt-4" />
          <InfoCard
            title={stats.averageResponseTime.toString()}
            text="Avg response time"
            color={`gray`}
            span={`col-span-2 md:col-span-1`}
            isLoading={isLoading}
          />
        </div>
        <div className="flex items-center">
          <MdOutlineTimelapse className={`text-[36px] -mt-4`} />
          <InfoCard
            title={stats.averageCompletionTime.toString()}
            text="Avg completion time"
            color={`gray`}
            span={`col-span-2 md:col-span-1`}
            isLoading={isLoading}
          />
        </div>
        <div className="flex items-center">
          <MdOutlineCircleNotifications className="text-[36px] -mt-4" />
          <InfoCard
            title={stats?.highestCompletedBid ? `£${stats?.highestCompletedBid.toString()}` : "None"}
            text="Highest Offer"
            color={`gray`}
            span={`col-span-2 md:col-span-1`}
            isLoading={isLoading}
          />
        </div>
        <div className="flex items-center">
          <MdOutlineSwapVerticalCircle className="text-[36px] -mt-4 " />
          <InfoCard
            title={stats?.highestBid !== 0 ? `£${stats?.highestBid.toString()}` : "None"}
            text="Highest Bid"
            color={`gray`}
            span={`col-span-2 md:col-span-1`}
            isLoading={isLoading}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className={`col-span-12`}>
          <Card>
            <div className="flex flex-col items-center h-full pb-8">
              <h4>You have</h4>
              <h1 className="text-5xl font-bold -mb-2">{stats?.sentCount}</h1>
              <p className="font-bold mb-4">
                negotiations with {user?.username}
              </p>
              <Button
                label="Make me a offer"
                onClick={() => {}}
                className="mt-4"
              />
            </div>
          </Card>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col items-center justify-center h-full">
          <h4 className="mb-4">I am a seller</h4>
          <Image src={catAccept} className="mb-6" alt="" />
          <Button
            label="Make me a offer"
            onClick={() => {}}
            className="mt-10"
          />
        </div>
        <Card>
          <div className="flex flex-col p-4 gap-3">
            <div className="text-center">
              <h2 className="-mb-2">
                {isLoading ? (
                  <Skeleton width={30} />
                ) : (
                  stats?.completedSentCount + stats?.completedReceivedCount
                )}
              </h2>
              <p>Offers Completed</p>
            </div>
            <div className="text-center">
              <h2 className="-mb-2">
                {isLoading ? (
                  <Skeleton width={30} />
                ) : (
                  stats?.cancelledReceivedCount + stats?.cancelledSentCount
                )}
              </h2>
              <p>Offers Cancelled</p>
            </div>
            <div className="text-center">
              <h2 className="-mb-2">
                {isLoading ? <Skeleton width={30} /> : stats?.bidsCount}
              </h2>
              <p>Bids Placed</p>
            </div>
            <div className="text-center">
              <h2 className="-mb-2">
                {isLoading ? <Skeleton width={30} /> : stats?.trustScore || 0}%
              </h2>
              <p>Trust Score</p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
  const reviews = (
    <Card title={`Reviews`} icon={<BsFillStarFill />}>
      <p>No reviews yet</p>
    </Card>
  );

  const offers = (
    <Card title={`Public Offers`} icon={<BsPostcard />}>
      <p>No public offers yet</p>
    </Card>
  );

  return (
    <Dash meta={<Meta title="" description="" />}>
      <div className="mt-6 xl:hidden">
        <UserCard
          currentUser={user}
          session={session}
          sales={0}
          offers={0}
          friendsCount={0}
          onMessageClick={() =>
            messageModal.onOpen(session?.user?.id, recipientId)
          }
          onAddFriendClick={handleFollow}
          isFriend={friend}
          isBlocked={blocked}
          onRemoveFriendClick={handleFollow}
          isPublic={true}
        />
      </div>

      <div className="xl:flex gap-6 mb-10 xl:mt-10 px-6">
        <div className="w-full xl:w-9/12 h-64">
          <div className="flex gap-4 border-b border-gray-200 mb-6 font-medium text-lg ">
            <div
              onClick={() => setTab("details")}
              className={`${
                tab === "details" && "border-b-4 border-orange-400"
              } cursor-pointer pb-2`}
            >
              Details
            </div>
            <div
              onClick={() => setTab("offers")}
              className={`${
                tab === "offers" && "border-b-4 border-orange-400"
              } cursor-pointer pb-2`}
            >
              Offers
            </div>
            <div
              onClick={() => setTab("reviews")}
              className={`${
                tab === "reviews" && "border-b-4 border-orange-400"
              } cursor-pointer pb-2`}
            >
              Reviews
            </div>
          </div>
          {tab === "stats" && statsBody}
          {tab === "offers" && offers}
          {tab === "reviews" && reviews}
          {tab === "details" && details}
        </div>
        <div className="xl:flex-1 hidden xl:block">
          <UserCard
            currentUser={user}
            session={session}
            sales={0}
            offers={0}
            friendsCount={0}
            onMessageClick={() =>
              messageModal.onOpen(session?.user?.id, recipientId)
            }
            onAddFriendClick={handleFollow}
            isFriend={friend}
            isBlocked={blocked}
            handleBlock={handleBlocked}
            onRemoveFriendClick={handleFollow}
            isPublic={true}
          />

          <Card title={`More Info`} icon={<MdOutlineContactPage />}>
            <div className="flex justify-between items-center">
              <div>Verifed</div>
              <div>
                {user?.verified ? (
                  <span className="font-bold text-green-600">Yes</span>
                ) : (
                  <span className="font-bold text-red-600">No</span>
                )}
              </div>
            </div>
            {user?.profile?.website && (
              <div className="flex justify-between items-center">
                <div>Website</div>
                <div>
                  <span className="underline">{user?.profile?.website}</span>
                </div>
              </div>
            )}
            <div className="flex justify-between items-center">
              <div>Account Type</div>
              <div>{user?.type || "Unknown"}</div>
            </div>

            <div className="flex justify-between items-center">
              <div>Location</div>
              <div>{user?.profile?.location || "United Kingdom"}</div>
            </div>

            <div className="flex justify-between items-center">
              <div>Last seen</div>
              <div>{user?.lastLogin || "Recently"}</div>
            </div>
          </Card>

          {user?.profile?.social && (
          <Card title={`Social Links`} icon={<FaUserFriends />}>
            <div className="flex gap-2 items-center">
              <div className="flex gap-4">
                {user?.profile?.social && user?.profile?.social?.twitter && (
                  <FaTwitter className="text-2xl rounded-full p-1 border-2 border-social-twitter text-social-twitter" />
                )}
                {user?.profile?.social && user?.profile?.social?.facebook && (
                  <FaFacebookF className="text-2xl rounded-full p-1 border-2 border-social-facebook text-social-facebook" />
                )}
                {user?.profile?.social && user?.profile?.social?.youtube && (
                  <FaYoutube className="text-2xl rounded-full p-1 border-2 border-social-youtube text-social-youtube" />
                )}
                {user?.profile?.social && user?.profile?.social?.linkedin && (
                  <FaLinkedin className="text-2xl rounded-full p-1 border-2 border-social-linkedin text-social-linkedin" />
                )}
                {user?.profile?.social && user?.profile?.social?.instagram && (
                  <FaInstagram className="text-2xl rounded-full p-1 border-2 border-social-instagram text-social-instagram" />
                )}
              </div>
            </div>
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
    const sessionUser = await getCurrentUser(session);

    if (!sessionUser) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    const user = await getUserById({ id: id as string });

    const isFriend =
      sessionUser.followers?.some((follower) => follower.followerId === id) ||
      sessionUser.followings?.some((following) => following.followingId === id);

    const isBlocked = sessionUser.blockedFriends?.some(
      (blocked) => blocked.friendBlockedId === id
    );

    return {
      props: {
        user,
        session,
        isFriend,
        isBlocked,
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
