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

interface ReviewProps {
  review: IReview;
}

const Index = ({ listing, session }: any) => {
  const [disabled, setDisabled] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("description");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

    const InitialLoading = {
      cancelled: false,
      yes: false,
      no: false,
      accepted: false,
      completed: false,
      contact: false,
      negotiating: false,
    }

  const [loadingState, setLoadingState ] = useState(InitialLoading)
  const [userLoading, setUserLoading] = useState(true);
  const [statusIsLoading, setStatusIsLoading] = useState(false);
  const [bids, setBids] = useState<any[]>([]);
  const [completedBy, setCompletedBy] = useState<string | null>();
  const [currentBid, setCurrentBid] = useState({
    currentPrice: "",
    byUserId: "",
    byUsername: "",
    me: {} as Bid,
    participant: {} as Bid,
  });
  const [status, setStatus] = useState<string>("");
  const [tab, setTab] = useState("details");
  const [timeSinceCreated, setTimeSinceCreated] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [me, setMe] = useState<ProfileUser>();
  const [participant, setParticipant] = useState<ProfileUser>();
  const [reviews, setReviews] = useState<{userReview: IReview, participantReview: IReview}>({
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
  ]

  const secondaryTabs = [
    { id: "description", label: "Description" },
    { id: "photos", label: "Photos" },
    { id: "user", label: session?.user?.id === listing?.sellerId ? "Buyer" : "Seller" + "Details" },
  ]

  useEffect(() => {
    if (activeSubTab === "user") {
      const getUserStats = async () => {
        if (!participant) console.log("no participant");
        const userId = participant?.id;
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
          const trustScore = Math.trunc( ( (totalCompletedListings - totalCancelledListings) / totalListings) * 100 );
          setParticipant((prev) => {
            return { ...prev, ...stats, trustScore };
          });
          setUserLoading(false);
        } catch (error) { console.error(error); }
      };
      getUserStats();
    }
  }, [activeSubTab]);

  useEffect(() => {
    socketRef.current = io(config.PORT);
    socketRef.current && socketRef.current.emit("join_room", listing.id);
    return () => {
      socketRef.current?.emit("leave_room", listing.id);
      socketRef.current?.off("join_room");
      socketRef.current?.disconnect();
    };
  }, [listing?.id]);

  useEffect(() => {
    if (!session || !session.user?.id) {
      return;
    }
    if (listing?.sellerId === session?.user?.id) {
      setMe(listing?.seller);
      setParticipant((prev) => {
        return { ...prev, ...listing?.buyer };
      });
    } else {
      setMe(listing?.buyer);
      setParticipant((prev) => {
        return { ...prev, ...listing?.seller };
      });
    }
    setMessages([...listing.messages].reverse());

    setCompletedBy(listing?.completedById);
  }, [listing.id, session?.user?.id]);

  useEffect(() => {
    setIsLoading(true);
    if (!session || !session.user?.id || !listing?.bids) {
      return;
    }
    const reversedBids = [...listing.bids].reverse();
    setBids(listing.bids);

    setCurrentBid({
      currentPrice:
        listing?.bids.length > 0
          ? listing.bids[listing.bids.length - 1].price
          : listing?.price,
      byUserId: listing.bids[listing.bids.length - 1]?.userId || listing.userId,
      byUsername:
        listing.bids[listing.bids.length - 1]?.user?.username ||
        listing.sellerId === listing.userId
          ? listing.seller.username
          : listing.buyer.username,
      me: reversedBids.filter((bid: Bid) => bid.userId === me?.id)[0],
      participant: reversedBids.filter(
        (bid: Bid) => bid.userId === participant?.id
      )[0],
    });
  setIsLoading(false);

  }, [ listing.bids,
      listing.price,
      listing.sellerId,
      listing.seller.username,
      listing.buyer.username,
      session?.user.id,
      me?.id,
      participant?.id,
    ]
  );
  useEffect(() => {

    if (!session || !session.user?.id || !listing?.status) {
      return;
    }

    if (!session) { 
      setIsLoading(true) 
    }

    if (listing.status === "pending") { 
      setDisabled(true); 
    }

    if (listing.status === "accepted") { 
      setDisabled(true) 
    }
    
    setStatus(listing?.status);
    setActivities([...listing?.activities].reverse());

    const created = new Date(listing?.createdAt);
    timeInterval(created, setTimeSinceCreated);
    setIsLoading(false);
    setDisabled(false);
    setReviews({
      userReview: listing.reviews.find((item: IReview) => item.userId === session?.user.id),
      participantReview: listing.reviews.find((item: IReview) => item.userId !== session?.user.id),
    });

  }, [listing?.status, listing?.activities, listing?.createdAt, session]);

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
          if (listingId === listing.id) {
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
                  listing?.bids && listing?.bids.length > 0
                    ? listing.bids[listing.bids.length - 1]
                    : null,
              };
              return newBid;
            });
            setStatus("negotiating");
          }
        }
      );

    socketRef.current &&
      socketRef.current.on("update_status", ({ newStatus, listingId }) => {
        if (listingId === listing.id) {
          console.log(
            `Received status update for listing ${listingId}: ${newStatus}`
          );
          setStatus(newStatus);
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
        : listing?.price)
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

    setLoadingState((prev) => ( { ...prev, completed: true } ) )

    if(!userId || !participantId) return console.log("Invalid entries")
    try {
      const url = '/api/getConversationIdByParticipantIds'
     await axios.post(url, {
        userId: userId,
        participantId: participantId
      }).then((res) => {
        if(!res.data) return console.log("No conversation found")
        const conversationId = res.data.id
        router.push(`/dashboard/conversations?conversationId=${conversationId}`)
      }).catch((err) => {
        console.log(err)
      }).finally(() => {
        setLoadingState((prev) => ( { ...prev, completed: false } ) )
      })
    } catch (error) { console.log(error) }
  }

  const handleStatusChange = async (status: string, userId: string) => {

    const statusMessage = createStatusAlert(status, bids, currentBid, listing);

    confirmationModal.onOpen(
      "Are you sure you want to " + statusMessage + "?",
      async () => {

        setStatusIsLoading(true);

        if(status === "rejected") setLoadingState((prev) => { return {...prev, no: true}})
        if(status === "accepted") setLoadingState((prev) => { return {...prev, yes: true}})
        if(status === "completed") setLoadingState((prev) => { return {...prev, completed: true}})
        if(status === "cancelled") setLoadingState((prev) => { return {...prev, cancelled: true}})
        if(status === "negotiating") setLoadingState((prev) => { return {...prev, negotiating: true}})

        const update = await axios
          .put(`/api/updateListing/status`, {
            status: status,
            listingId: listing.id,
            userId: userId,
            completedById: userId,
          })
          .then((response) => {

            setStatus(status);
            setCompletedBy(userId);

            socketRef.current?.emit("update_status", {
              newStatus: status,
              listingId: listing.id,
            });
            socketRef.current?.emit(
              "update_activities",
              response.data.transactionResult,
              response.data.listing.sellerId,
              response.data.listing.buyerId
            );
          })
          .catch((err) => {
            console.log("Something went wrong!");
          })
          .finally(() => {
            setStatusIsLoading(false);
            setLoadingState(InitialLoading)
          });
      }
    );
  };

  const userReview =
    listing.reviews.find((item: Review) => item.userId === session?.user.id) ||
    null;
  const participantReview =
    listing.reviews.find((item: Review) => item.userId !== session?.user.id) ||
    null;

  const MainBody = (
    <>
      <div className="">
        <Header
          status={status}
          title={listing.title}
          price={listing.price}
          category={listing.category}
          currentBid={currentBid} 
        />

       <Tabs status={status} tabs={secondaryTabs} setTab={setActiveSubTab} tab={activeSubTab} />
       
        {activeSubTab === "description" && (
          <p className="leading-relaxed first-letter:uppercase mb-6">
            {listing.description}
          </p>
        )}

        {activeSubTab === "photos" && (
          <div className=" justify-center z-50 mb-6">
            <ImageSlider images={listing.image} />
          </div>
        )}
        {activeSubTab === "user" && (
          <div className=" justify-center z-50 mb-6">
            { session?.user.id && (
              <div>
                <UserStats userLoading={userLoading} participant={participant} />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    listing && (
      <Dash meta={<Meta title="" description="" />}>

        <div className="px-4 mt-8 md:mt-0 md:p-6 lg:p-8 mx-auto xl:grid xl:grid-cols-12 gap-6">

          <OfferAlerts handleStatusChange={handleStatusChange} session={session} participant={participant} status={status} completedBy={completedBy} listing={listing} handleFinalise={handleFinalise} />
          
          <div className="w-full col-span-6 xl:col-span-8">
            <Tabs status={status} tabs={mainTabs} setTab={setTab} tab={tab} isListing main  />

            {tab === "chat" && (

              <div className="messages pt-6 mb-6">

                {status === "negotiating" && (
                  <ListingChat
                    listing={listing}
                    user={session?.user}
                    disabled={disabled}
                    session={session}
                    messages={messages}
                    setMessages={setMessages}
                    socketRef={socketRef}
                  />
                )}

                {status === "accepted" && (
                  <div className="w-full  p-4 white border-l-4 border-orange-400">
                    <div>
                      {listing.user === session?.user
                        ? "Your offer was acceped"
                        : "You accepted the offer"}
                      . If you need to contact the
                      {listing.buyerId === session?.user?.id
                        ? "seller"
                        : "buyer"}{" "}
                      seller{" "}
                      <span className="text-orange-500 underline cursor-pointer">
                        click here
                      </span>
                    </div>
                  </div>
                )}

                {status === "awaiting approval" && (
                  <div className="w-full  p-4 white border-l-4 border-orange-400 flex gap-2 justify-between items-center">
                    {listing.userId === session?.user?.id ? (
                      <div>
                        Your offer has been created. A request has been sent to{" "}
                        {participant?.username}.
                      </div>
                    ) : (
                      <div>
                        You have received a offer from {participant?.username}
                      </div>
                    )}
                    {listing.userId !== session?.user?.id && (
                      <Button
                        primary
                        label={`Let's haggle`}
                        onClick={() =>
                          handleStatusChange("negotiating", session?.user?.id)
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
                    { reviews.userReview && <ReviewBox review={reviews.userReview}  /> }
                    { reviews.participantReview && <ReviewBox review={reviews.participantReview} /> }
                    {!reviews.userReview && (
                      <ReviewForm
                        listingId={listing.id}
                        sessionId={session?.user.id}
                        sellerId={listing.sellerId}
                        buyerId={listing.buyerId}
                        disabled={disabled}
                        setReviews={setReviews}
                        ownerId={listing.userId}
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
          {
            <div className="w-full xl:col-span-4 col-span-4 flex flex-col gap-4">
              <OfferDetailsWidget
                listing={listing}
                status={status || "pending"}
                session={session}
                currentBid={currentBid}
                setCurrentBid={setCurrentBid}
                bids={bids}
                setBids={setBids}
                handleStatusChange={handleStatusChange}
                isLoading={statusIsLoading}
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
          }
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
