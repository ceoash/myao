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
import { use, useEffect, useRef, useState } from "react";
import getCurrentUser from "@/actions/getCurrentUser";
import { Profile, Social, User } from "@prisma/client";
import { Session } from "next-auth";
import useConfirmationModal from "@/hooks/useConfirmationModal";
import InfoCard from "@/components/dashboard/InfoCard";
import Skeleton from "react-loading-skeleton";
import {
  MdHistory,
  MdOutlineCircleNotifications,
  MdOutlineContactPage,
  MdOutlineSwapVerticalCircle,
  MdOutlineTimelapse,
} from "react-icons/md";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaUserFriends,
  FaYoutube,
} from "react-icons/fa";
import { RiProfileLine } from "react-icons/ri";
import Button from "@/components/dashboard/Button";
import catAccept from "@/images/cat-accept.png";
import Image from "next/image";
import useOfferModal from "@/hooks/useOfferModal";
import { useSocket } from "@/hooks/useSocket";
import { useSocketContext } from "@/context/SocketContext";
import { is } from "date-fns/locale";

interface IProfile extends Profile {
  social: Social;
}
interface IUser extends User {
  profile: IProfile;
  lastLogin?: String;
}

interface ProfieProps {
  user: IUser;
  session: Session;
  friend: Friend;
}

interface Friend {
  id: string;
  accepted: boolean;
  status: string;
  blocked: boolean;
  isFriend?: boolean;
  friendshipId: string;
}

const profile = ({ user, session, friend }: ProfieProps) => {
  const [friendStatus, setFriendStatus] = useState<Friend>({
    id: "",
    accepted: false,
    status: "",
    blocked: false,
    isFriend: false,
    friendshipId: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState("details");
  const [isMounted, setIsMounted] = useState(false);

  const messageModal = useMessageModal();

  const socket = useSocketContext();

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
    sharedListingsCount: 0,
  });

  const userId = session?.user.id;
  const recipientId = user?.id;

  const offerModal = useOfferModal();

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const getUserStats = async () => {
      const userId = user?.id;
      const url = `/api/dashboard/getUserStats`;
      try {
        const response = await axios.post(url, {
          userId,
          sessionId: session?.user?.id,
        });
        const stats = response.data;

        const totalListings = stats.sentCount + stats.receivedCount;
        const totalCancelledListings =
          stats.cancelledSentCount + stats.cancelledReceivedCount;
        const totalCompletedListings =
          stats.completedSentCount + stats.completedReceivedCount;

        stats.trustScore = Math.trunc(
          ((totalCompletedListings - totalCancelledListings) / totalListings) *
            100
        );
        setStats(stats);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    };
    getUserStats();
  }, [isMounted]);

  useEffect(() => {
    if (friend && isMounted) setFriendStatus(friend);
  }, [friend, isMounted]);

  const confirmation = useConfirmationModal();
  const handleFollow = async () => {
    if (!friendStatus.isFriend) {
      try {
        const response = await axios.post("/api/addFriend", {
          followerId: session?.user?.id,
          followingId: user.id,
        });
        console.log("response emit", response.data);

        toast.success("Friend request sent to " + user?.username);
        socket.emit("friend", response.data.responseFriendship, "add");
        socket.emit(
          "update_activities",
          response.data.transactionResult || [],
          response.data.responseFriendship.followerId || "",
          response.data.responseFriendship.followingId || "",
          [
            response.data.followerNotification,
            response.data.followingNotification,
          ] || [],
          []
        );
        setFriendStatus((prev) => ({
          ...prev,
          isFriend: true,
        }));
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
              socket.emit("friend", response.data, "remove");
              setFriendStatus((prev) => ({
                ...prev,
                isFriend: false,
              }));
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

  const handleAccept = async () => {
    try {
      await axios
        .post("/api/acceptFriendship", {
          friendshipId: friendStatus.friendshipId,
        })
        .then((response) => {
          const data = response.data;
          console.log("data", data);

          if (socket) {
            console.log("socket emit", socket);
            socket.emit("friend", data.responseFriendship, "accept");
            socket.emit(
              "update_activities",
              data.transactionResult,
              data.responseFriendship.followerId,
              data.responseFriendship.followingId,
              [data.followerNotification, data.followingNotification],
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

  const handleBlocked = async () => {
    try {
      confirmation.onOpen(
        `Are you sure you want to ${
          friendStatus.blocked ? `unblock` : `block`
        } this user?`,
        async () => {
          await axios.post(
            !friendStatus.blocked ? "/api/blockFriend" : "/api/removeBlocked",
            {
              userBlockedId: session?.user?.id,
              friendBlockedId: user?.id,
            }
          );
          setFriendStatus((prev) => ({
            ...prev,
            blocked: !prev.blocked,
          }));
          toast.success(
            `${user?.username} has been ${
              friendStatus.blocked ? "blocked" : "unblocked"
            }`
          );
        }
      );
    } catch (error) {
      console.log(error);
      toast.error("failed to block user");
    }
  };

  useEffect(() => {
    if (!session?.user.id) return;

    socket.on("friend", (data) => {
      console.log("friend", data);
      const { action } = data;
      switch (action) {
        case "add":
          const participant =
            data.followerId === session?.user.id
              ? data.followingId
              : data.followerId;
          if (friendStatus.id !== participant) {
            setFriendStatus((prev) => ({
              ...prev,
              id: participant,
              isFriend: true,
              friendshipId: data.id,
              status:
                data.followerId === session?.user.id ? "following" : "follower",
            }));
          } else {
            console.log("Problem adding user");
          }
          break;
        case "remove":
          setFriendStatus((prev) => ({
            ...prev,
            isFriend: false,
            status: "",
          }));
          break;
        case "accept":
          setFriendStatus((prev) => ({
            ...prev,
            accepted: true,
          }));
          break;
        default:
          break;
      }
    });
    return () => {
      socket.off("friend");
    };
  }, [socket]);

  const statsBody = (
    <>
      <div className="grid grid-cols-2 gap-6">
        <div className="col-span-2 lg:col-span-1 flex flex-col justify-center items-center border border-orange-100 rounded-xl p-6 mb-6 bg-orange-50"></div>
      </div>
    </>
  );

  const details = (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6 mb-6 xl:border xl:bg-white xl:p-6 border-gray-200 rounded-lg">
        <div className="flex items-center ">
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
            title={
              stats?.highestCompletedBid
                ? `£${stats?.highestCompletedBid.toString()}`
                : "None"
            }
            text="Highest Offer"
            color={`gray`}
            span={`col-span-2 md:col-span-1`}
            isLoading={isLoading}
          />
        </div>
        <div className="flex items-center">
          <MdOutlineSwapVerticalCircle className="text-[36px] -mt-4 " />
          <InfoCard
            title={
              stats?.highestBid !== 0
                ? `£${stats?.highestBid.toString()}`
                : "None"
            }
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
              <h1 className="text-5xl font-bold -mb-2">
                {isLoading ? (
                  <Skeleton height={50} width={30} />
                ) : (
                  stats?.sharedListingsCount
                )}
              </h1>
              <p className="font-bold mb-4">
                negotiations with {user?.username}
              </p>
              <Button
                label="Connect and Create"
                onClick={offerModal.onOpen}
                icon="/icons/thumbs-up.png"
                className="hidden md:block"
              />
            </div>
          </Card>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="mb-auto">
          <div className="flex flex-col items-center justify-center h-full pb-6">
            <h3 className="mb-4">I am a seller</h3>
            <Image src={catAccept} className="mb-6" alt="" />
            <p></p>
            <Button
              label="Make me a offer"
              onClick={offerModal.onOpen}
              className="mt-10"
            />
          </div>
        </Card>
        <Card>
          <div className="flex flex-col p-4 pt-2 -mb-1 only:gap-3">
            <h2 className="text-center ">Stats</h2>

            <div className="flex items-center mb-2">
              <svg
                className="w-4 h-4 text-orange-300 mr-1"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 22 20"
              >
                <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
              </svg>
              <svg
                className="w-4 h-4 text-orange-300 mr-1"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 22 20"
              >
                <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
              </svg>
              <svg
                className="w-4 h-4 text-orange-300 mr-1"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 22 20"
              >
                <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
              </svg>
              <svg
                className="w-4 h-4 text-orange-300 mr-1"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 22 20"
              >
                <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
              </svg>
              <svg
                className="w-4 h-4 text-gray-300 mr-1 "
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 22 20"
              >
                <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
              </svg>
              <p className="ml-2 text-sm font-medium text-gray-900 ">
                0 out of 5
              </p>
            </div>
            <p className="text-sm font-medium text-gray-500 ">
              0 global ratings
            </p>
            <div className="flex items-center mt-4">
              <a
                href="#"
                className="text-sm font-medium text-gray-600  hover:underline"
              >
                5 star
              </a>
              <div className="flex-grow h-5 mx-4 bg-gray-200 rounded ">
                <div
                  className="h-5 bg-orange-300 rounded "
                  style={{ width: "0%" }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-500 ">0%</span>
            </div>
            <div className="flex items-center mt-4">
              <a
                href="#"
                className="text-sm font-medium text-gray-600  hover:underline"
              >
                4 star
              </a>
              <div className="flex-grow h-5 mx-4 bg-gray-200 rounded ">
                <div
                  className="h-5 bg-orange-300 rounded"
                  style={{ width: "0" }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-500 ">0%</span>
            </div>
            <div className="flex items-center mt-4">
              <a
                href="#"
                className="text-sm font-medium text-gray-600  hover:underline"
              >
                3 star
              </a>
              <div className="flex-grow h-5 mx-4 bg-gray-200 rounded ">
                <div
                  className="h-5 bg-orange-300 rounded"
                  style={{ width: "0" }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-500 ">0%</span>
            </div>
            <div className="flex items-center mt-4">
              <a
                href="#"
                className="text-sm font-medium text-gray-600  hover:underline"
              >
                2 star
              </a>
              <div className="flex-grow h-5 mx-4 bg-gray-200 rounded ">
                <div
                  className="h-5 bg-orange-300 rounded"
                  style={{ width: "0" }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-500 ">0%</span>
            </div>
            <div className="flex items-center mt-4">
              <a
                href="#"
                className="text-sm font-medium text-gray-600  hover:underline"
              >
                1 star
              </a>
              <div className="flex-grow h-5 mx-4 bg-gray-200 rounded ">
                <div
                  className="h-5 bg-orange-300 rounded"
                  style={{ width: "0" }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-500 ">0%</span>
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
    <Dash
      noBreadcrumbs
      pageTitle={session?.user.username}
      meta={
        <Meta
          title={session?.user.username}
          description={`${session?.user.username} user profile`}
        />
      }
    >
      <div className="xl:hidden">
        <UserCard
          header
          isPublic={true}
          currentUser={user}
          session={session}
          sales={0}
          offers={0}
          friendsCount={0}
          status={friendStatus.status}
          isFriend={friendStatus.isFriend}
          isBlocked={friendStatus.blocked}
          isAccepted={friendStatus.accepted}
          handleFollow={handleFollow}
          handleBlock={handleBlocked}
          handleAccept={handleAccept}
          onMessageClick={() =>
            messageModal.onOpen(session?.user?.id, recipientId)
          }
        />
      </div>

      <div className="xl:flex gap-6 mb-10 xl:mt-10 px-6">
        <div className="w-full xl:w-9/12 h-64">
          <div className="flex gap-4 border-b border-gray-200 mb-6 font-medium text-lg ">
            <div
              onClick={() => setTab("details")}
              className={`pr-2 font-medium ${
                tab === "details" && "border-b-4 border-orange-default"
              } cursor-pointer pb-2`}
            >
              Details
            </div>
            <div
              onClick={() => setTab("offers")}
              className={`pr-2 font-medium ${
                tab === "offers" && "border-b-4 border-orange-default"
              } cursor-pointer pb-2`}
            >
              Offers
            </div>
            <div
              onClick={() => setTab("reviews")}
              className={`pr-2 font-medium ${
                tab === "reviews" && "border-b-4 border-orange-default"
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
            isPublic={true}
            currentUser={user}
            session={session}
            sales={0}
            offers={0}
            friendsCount={0}
            status={friendStatus.status}
            isFriend={friendStatus.isFriend}
            isBlocked={friendStatus.blocked}
            isAccepted={friendStatus.accepted}
            handleFollow={handleFollow}
            handleBlock={handleBlocked}
            handleAccept={handleAccept}
            onMessageClick={() =>
              messageModal.onOpen(session?.user?.id, recipientId)
            }
          />
          {user?.profile?.bio && (
            <div className="col-span-12 lg:col-span-8">
              <Card title={`Bio`} icon={<RiProfileLine />}>
                <p>
                  {user?.profile?.bio || (
                    <span className="italic">No bio yet</span>
                  )}
                </p>
              </Card>
            </div>
          )}
          <Card
            className="p-6 text-sm text-gray-600"
            title={`More Info`}
            icon={<MdOutlineContactPage />}
          >
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
              <div>{"United Kingdom"}</div>
            </div>

            <div className="flex justify-between items-center">
              <div>Last seen</div>
              <div>{user?.lastLogin || "Recently"}</div>
            </div>
          </Card>

          {/* { user?.profile?.social && 
            user?.profile?.social.facebook !== "" && 
            user?.profile?.social.instagram !== "" && 
            user?.profile?.social.linkedin !== "" && 
            user?.profile?.social.reddit !== "" && 
            user?.profile?.social.twitch !== "" && 
            user?.profile?.social.twitch !== "" && 
            user?.profile?.social.youtube && (
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
                  {user?.profile?.social &&
                    user?.profile?.social?.instagram && (
                      <FaInstagram className="text-2xl rounded-full p-1 border-2 border-social-instagram text-social-instagram" />
                    )}
                </div>
              </div>
            </Card>
          )} */}
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

    const findFriend = sessionUser.friends?.find((friend) => friend.id === id);

    const isBlocked = sessionUser.blockedFriends?.some(
      (blocked) => blocked.friendBlockedId === id
    );

    const friend = {
      id: id,
      accepted: findFriend?.accepted || false,
      status: findFriend?.relationshipStatus || "",
      blocked: isBlocked || false,
      isFriend: findFriend ? true : false,
      friendshipId: findFriend?.friendshipId || "",
    };

    return {
      props: {
        user,
        session,
        friend,
      },
    };
  } catch (error) {
    console.error("Error fetching user/listing:", error);
    return {
      props: {
        user: null,
        session: null,
      },
    };
  }
};

export default profile;
