import { GetServerSideProps } from "next";
import { useEffect, useRef, useState } from "react";
import { getSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import { config } from "@/config";
import { Dash } from "@/templates/dash";
import { Meta } from "@/layouts/meta";
import { timeInterval, timeSince } from "@/utils/formatTime";
import { Activity, ProfileUser } from "@/interfaces/authenticated";
import { Bid, Profile, Review, User } from "@prisma/client";
import axios from "axios";
import getListingById from "@/actions/getListingById";
import ListingChat from "@/components/chat/ListingChat";
import OfferDetailsWidget from "@/components/dashboard/offer/OfferDetailsWidget";
import ReviewForm from "@/components/dashboard/offer/ReviewForm";
import Loading from "@/components/LoadingScreen";
import ReviewBox from "@/components/dashboard/reviews/ReviewBox";
import Bids from "@/components/dashboard/offer/Bids";
import ImageSlider from "@/components/dashboard/offer/ImageSlider";
import useConfirmationModal from "@/hooks/useConfirmationModal";
import UserStats from "@/components/dashboard/UserStats";
import OfferAlerts from "@/components/dashboard/offer/OfferAlerts";
import Tabs from "@/components/dashboard/Tabs";
import Button from "@/components/dashboard/Button";
import Header from "@/components/dashboard/offer/Header";
import { useRouter } from "next/navigation";
import { CiMedicalCross, CiLocationOn, CiDeliveryTruck, CiCalendar  } from "react-icons/ci";
import { set } from "date-fns";

interface MessageProps {
  buyerId: string;
  sellerId: string;
  listingId: string;
  text: string;
  id: string;
}

interface IUser extends User {
  profile: Profile;
}
interface IReview extends Review {
  user: IUser;
}

const LOADING_STATE = {
  cancelled: false,
  yes: false,
  no: false,
  accepted: false,
  completed: false,
  contact: false,
  negotiating: false,
  user: false,
  status: false,
  loading: false,
};

const CURRENT_BID_STATE = {
  currentPrice: "",
  byUserId: "",
  byUsername: "",
  me: {} as Bid,
  participant: {} as Bid,
};

const initialState = {
  loading: { ...LOADING_STATE },
  bids: [],
  currentBid: CURRENT_BID_STATE,
  status: "",
  reviews: {
    userReview: {} as IReview,
    participantReview: {} as IReview,
  },
};

const Index = ({ listing, session }: any) => {
  const [disabled, setDisabled] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("description");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingState, setLoadingState] = useState(LOADING_STATE);
  const [bids, setBids] = useState<Bid[]>([]);
  const [completedBy, setCompletedBy] = useState<string | null>();
  const [currentBid, setCurrentBid] = useState(CURRENT_BID_STATE);
  const [status, setStatus] = useState<string>("");
  const [tab, setTab] = useState("details");
  const [timeSinceCreated, setTimeSinceCreated] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [me, setMe] = useState<ProfileUser>();
  const [participant, setParticipant] = useState<ProfileUser>();

  const { user: sessionUser } = session;
  const {
    id,
    title,
    createdAt,
    updatedAt,
    description,
    price,
    status: listingStatus,
    sellerId,
    seller,
    buyer,
    bids: listingBids,
    image: listingImage,
    userId,
    reviews: listingReviews,
    category,
    user: listingUser,
    activities: listingActivities,
    completedById,
    completedBy: listingCompletedBy,
  } = listing;

  if (!sessionUser || !listing) return <Loading />;

  const [reviews, setReviews] = useState<{
    userReview: IReview;
    participantReview: IReview;
  }>({
    userReview: {} as IReview,
    participantReview: {} as IReview,
  });

  const now = Date.now();
  const socketRef = useRef<Socket>();

  const mainTabs = [
    { id: "details", label: "Details" },
    { id: "chat", label: "Chat" },
    { id: "activity", label: "Activity" },
    { id: "bids", label: "Bid History" },
  ];

  const secondaryTabs = [
    { id: "description", label: "Description" },
    { id: "photos", label: "Photos" },
    {
      id: "user",
      label: sessionUser?.id === sellerId ? "Buyer" : "Seller" + "Details",
    },
  ];

  useEffect(() => {
    if (activeSubTab === "user") {
      const getUserStats = async () => {
        if (!participant) console.log("No participant");

        const userId = participant?.id;
        const url = `/api/dashboard/getUserStats`;

        try {
          setLoadingState((prev) => ({ ...prev, user: true }));

          const response = await axios.post(url, {
            userId,
            sessionId: sessionUser?.id,
          });

          const stats = response.data;
          const totalListings = stats.sentCount + stats.receivedCount;
          const totalCancelledListings =
            stats.cancelledSentCount + stats.cancelledReceivedCount;
          const totalCompletedListings =
            stats.completedSentCount + stats.completedReceivedCount;
          const trustScore = Math.trunc(
            ((totalCompletedListings - totalCancelledListings) /
              totalListings) *
              100
          );

          setParticipant((prev) => ({ ...prev, ...stats, trustScore }));
          setLoadingState((prev) => ({ ...prev, user: false }));
        } catch (error) {
          console.error(error);
        }
      };
      getUserStats();
    }
  }, [activeSubTab]);

  const updateLoadingState = (key: string, value: boolean) => {
    setLoadingState((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    socketRef.current = io(config.PORT);
    socketRef.current && socketRef.current.emit("join_room", id);
    return () => {
      socketRef.current?.emit("leave_room", id);
      socketRef.current?.off("join_room");
      socketRef.current?.disconnect();
    };
  }, [id]);

  useEffect(() => {
    if (!session || !sessionUser.id) {
      return;
    }
    if (sellerId === sessionUser?.id) {
      setMe(seller);
      setParticipant((prev) => {
        return { ...prev, ...buyer };
      });
    } else {
      setMe(buyer);
      setParticipant((prev) => {
        return { ...prev, ...seller };
      });
    }
    setMessages([...messages].reverse());

    setCompletedBy(completedById);
  }, [id, sessionUser?.id]);

  useEffect(() => {
    setLoadingState((prev) => ({ ...prev, loading: true }));

    if (!session || !sessionUser?.id || !listingBids) {
      return;
    }
    const reversedBids = [...listingBids].reverse();

    setBids(listingBids);

    setCurrentBid({
      currentPrice:
        listingBids && listingBids.length > 0
          ? listingBids[listingBids.length - 1].price
          : price && price,
      byUserId:
        (listingBids && listingBids[listingBids.length - 1]?.userId) || userId,
      byUsername:
        (listingBids && listingBids[listingBids.length - 1]?.user?.username) ||
        sellerId === userId
          ? seller.username
          : buyer.username,
      me: reversedBids.filter((bid: Bid) => bid.userId === me?.id)[0],
      participant: reversedBids.filter(
        (bid: Bid) => bid.userId === participant?.id
      )[0],
    });

    setLoadingState((prev) => ({ ...prev, loading: false }));
  }, [
    listingBids,
    price,
    sellerId,
    seller?.username,
    buyer?.username,
    sessionUser.id,
    me?.id,
    participant?.id,
  ]);
  useEffect(() => {
    if (!session || !sessionUser?.id || !listingStatus) {
      return;
    }

    if (!session) {
      setLoadingState((prev) => ({ ...prev, loading: true }));
    }

    if (status === "pending") {
      setDisabled(true);
    }

    if (status === "accepted") {
      setDisabled(true);
    }

    setStatus(listingStatus);
    setActivities([...listingActivities].reverse());

    const created = new Date(createdAt);
    timeInterval(created, setTimeSinceCreated);

    setReviews({
      userReview: listingReviews.find(
        (item: IReview) => item.userId === sessionUser.id
      ),
      participantReview: listingReviews.find(
        (item: IReview) => item.userId !== sessionUser.id
      ),
    });

    setLoadingState((prev) => ({ ...prev, loading: false }));
    setDisabled(false);
  }, [
    listingStatus,
    ,
    createdAt,
    sessionUser?.id,
    listingReviews,
    listingActivities,
  ]);

  useEffect(() => {
    socketRef.current &&
      socketRef.current.on("new_listing_message", (newMessage: any) => {
        console.log("Received new message: ", newMessage);
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });

    socketRef.current &&
      socketRef.current.on(
        "updated_bid",
        ({ price, userId, username, listingId, previous }) => {
          if (listingId === id) {
            console.log(
              `Received bid price update for listing ${listingId}: ${price}`
            );
            setBids((prevBids) => {
              let temporaryId = (Math.random() + 1).toString(36).substring(7);
              const newBid = {
                id: temporaryId,
                price: price,
                userId: userId,
                listingId: listingId,
                previous: previous,
                createdAt: new Date(now),
                updatedAt: new Date(now),
              };
              const updatedBids = [...prevBids, newBid];
              return updatedBids;
            });

            setCurrentBid((prev) => {
              const newBid = {
                ...prev,
                currentPrice: price,
                byUserId: userId || "",
                byUsername: username || "",
                me:
                  listingBids && listingBids.length > 0
                    ? listingBids[listingBids.length - 1]
                    : null,
              };
              return newBid;
            });
            setStatus("negotiating");
          }
        }
      );

    socketRef.current &&
      socketRef.current.on("update_status", ({ newStatus, listingId, userId }) => {
        if (listingId === id) {
          console.log(
            `Received status update for listing ${listingId}: ${newStatus}`
          );
          setStatus(newStatus);
          setCompletedBy(userId);

        }
      });

    return () => {
      socketRef.current?.off("updated_bid");
      socketRef.current?.off("update_status");
      socketRef.current?.disconnect();
    };
  }, []);

  const confirmationModal = useConfirmationModal();

  const createAlertMessage = (
    bids: any[],
    currentBid: any,
    listing: any,
    baseMessage: string
  ): string => {
    return (
      baseMessage +
      (bids && bids[0]?.id
        ? bids[bids.length - 1]?.price
        : currentBid.currentPrice
        ? currentBid.currentPrice
        : price)
    );
  };
  const createStatusAlert = (
    status: string,
    bids: any[],
    currentBid: any,
    listing: any
  ): string | null => {
    const messages: { [key: string]: string } = {
      pending: "Pending",
      "awaiting approval": "Awaiting Approval",
      accepted: createAlertMessage(
        bids,
        currentBid,
        listing,
        "accept this offer for £"
      ),
      rejected: createAlertMessage(
        bids,
        currentBid,
        listing,
        "reject the current bid for £"
      ),
      negotiating: "start negotiating",
      completed: "mark this offer as completed",
      cancelled: "terminate this offer",
    };

    return messages[status] || null;
  };

  const router = useRouter();

  const handleFinalise = async (userId: any, participantId: any) => {
    setLoadingState((prev) => ({ ...prev, completed: true }));

    if (!userId || !participantId) return console.log("Invalid entries");
    try {
      const url = "/api/getConversationIdByParticipantIds";
      await axios
        .post(url, {
          userId: userId,
          participantId: participantId,
        })
        .then((res) => {
          if (!res.data) return console.log("No conversation found");
          const conversationId = res.data.id;
          router.push(
            `/dashboard/conversations?conversationId=${conversationId}`
          );
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setLoadingState((prev) => ({ ...prev, completed: false }));
        });
    } catch (error) {
      console.log(error);
    }
  };

  const handleStatusChange = async (status: string, userId: string) => {
    const statusMessage = createStatusAlert(status, bids, currentBid, listing);

    confirmationModal.onOpen(
      "Are you sure you want to " + statusMessage + "?",
      async () => {
        setLoadingState((prev) => ({ ...prev, status: true }));

        if (status === "rejected")
          setLoadingState((prev) => {
            return { ...prev, no: true };
          });
        if (status === "accepted")
          setLoadingState((prev) => {
            return { ...prev, yes: true };
          });
        if (status === "completed")
          setLoadingState((prev) => {
            return { ...prev, completed: true };
          });
        if (status === "cancelled")
          setLoadingState((prev) => {
            return { ...prev, cancelled: true };
          });
        if (status === "negotiating")
          setLoadingState((prev) => {
            return { ...prev, negotiating: true };
          });

        await axios
          .put(`/api/updateListing/status`, {
            status: status,
            listingId: id,
            userId: userId,
            completedById: sessionUser.id,
          })
          .then((response) => {
            setStatus(status);
            setCompletedBy(sessionUser.id);

            socketRef.current?.emit("update_status", {
              newStatus: status,
              listingId: id,
              userId: userId,
            });

            console.log("Status updated successfully!", response.data);
            socketRef.current?.emit(
              "update_activities",
              response.data.transactionResult,
              response.data.sellerId,
              response.data.buyerId
            );
          })
          .catch((err) => {
            console.log("Something went wrong!");
          })
          .finally(() => {
            setLoadingState((prev) => ({ ...prev, status: false }));
            setLoadingState(LOADING_STATE);
          });
      }
    );
  };


  const MainBody = (
    <>
      <div className="">
        <Header
          status={status}
          title={title}
          price={price}
          category={category}
          currentBid={currentBid}
        />

        <Tabs
          status={status}
          tabs={secondaryTabs}
          setTab={setActiveSubTab}
          tab={activeSubTab}
        />

        {activeSubTab === "description" && (
          <>
            <p className="leading-relaxed first-letter:uppercase border-b border-gray-200 pb-6 mb-6">
              {description}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 border-b border-gray-200 pb-6 mb-6 auto-cols-fr gap-4">
              <div className="flex-1">
                <div className="flex gap-2">
                  <CiMedicalCross className="w-6 h-6" />
                  <div>
                    <p className="font-bold">Condition</p>
                    <p className="capitalize">{listing?.options?.condition}</p>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex gap-2">
                  <CiLocationOn className="w-6 h-6" />
                  <div>
                    <p className="font-bold">Location</p>
                    <p className="capitalize">{ listing?.options?.location?.city ? listing.options.location.city : listing?.options?.location.region ? listing.options.location.region : 'Unknown' }</p>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex gap-2">
                  <CiDeliveryTruck className="w-6 h-6" />
                  <div>
                    <p className="font-bold">Pickup</p>
                    <p className="capitalize">{ 
                    listing?.options?.pickup ? 
                     listing.options.pickup === 'both' ? 
                    'Collection or Delivery' : `
                    ${listing.options.pickup} Only` : 'Unknown' }</p>

                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex gap-2">
                <CiCalendar className="w-6 h-6" />
                  <div>
                    <p className="font-bold">Created</p>
                    { new Date(createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
              
            </div>
          </>
        )}

        {activeSubTab === "photos" && (
          <div className=" justify-center z-50 mb-6">
            <ImageSlider images={listingImage} />
          </div>
        )}
        {activeSubTab === "user" && (
          <div className=" justify-center z-50 mb-6">
            {sessionUser.id && (
              <div>
                <UserStats
                  userLoading={loadingState.user}
                  participant={participant}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );

  if (loadingState.loading) {
    return <Loading />;
  }

  return (
    listing && (
      <Dash meta={<Meta title="" description="" />}>
        <div className=" flex flex-col px-4 mt-8 md:mt-0 md:p-6 lg:p-8 mx-auto xl:grid xl:grid-cols-12 gap-6">
          <OfferAlerts
            handleStatusChange={handleStatusChange}
            session={session}
            participant={participant}
            status={status}
            completedBy={completedBy}
            listing={listing}
            handleFinalise={handleFinalise}
          />

          <div className="w-full col-span-6 xl:col-span-8 order-3 md:order-2">
            <Tabs
              status={status}
              tabs={mainTabs}
              setTab={setTab}
              tab={tab}
              isListing
              main
            />

            {tab === "chat" && (
              <div className="messages pt-6 mb-6">
                {status === "negotiating" && (
                  <ListingChat
                    listing={listing}
                    user={sessionUser}
                    disabled={disabled}
                    session={session}
                    messages={messages}
                    setMessages={setMessages}
                    socketRef={socketRef}
                  />
                )}

                {status === "accepted" && (
                  <div className="w-full  p-4 white border-l-4 border-orange-400">
                    {listingUser === sessionUser
                      ? "Your offer was acceped! "
                      : "You accepted the offer! "}{" "}
                    If you need to contact the
                    {buyer?.id === sessionUser?.id ? "seller" : "buyer"}{" "}
                    <span className="text-orange-500 underline cursor-pointer">
                      click here
                    </span>
                  </div>
                )}

                {status === "awaiting approval" && (
                  <div className="w-full  p-4 white border-l-4 border-orange-400 flex gap-2 justify-between items-center">
                    {userId === sessionUser?.id ? (
                      <div>
                        Your offer has been created. A request has been sent to{" "}
                        {participant?.username}.
                      </div>
                    ) : (
                      <div>
                        You have received a offer from {participant?.username}
                      </div>
                    )}
                    {userId !== sessionUser?.id && (
                      <Button
                        primary
                        label={`Let's haggle`}
                        onClick={() =>
                          handleStatusChange("negotiating", sessionUser?.id)
                        }
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {tab === "details" && (
              <>
                {MainBody}
                {status === "completed" && (
                  <div className="hidden md:block">
                    {reviews.userReview && (
                      <ReviewBox review={reviews.userReview} />
                    )}
                    {reviews.participantReview && (
                      <ReviewBox review={reviews.participantReview} />
                    )}
                    {!reviews.userReview && (
                      <ReviewForm
                        listingId={id}
                        sessionId={sessionUser.id}
                        sellerId={sellerId}
                        buyerId={buyer.id}
                        disabled={disabled}
                        setReviews={setReviews}
                        ownerId={userId}
                        username={me?.username || ""}
                      />
                    )}
                  </div>
                )}
              </>
            )}

            {tab === "activity" &&
              activities?.map((activity: any, i: number) => (
                <div
                  key={i}
                  className="flex gap-4 justify-between py-2 border-b border-gray-200 mb-6"
                >
                  <div>{activity.message}</div>
                  <div className="text-gray-500 text-sm italic">
                    {timeSince(activity.createdAt)}
                  </div>
                </div>
              ))}

            {tab === "bids" && (
              <div className="mb-6">
                <Bids bids={bids} participant={participant} me={me} />
              </div>
            )}
          </div>
          
          <div className="w-full xl:col-span-4 col-span-4 flex flex-col gap-4 order-2 md:order-3">
            <OfferDetailsWidget
              listing={listing}
              status={status || "pending"}
              session={session}
              currentBid={currentBid}
              setCurrentBid={setCurrentBid}
              bids={bids}
              setBids={setBids}
              handleStatusChange={handleStatusChange}
              isLoading={loadingState.status}
              loadingState={loadingState}
              setLoadingState={setLoadingState}
              timeSinceCreated={timeSinceCreated}
              me={me}
              participant={participant}
              socketRef={socketRef}
              setCompletedBy={setCompletedBy}
              completedBy={completedBy}
              setStatus={setStatus}
              handleFinalise={handleFinalise}
            />
          </div>
          
        </div>
      </Dash>
    )
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const offerId = context.params?.id as string;

  try {
    const listing = await getListingById({ offerId });
    return {
      props: {
        listing,
        session,
      },
    };
  } catch (error) {
    console.error("Error fetching listing:", error);
    return {
      notFound: true,
    };
  }
};

export default Index;
