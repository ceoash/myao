import axios from "axios";
import getBidByID from "@/actions/getBidByID";
import { GetServerSideProps } from "next";
import { use, useEffect, useRef, useState } from "react";
import { getSession, useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";
import { config } from "@/config";
import useSearchModal from "@/hooks/useSearchModal";

import { Dash } from "@/templates/dash";
import { Meta } from "@/layouts/meta";

import Link from "next/link";
import ListingChat from "@/components/chat/ListingChat";
import OfferDetailsWidget from "@/components/dashboard/offer/OfferDetailsWidget";
import ReviewForm from "@/components/dashboard/offer/ReviewForm";
import Spinner from "@/components/Spinner";
import { toast } from "react-hot-toast";

import { timeInterval, timeSince } from "@/utils/formatTime";
import { Activity } from "@/interfaces/authenticated";
import { Bid, Profile, Review, User } from "@prisma/client";
import ReviewBox from "@/components/dashboard/reviews/ReviewBox";
import Bids from "@/components/dashboard/offer/Bids";
import OfferTypeBadge from "@/components/dashboard/offer/OfferTypeBadge";
import ImageSlider from "@/components/dashboard/offer/ImageSlider";
import AlertBanner from "@/components/dashboard/AlertBanner";
import Image from "next/image";
import { BiStar } from "react-icons/bi";
import Badge from "@/components/dashboard/offer/Badge";
import StatusChecker from "@/utils/status";

interface IBid extends Bid {
  user: User;
}

interface ProfileUser extends User {
  profile: Profile;
  bids?: IBid[];
}

const Index = ({ listing }: any) => {
  const [disabled, setDisabled] = useState(false);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState("description");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bids, setBids] = useState<any[]>([]);
  const [completedBy, setCompletedBy] = useState<string | null>();
  const [currentBid, setCurrentBid] = useState({
    currentPrice: "",
    byUserId: "",
    byUsername: "",
    me: {} as Bid,
    participant: {} as Bid,
  });
  const [status, setStatus] = useState<string | null>(null);
  const [tab, setTab] = useState("details");
  const [timeSinceCreated, setTimeSinceCreated] = useState<string | null>(null);
  const [me, setMe] = useState<ProfileUser>();


  const [participant, setParticipant] = useState<ProfileUser>();
  const router = useRouter();
  // const DeleteListing = useDeleteConfirmationModal();
  const SearchModal = useSearchModal();
  const { data: session } = useSession();

  const now = Date.now();

  const socketRef = useRef<Socket>();

  useEffect(() => {
    socketRef.current = io(config.PORT);
    socketRef.current && socketRef.current.emit("join_room", listing.id);
    return () => {
      socketRef.current?.emit("leave_room", listing.id);
      socketRef.current?.off("join_room");
      socketRef.current?.disconnect();
    };
  }, [listing?.id]);




  //const reversedBids = [...bids].reverse();
  const [meBid, setMeBid] = useState<Bid | null>(null);
  const [participantBid, setParticipantBid] = useState<Bid | null>(null);

  useEffect(() => {
    if (!session || !session.user?.id) {
      return;
    }
    if (listing?.sellerId === session?.user?.id) {
      setMe(listing?.seller);
      setParticipant(listing?.buyer);
    } else {
      setMe(listing?.buyer);
      setParticipant(listing?.seller);
    
    }
  }, [listing.id, session?.user?.id])

  useEffect(() => {
    const reversedBids = [...listing.bids].reverse();
    setBids(listing.bids);
    setCurrentBid({
      currentPrice:
        listing?.bids.length > 0
          ? listing.bids[listing.bids.length - 1].price
          : listing?.price,
      byUserId: session?.user.id,
      byUsername:
        listing?.sellerId === session?.user.id
          ? listing?.seller.username
          : listing?.buyer.username,
      me: reversedBids.filter((bid: Bid) => bid.userId === me?.id)[0],
      participant: reversedBids.filter((bid: Bid) => bid.userId === participant?.id)[0],
    });
  }, [listing.bids, listing.price, listing.sellerId, listing.seller.username, listing.buyer.username, session?.user.id, me?.id, participant?.id]);
  
  useEffect(() => {
    if(!session) {
      setIsLoading(true);
    };
    
   
    if (listing.status === "pending") {
      setDisabled(true);
      setStatus(listing?.status);
    }
    if (listing.status === "awaiting approval") {
      setStatus(listing?.status);
    }
    if (listing.status === "accepted") {
      setDisabled(true);
    }
    
    setStatus(listing?.status);

    setActivities([...listing?.activities].reverse());
    const created = new Date(listing?.createdAt);
    timeInterval(created, setTimeSinceCreated);
    setIsLoading(false);
    setDisabled(false);
  }, []);

  useEffect(() => {

    socketRef.current &&
      socketRef.current.on("updated_bid", ({ price, userId, username, listingId}) => {
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
            previous: listing?.bids && listing?.bids.length > 0 ? listing.bids[listing.bids.length - 1].price : listing?.price,
            createdAt: new Date(now),
            updatedAt: new Date(now),
          }
            const updatedBids = [...prevBids, newBid];
            return updatedBids;
          });

          setCurrentBid((prev) => {
            const newBid = {
            ...prev,
            currentPrice: price,
            byUserId: userId || "",
            byUsername: username || "",
            me: listing?.bids && listing?.bids.length > 0 ? listing.bids[listing.bids.length - 1] : null,
            }
            return newBid;
          });
        }
      });

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

  const handleStatusChange = async (status: string, userId: string) => {
    await axios
      .put(`/api/updateListing/status`, {
        status: status,
        listingId: listing.id,
        userId: userId,
        completedById: userId,
      })
      .then((response) => {
        toast.success("Offer " + status);
        setStatus(status);
        setCompletedBy(userId);

        socketRef.current?.emit("update_status", {
          newStatus: status,
          listingId: listing.id,
        });
        console.log("response", response.data);
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
      .finally(() => {});
  };

  const userReview =
    listing.reviews.find((item: Review) => item.userId === session?.user.id) ||
    null;
  const participantReview =
    listing.reviews.find((item: Review) => item.userId !== session?.user.id) ||
    null;

  const body = (
    <>
      <div className=" ">
        <div className="md:flex md:justify-between">
          <div>
            <div className="text-gray-900 text-xl  md:text-2xl  font-bold first-letter:uppercase ">
              {listing.title}
            </div>
            <div className="  text-gray-500">{listing.category}</div>
            <div className="px-4 mt-2"></div>
          </div>
          <div className="hidden md:block">
            {currentBid.currentPrice && (
              <div className="text-right text-sm">
                {status === "accepted" ? (
                  <div>Agreed price</div>
                ) : (
                  <div className="text-right ">
                    Bid by
                    <Link
                      href={`/dashboard/profile/${currentBid.byUserId}`}
                      className="underline ml-[2px]"
                    >
                      {currentBid.byUsername}
                    </Link>
                  </div>
                )}
              </div>
            )}
            <div className="font-extrabold text-3xl text-right -mt-2">
              £
              {currentBid.currentPrice
                ? currentBid.currentPrice
                : listing.price || "Open offer"}
            </div>
          </div>
        </div>
        <div>
          <div className="flex mb-4 pb-4 border-b border-gray-200">
            <div className="flex flex-1 gap-4 font-bold items-start">
              <button
                className={` ${
                  activeSubTab === "description" &&
                  "border-orange-400 border-b-4"
                }`}
                onClick={() => setActiveSubTab("description")}
              >
                Description
              </button>
              <button
                onClick={() => setActiveSubTab("photos")}
                className={` ${
                  activeSubTab === "photos" && "border-orange-400 border-b-4"
                }`}
              >
                Photos
              </button>
              <button
                className={` ${
                  activeSubTab === "user" && "border-orange-400 border-b-4"
                }`}
                onClick={() => setActiveSubTab("user")}
              >
                {listing.sellerId !== session?.user.id ? "Seller" : "Buyer"}{" "}
                Details
              </button>
            </div>
          </div>
        </div>
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
            {session?.user.id ? (
              <div>
                {/* {listing.seller.username}
                      {listing.seller?.profile.bio}
                      {listing.seller?.profile.website}
                      {listing.seller.status}
                      {listing.seller.createdAt} */}
                <div className="grid grid-cols-2 auto-cols-fr gap-2">
                  <div className="flex flex-col p-4 items-center">
                    <div className="p-4 w-40 h-40 rounded-full relative">
                      <Image
                        src={`/images/placeholders/avatar.png`}
                        className="border p-1 border-gray-200 rounded-full"
                        alt="Avatar"
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div className="p-4 text-center">
                      <h4>{participant?.username}</h4>
                      <span className="text-xl text-gray-400">
                        <BiStar className="inline-block text-orange-500" />
                        <BiStar className="inline-block text-orange-500" />
                        <BiStar className="inline-block text-orange-500" />
                        <BiStar className="inline-block text-orange-500" />
                        <BiStar className="inline-block text-orange-500" />
                      </span>
                      <p>{participant?.profile?.bio}</p>
                    </div>
                  </div>
                  <div className="flex flex-col p-4">
                    <div className="text-center">
                      <h2 className="-mb-2">0</h2>
                      <p>Offers Completed</p>
                    </div>
                    <div className="text-center">
                      <h2 className="-mb-2">0</h2>
                      <p>Offers Rejected</p>
                    </div>
                    <div className="text-center">
                      <h2 className="-mb-2">0</h2>
                      <p>Bids Placed</p>
                    </div>
                    <div className="text-center">
                      <h2 className="-mb-2">100%</h2>
                      <p>Trust Score</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {/* {listing.buyer.username}
                                {listing.buyer.bio}
                                {listing.buyer.status}
                                {listing.buyer.createdAt} */}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );

  

  if (isLoading) {
    return <Spinner />;
  }

  const parsedImages = JSON.parse(listing?.image);

  return (
    listing && (
      <Dash meta={<Meta title="" description="" />}>
        <div className=" md:p-6 lg:p-8 mx-auto xl:grid xl:grid-cols-12 gap-6">
          {status === "accepted" && (
            <AlertBanner
              text="This offer has been accepted"
              success
              button
              buttonText={"Leave a review"}
            />
          )}
          {status === "rejected" && (
            <AlertBanner
              text="Your bid has been rejected. Enter a new bid to continue"
              danger
              button
              buttonText={`Contact ${
                listing.sellerId === session?.user.id ? "Buyer" : "Seller"
              }`}
            />
          )}
          {status === "cancelled" && (
            <AlertBanner
              text="This bid has been terminated."
              danger
              button
              buttonText={`Contact ${
                listing.sellerId === session?.user.id ? "Buyer" : "Seller"
              }`}
            />
          )}

          <div className="w-full col-span-6 xl:col-span-8">
            <div className="col-span-12 pb-4 flex font-bold font-md  md:font-xl gap-4 uppercase border-b border-gray-200 mb-4">
              <div
                onClick={() => setTab("details")}
                className={`cursor-pointer ${
                  tab === "details" && "border-b-4 border-orange-400 "
                }`}
              >
                Details
              </div>
              {status === "awaiting approval" || status ===  "negotiating" && (
                <div
                  onClick={() => setTab("chat")}
                  className={`cursor-pointer ${
                    tab === "chat" && "border-b-4 border-orange-400 "
                  }`}
                >
                  Chat
                </div>
              )}
              <div
                onClick={() => setTab("activity")}
                className={`cursor-pointer ${
                  tab === "activity" && "border-b-4 border-orange-400 "
                }`}
              >
                Activity
              </div>
              <div
                onClick={() => setTab("bids")}
                className={`cursor-pointer ${
                  tab === "bids" && "border-b-4 border-orange-400 "
                }`}
              >
                Bid History
              </div>
              <div className="ml-auto hidden md:flex ">
                <Badge>{StatusChecker(status || "")}</Badge>
                <OfferTypeBadge type={listing.type} />
              </div>
            </div>

            {tab === "chat" && (
              <div className="messages pt-6">
                {status === "negotiating" && (
                  <ListingChat
                    listing={listing}
                    user={session?.user}
                    disabled={disabled}
                    session={session}
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
                      <button
                        className="flex text-sm mt-2  text-white bg-orange-400  py-2 px-2 focus:outline-none hover:bg-orange-400 rounded"
                        onClick={() =>
                          handleStatusChange("negotiating", session?.user?.id)
                        }
                      >
                        Lets haggle
                      </button>
                    )}
                  </div>
                )}
                {status === "pending" &&
                  session?.user.id === listing?.userId && (
                    <div
                      className="w-full  p-4 white border-l-4 border-orange-400"
                      onClick={(e) => {
                        e.preventDefault();
                        SearchModal.onOpen(listing.id, setSellerId, setStatus);
                      }}
                    >
                      <div>
                        Your offer has been created. Assign a user to start
                        negotiating{" "}
                        <span className="text-orange-500 underline cursor-pointer">
                          click here
                        </span>
                      </div>
                    </div>
                  )}
              </div>
            )}
            {tab === "details" && (
              <>
                {body}
                {status === "accepted" && (
                  <div className="hidden md:block">
                    {userReview && <ReviewBox review={userReview} />}
                    {participantReview && (
                      <ReviewBox review={participantReview} />
                    )}

                    {!userReview && (
                      <ReviewForm
                        listingId={listing.id}
                        sessionId={session?.user.id}
                        sellerId={listing.sellerId}
                        buyerId={listing.buyerId}
                        disabled={disabled}
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
                  className="flex gap-4 justify-between py-2 mb-2 border-b border-gray-200"
                >
                  <div>{activity.message}</div>
                  <div className="text-gray-500 text-sm italic">
                    {timeSince(activity.createdAt)}
                  </div>
                </div>
              ))}
            {tab === "bids" && <Bids bids={bids} participant={participant} me={me} />}
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
                timeSinceCreated={timeSinceCreated}
                me={me}
                participant={participant}
                socketRef={socketRef}
                setCompletedBy={setCompletedBy}
                completedBy={completedBy}
              />
              <div className="group flex text-gray-300"></div>
            </div>
          }
        </div>
      </Dash>
    )
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const bidId = context.params?.id as string;

  try {
    const listing = await getBidByID({ bidId });
    return {
      props: {
        listing,
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
