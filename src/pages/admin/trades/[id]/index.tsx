import prisma from "@/libs/prismadb";
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
import StatusChecker from "@/utils/status";
import Link from "next/link";
import { Bid, Profile, Review, User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useSocketContext } from "@/context/SocketContext";
import { FaImage } from "react-icons/fa";
import { Session } from "next-auth";
import { tempId } from "@/utils/generate";
import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { Dash } from "@/templates/dash";
import { Meta } from "@/layouts/meta";
import { timeInterval, timeSince } from "@/utils/formatTime";

import {
  ExtendedActivity,
  EventsProps,
  ProfileUser,
} from "@/interfaces/authenticated";
import useOfferEditModal from "@/hooks/useOfferEditModal";
import useDataModal from "@/hooks/useDataModal";
import AddImages from "@/components/forms/AddImages";
import { LineChart } from "@/components/charts/Linechart";
import { set } from "date-fns";
import PerformanceChart from "@/components/charts/BarChart";
import getCurrentUser from "@/actions/getCurrentUser";
import { fi } from "date-fns/locale";
// import OfferDetailsWidgetOld from "@/components/dashboard/offer/OfferDetailsWidgetOld";
interface IUser extends User {
  profile: Profile;
}

interface MessageProps {
  buyerId: string;
  sellerId: string;
  listingId: string;
  text: string;
  id: string;
  read: boolean;
  user?: IUser;
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
  haggling: false,
  user: false,
  status: false,
  loading: false,
};

const CURRENT_BID_STATE = {
  currentPrice: "" || 0,
  byUserId: "",
  byUsername: "",
  me: {} as Bid,
  participant: {} as Bid,
};

interface Listing {
  activity: ExtendedActivity[];
  bids: Bid[];
  buyer: {
    id: string;
    username: string;
    profile?: {
      image?: string;
    };
  };
  buyerId: string;
  category: string;
  completedById: string;
  createdAt: Date;
  description: string;
  expireAt: Date;
  id: string;
  image: string | null;
  events: EventsProps[];
  messages: MessageProps[];
  options: {
    location: {
      city?: string;
      region?: string;
    };
    condition: string;
    pickup: string;
    public: boolean;
  };
  price: string;
  reviews: Review[];
  seller: {
    id: string;
    username: string;
    profile?: {
      image?: string;
    };
  };
  sellerId: string;
  status: string;
  title: string;
  type: string;
  updatedAt: Date;
  user: { id: string; username: string };
  userId: string;
}

interface PageProps {
  listing: Listing;
  session: Session;
  messagesCount: number;
  cd: any;
  role?: string;
  serverBids: {
    sessionOffers: {
      price: number;
      createdAt: string;
    }[];
    participantOffers: {
      price: number;
      createdAt: string;
    }[];
  };
}

const generateStats = (stats: {
  sentCount: number;
  receivedCount: number;
  cancelledSentCount: number;
  cancelledReceivedCount: number;
  completedSentCount: number;
  completedReceivedCount: number;
}) => {
  const totalListings = stats.sentCount + stats.receivedCount;
  const totalCancelledListings =
    stats.cancelledSentCount + stats.cancelledReceivedCount;
  const totalCompletedListings =
    stats.completedSentCount + stats.completedReceivedCount;
  return Math.trunc(
    ((totalCompletedListings - totalCancelledListings) / totalListings) * 100
  );
};

const Index = ({
  listing,
  session,
  messagesCount,
  cd,
  serverBids,
  role
}: PageProps) => {
  const [disabled, setDisabled] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("additional");
  const [activities, setActivities] = useState<ExtendedActivity[]>([]);
  const [loadingState, setLoadingState] = useState(LOADING_STATE);
  const [bids, setBids] = useState<Bid[]>([]);
  const [events, setEvents] = useState<EventsProps[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [currentBid, setCurrentBid] = useState<{
    currentPrice: string | number;
    byUserId: string;
    byUsername: string;
    me: Bid;
    participant: Bid;
  }>(CURRENT_BID_STATE);
  const [status, setStatus] = useState<string>("");
  const [tab, setTab] = useState("details");
  const [timeSinceCreated, setTimeSinceCreated] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [me, setMe] = useState<ProfileUser>();
  const [participant, setParticipant] = useState<ProfileUser>();
  const { user: sessionUser } = session;
  const router = useRouter();
  const [currentListing, setCurrentListing] = useState<any>({});
  const [size, setSize] = useState(0);
  const [mobileView, setMobileView] = useState(false);
  const now = Date.now();
  const socket = useSocketContext();
  const [participantOffers, setParticipantOffers] = useState<
    {
      price: number;
      createdAt: string;
    }[]
  >([]);

  const [chartData, setChartData] = useState<{
    sessionOffers: {
      price: number;
      createdAt: string;
    }[];
    participantOffers: {
      price: number;
      createdAt: string;
    }[];
  }>();

  const [sessionOffers, setSessionOffers] = useState<
    {
      price: number;
      createdAt: string;
    }[]
  >([]);

  const modal = useDataModal();

  const [reviews, setReviews] = useState<{
    userReview: IReview;
    participantReview: IReview;
  }>({
    userReview: {} as IReview,
    participantReview: {} as IReview,
  });

  if (!sessionUser || !listing) return <Loading />;

  const mainTabs = [
    { id: "details", label: "Details", primary: true },
    /*  { id: "chat", label: "Chat", primary: true, notificationsCount: messages.filter(message => !message.read).length || 0 }, */
    { id: "chat", label: "Chat", primary: true },
  ];

  const secondaryTabs = [
    { id: "additional", label: "Additional Information", primary: true },
    { id: "bids", label: "Offer History" },
    { id: "activity", label: "Activity" },

    {
      id: "user",
      label: `${
        sessionUser?.id === currentListing.sellerId ? "Buyer" : "Seller"
      } Details`,
      primary: true,
    },
  ];

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setUnreadMessages(messagesCount);
  }, [messagesCount]);

  useEffect(() => {
    if (isMounted) {
      setCurrentListing(listing);
    }
  }, [isMounted]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280 && window.innerWidth !== size) {
        if (tab !== "details") setTab("details");
        setSize(window.innerWidth);
        setMobileView(true);
      } else if (
        window.innerWidth < 1280 &&
        window.innerWidth !== size &&
        tab !== "trade"
      ) {
        setTab("trade");
        setSize(window.innerWidth);
        setMobileView(false);
      }
    };
    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [size, mobileView]);

  const addImages = async (images: string) => {
    const res = await axios.put(`/api/listings`, {
      image: images,
      id: currentListing.id,
      userId: sessionUser?.id,
    });

    if (res.status !== 200) {
      return console.log("Error updating images");
    }

    setCurrentListing((prev: any) => {
      return { ...prev, image: res.data.listing?.image || "" };
    });

    return res;
  };

  const handleAddImages = () => {
    modal.onOpen(
      "Add Images",
      <AddImages
        images={currentListing?.image || ""}
        saveImages={addImages}
        close={() => modal.onClose()}
      />
    );
  };

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
          const trustScore = generateStats(stats);
          setParticipant((prev) => ({ ...prev, ...stats, trustScore }));
          setLoadingState((prev) => ({ ...prev, user: false }));
        } catch (error) {
          console.error(error);
        }
      };
      getUserStats();
    }
  }, [activeSubTab]);

  useEffect(() => {
    if (!session || !sessionUser.id) return;

    if (currentListing?.sellerId === sessionUser?.id) {
      setMe(currentListing?.seller);
      setParticipant((prev) => {
        return { ...currentListing?.buyer };
      });
    } else {
      setMe(currentListing.buyer);
      setParticipant((prev) => {
        return { ...currentListing?.seller };
      });
    }
    setMessages([...listing.messages].reverse());
    setEvents([...listing?.events].reverse());
  }, [currentListing.id, sessionUser?.id]);

  useEffect(() => {
    setLoadingState((prev) => ({ ...prev, loading: true }));
    if (!session || !sessionUser?.id || !currentListing.bids) {
      return;
    }
    const reversedBids = [...currentListing.bids].reverse();

    setBids(currentListing.bids);
    setChartData(
      serverBids || {
        sessionOffers: [],
        participantOffers: [],
      }
    );

    const lastTwoSessionOffers = serverBids.sessionOffers.slice(-2) as {
      price: number;
      createdAt: string;
    }[];

    const lastTwoParticipantOffers = serverBids.participantOffers.slice(-2) as {
      price: number;
      createdAt: string;
    }[];

    setSessionOffers(serverBids.sessionOffers || []);
    setParticipantOffers(serverBids.participantOffers || []);

    setCurrentBid({
      currentPrice:
        currentListing.bids && currentListing.bids.length > 0
          ? currentListing.bids[currentListing.bids.length - 1].price
          : 0,
      byUserId:
        (currentListing.bids &&
          currentListing.bids[currentListing.bids.length - 1]?.userId) ||
        "",
      byUsername:
        (currentListing.bids &&
          currentListing.bids[currentListing.bids.length - 1]?.user
            ?.username) ||
        "",
      me: reversedBids.filter(
        (bid: Bid) => bid.userId === session?.user?.id
      )[0],
      participant: reversedBids.filter(
        (bid: Bid) => bid.userId !== session?.user?.id
      )[0],
    });

    setLoadingState((prev) => ({ ...prev, loading: false }));
  }, [currentListing.bids, currentListing.price]);

  useEffect(() => {
    if (!session || !sessionUser?.id || !currentListing.status) return;
    if (!session) setLoadingState((prev) => ({ ...prev, loading: true }));
    if (status === "pending" || status === "accepted") setDisabled(true);

    setStatus(currentListing.status);
    setActivities((prev) => {
      if (Array.isArray(currentListing.activity)) {
        const arr = [...currentListing.activity].reverse();
        return arr;
      }
      return prev;
    });
    const created = new Date(currentListing.createdAt);
    timeInterval(created, setTimeSinceCreated);

    setReviews({
      userReview: currentListing.reviews.find(
        (item: IReview) => item.userId === sessionUser?.id
      ),
      participantReview: currentListing.reviews.find(
        (item: IReview) => item.userId !== sessionUser?.id
      ),
    });

    setLoadingState((prev) => ({ ...prev, loading: false }));
    setDisabled(false);
  }, [
    currentListing.status,
    currentListing.createdAt,
    sessionUser?.id,
    currentListing.reviews,
    currentListing.activities,
  ]);

  useEffect(() => {
    if (tab === "chat" && messages.length > 0) {
      const markAsRead = async () => {
        const url =
          "/api/dashboard/markAllAsRead?listingId=" +
          currentListing.id +
          "&userId=" +
          session?.user.id;
        const ids = messages.map((message) => message.id);
        try {
          await axios.put(url);
        } catch (error) {
          console.log(error);
        }
      };
      markAsRead();
    }
  }, [tab]);

  useEffect(() => {
    socket.emit("join_listing", currentListing.id);
    return () => {
      socket.emit("leave_listing", currentListing.id);
    };
  }, [currentListing.id]);

  useEffect(() => {
    console.log("Running socket effect");
    if (!session?.user.id) return;
    const handleNewListingMessage = (data: any) => {
      console.log("Received new message: ", data);
      setMessages((prevMessages) => [...prevMessages, data]);
      if (data.userId !== session?.user.id && tab !== "chat")
        setUnreadMessages((prev) => prev + 1);
    };

    const handleUpdatedBid = (data: any) => {
      const { price, userId, username, listingId, previous, final } = data;
      console.log(
        `Received offer price update for listing ${listingId}: ${price}`
      );
      setBids((prevBids) => {
        let temporaryId = tempId();
        const newBid = {
          id: temporaryId,
          price: price,
          userId: userId,
          listingId: listingId,
          previous: previous,
          createdAt: new Date(now),
          updatedAt: new Date(now),
          final: final,
        };
        console.log("New bid: ", newBid);
        const updatedBids = [...prevBids, newBid];
        return updatedBids;
      });

      setChartData((prev) => {
        let currentDate = new Date(now).toLocaleDateString("en-GB");

        if (userId === session?.user.id && prev) {
          if (
            prev.sessionOffers.find((offer) => offer.createdAt === currentDate)
          ) {
            return {
              ...prev,
              sessionOffers: prev.sessionOffers.map((offer) => {
                if (offer.createdAt === currentDate) {
                  return {
                    ...offer,
                    price: offer.price + price,
                  };
                }
                return offer;
              }),
            };
          }
          return {
            ...prev,
            sessionOffers: [
              ...prev.sessionOffers,
              {
                price: price,
                createdAt: new Date(now).toLocaleDateString("en-GB"),
              },
            ],
          };
        }
        if (userId !== session?.user.id && prev) {
          if (
            prev.participantOffers.find(
              (offer) => offer.createdAt === currentDate
            )
          ) {
            return {
              ...prev,
              participantOffers: prev.participantOffers.map((offer) => {
                if (offer.createdAt === currentDate) {
                  return {
                    ...offer,
                    price: offer.price + price,
                  };
                }
                return offer;
              }),
            };
          }
          return {
            ...prev,
            participantOffers: [
              ...prev.participantOffers,
              {
                price: price,
                createdAt: new Date(now).toLocaleDateString("en-GB"),
              },
            ],
          };
        }
        return prev;
      });

      setCurrentBid((prev) => {
        let obj = {
          ...prev,
          currentPrice: price,
          byUserId: userId,
          byUsername: username,
        };
        if (userId === session?.user.id) {
          obj.me = {
            id: tempId(),
            updatedAt: new Date(now),
            price: price,
            userId: userId,
            listingId: listingId,
            previous: previous,
            createdAt: new Date(now),
            final: final,
          };
        }

        if (userId !== session?.user.id) {
          obj.participant = {
            id: tempId(),
            updatedAt: new Date(now),
            price: price,
            userId: userId,
            listingId: listingId,
            previous: previous,
            createdAt: new Date(now),
            final: final,
          };
        }
        return obj;
      });

      if (userId === session?.user.id) {
        setSessionOffers((prev) => {
          return [
            ...prev,
            {
              price: price,
              createdAt: new Date(now).toISOString(),
            },
          ];
        });
      } else {
        setParticipantOffers((prev) => {
          return [
            ...prev,
            {
              price: price,
              createdAt: new Date(now).toISOString(),
            },
          ];
        });
      }

      setStatus("haggling");
      return console.log("New bid: ", data);
    };

    const handleUpdateStatus = (data: {
      listingId: string;
      newStatus: string;
      userId: string;
    }) => {
      const { listingId, newStatus, userId } = data;
      if (listingId === currentListing.id)
        console.log(
          `Received status update for listing ${listingId}: ${newStatus}`
        );
      setStatus(newStatus);
      setEvents((prev) => {
        const newEvent = {
          id: tempId(),
          event: newStatus,
          price: currentBid.currentPrice,
          date: new Date(now).toISOString(),
          userId: userId,
        };
        return [newEvent, ...prev];
      });
      return console.log("New status: ", data);
    };

    const handleUpdatedListing = (data: any) => {
      const { listing } = data;

      setCurrentListing((prev: any) => {
        return {
          ...prev,
          ...listing,
        };
      });

      return console.log("Updated listing: ", data);
    };

    socket.on("new_listing_message", handleNewListingMessage);
    socket.on("updated_bid", handleUpdatedBid);
    socket.on("update_status", handleUpdateStatus);
    socket.on("updated_listing", handleUpdatedListing);

    return () => {
      socket.off("new_listing_message");
      socket.off("updated_bid");
      socket.off("update_status");
      socket.emit("leave_listing", currentListing.id);
    };
  }, [session?.user.id]);

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
        : currentListing.price)
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
        "reject the current offer for £"
      ),
      haggling: "start haggling",
      completed: "mark this offer as completed",
      cancelled: "terminate this offer",
    };
    return messages[status] || null;
  };

  const handleFinalise = async (userId: any, participantId: any) => {
    setLoadingState((prev) => ({ ...prev, contact: true }));

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
          setLoadingState((prev) => ({ ...prev, contact: false }));
        })
        .finally(() => {});
    } catch (error) {
      console.log(error);
    }
  };

  const handleStatusChange = async (status: string, userId: string) => {
    const statusMessage = createStatusAlert(status, bids, currentBid, listing);
    if (status === "completed") {
      setLoadingState((prev) => {
        return { ...prev, completed: true };
      });
      confirmationModal.onOpen(
        "Are you sure you want to " + statusMessage + "?",
        async () => {
          await axios
            .put(`/api/updateListing/status`, {
              status: status,
              listingId: currentListing.id,
              userId: session?.user?.id,
              completedById: userId,
              completedAt: new Date().toISOString(),
            })
            .then((response) => {
              socket.emit("update_status", {
                newStatus: status,
                listingId: currentListing.id,
                userId: userId,
              });

             /*  const sellerEmail = axios.post("/api/email/emailNotification", {
                listing: {
                  ...response.data.listing,
                  price:
                    (response.data.listing.events &&
                      response.data.listing.events[
                        response.data.listing.events.length - 1
                      ].price) ||
                    response.data.listing.price,
                },
                name: response.data.listing.seller.name,
                email: response.data.listing.seller.email,
                title:
                  response.data.listing.buyer?.username +
                  " has paid you " +
                  response.data.listing.events[
                    response.data.listing.events.length - 1
                  ].price,
                body: `Your offer has been paid by ${response.data.listing.buyer.username}. Log in and arrange the transfer of the item(s).`,
                linkText: "Make Payment",
                url: `/dashboard/trades/${response.data.listing.id}`,
              });

              const buyerEmail = axios.post("/api/email/emailNotification", {
                listing: {
                  ...response.data.listing,
                  price:
                    (response.data.listing.events &&
                      response.data.listing.events[
                        response.data.listing.events.length - 1
                      ].price) ||
                    response.data.listing.price,
                },
                name: response.data.listing.buyer.name,
                email: response.data.listing.buyer.email,
                title: "Your payment was successful",
                body: `Your payment of ${
                  response.data.listing.events[response.data.listing.events - 1]
                    .price
                } was successful. Log in and arrange the transfer of the item(s).`,
                linkText: "Log in",
                url: `/dashboard/trades/${response.data.listing.id}`,
              }); */

              const { sellerId, buyerId, transactionResult } = response.data;

              socket.emit(
                "update_activities",
                transactionResult,
                sellerId,
                buyerId
              );
            })

            .catch((err) => {
              console.log("Something went wrong!");
            })
            .finally(() => {
              setLoadingState((prev) => ({ ...prev, status: false }));
              setLoadingState(LOADING_STATE);
            });
          return;
        }
      );
    }
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
        if (status === "haggling")
          setLoadingState((prev) => {
            return { ...prev, haggling: true };
          });

        await axios
          .put(`/api/updateListing/status`, {
            status: status,
            listingId: currentListing.id,
            userId: userId,
            completedById: userId,
          })
          .then((response) => {
            setStatus(status);

            socket.emit("update_status", {
              newStatus: status,
              listingId: currentListing.id,
              userId: userId,
            });

            if (response.data.listing.status === "accepted") {
              const email = axios.post("/api/email/emailNotification", {
                listing: {
                  ...response.data.listing,
                  price:
                    (response.data.listing.events &&
                      response.data.listing.events[
                        response.data.listing.events.length - 1
                      ].price) ||
                    response.data.listing.price,
                },
                name: listing.buyer.username,
                email: response.data.listing?.buyer.email,
                title: "Offer Accepted",
                body:
                  listing.buyerId === sessionUser?.id
                    ? `You have accepted the offer. Please make the payment.`
                    : `The offer has been accepted. Please make the payment.`,
                description: "",
                linkText: "Make Payment",
                url: `/dashboard/trades/${response.data.listing.id}`,
              });
            } else {
              const receiver =
                response.data.listing?.events[0].userId ===
                response.data.listing.sellerId
                  ? response.data.listing.buyer
                  : response.data.listing.seller;
              const sender =
                response.data.listing?.events[0].userId ===
                response.data.listing.sellerId
                  ? response.data.listing.seller
                  : response.data.listing.buyer;
              const email = axios.post("/api/email/emailNotification", {
                listing: {
                  ...response.data.listing,
                  price:
                    (response.data.listing.events &&
                      response.data.listing.events[
                        response.data.listing.events.length - 1
                      ].price) ||
                    response.data.listing.price,
                },
                name: receiver.username,
                email: receiver.email,
                title: "Offer " + status,
                body: `${sender.username} has ${status} the offer`,
                linkText: "View Trade",
                url: `/dashboard/trades/${response.data.listing.id}`,
              });
            }

            const { sellerId, buyerId, transactionResult } = response.data;

            socket.emit(
              "update_activities",
              transactionResult,
              sellerId,
              buyerId
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

  const updateListing = async (listing: any) => {
    const { id, userId, ...rest } = listing;

    if (!listing) return;

    const res = await axios.put(`/api/listings`, {
      ...rest,
      id: currentListing.id,
      userId: sessionUser?.id,
    });
    if (res.status !== 200) {
      return console.log("Error updating listing");
    }
    setCurrentListing((prev: any) => {
      return { ...prev, ...rest };
    });
    socket.emit("updated_listing", { listing: res.data.listing });
    return res;
  };

  const MainBody = (
    <>
      <div className="h-full flex flex-col ">
        <Header
          status={status}
          currentBid={currentBid}
          listing={currentListing}
          session={session}
          handleAddImages={handleAddImages}
          bids={bids}
          setBids={setBids}
          setCurrentBid={setCurrentBid}
          setStatus={setStatus}
          sessionUser={sessionUser}
          events={events}
          handleStatusChange={handleStatusChange}
          handleUpdateDetails={updateListing}
        />

        <Tabs
          status={status}
          tabs={secondaryTabs}
          setTab={setActiveSubTab}
          tab={activeSubTab}
          className="border-t bg-white rounded-t border-x"
        />

        {activeSubTab === "additional" && (
          <div className="flex-grow flex flex-col bg-white p-4 pt-0 border rounded-b  border-gray-200 border-t-0 transition-all ease-in-out duration-200 h-full">
            <div className="mb-auto mt-4 md:mx-1 flex-grow leading-relaxed first-letter:uppercase pb-6 relative">
              {/*  {status !== "cancelled" &&
                status !== "accepted" &&
                status !== "completed" &&
                currentListing.userId === session?.user.id && (
                  <FaPencilAlt
                    className="absolute top-1 right-1 text-gray-600 -mt-2 border p-1 rounded-full bg-white border-gray-200 text-2xl"
                    onClick={() =>
                      edit.onOpen(session?.user, listing, "additinalInformation", {
                        title: currentListing.title,
                        description: currentListing.additionalInformation,
                      })
                    }
                  />
                )} */}
              {currentListing?.options?.additionalInformation ||
                "No additional information"}
            </div>
            {typeof currentBid.currentPrice === "number"
              ? currentBid.currentPrice !== 0
              : typeof currentBid.currentPrice === "string" &&
                currentBid.currentPrice !== "0" &&
                currentBid.currentPrice !== "" && (
                  <div
                    className={`flex gap-2 justify-between bg-gray-default border border-gray-200 rounded-xl mt-4 p-4 `}
                  >
                    <div className="block">
                      {currentBid.currentPrice && (
                        <div className="text-xs font-bold">
                          Start price by{" "}
                          <Link
                            href={`/dashboard/profile/${currentBid.byUserId}`}
                            className="underline"
                          >
                            {listing.user.id === sessionUser?.id
                              ? "You"
                              : listing.user.username || ""}
                          </Link>
                        </div>
                      )}
                      <div className="font-extrabold ">
                        {listing.price &&
                        listing.price !== "" &&
                        listing.price !== "0"
                          ? `£${Number(
                              listing.price === "0" ? "0.00" : listing.price
                            ).toLocaleString()}`
                          : "none"}
                      </div>
                    </div>

                    <div className={`block`}>
                      {currentBid.currentPrice && (
                        <div className="text-right text-xs font-bold">
                          {status === "accepted" ? (
                            <div className="mb-0.5">Agreed price</div>
                          ) : (
                            <div className="text-right mb-0.5">
                              Last offer by
                              <Link
                                href={`/dashboard/profile/${currentBid.byUserId}`}
                                className="underline ml-[2px]"
                              >
                                {currentBid.byUsername === sessionUser?.username
                                  ? "You"
                                  : currentBid.byUsername || ""}
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="font-extrabold text-right">
                        {currentBid.currentPrice &&
                        currentBid.currentPrice !== "0" &&
                        currentBid.currentPrice !== ""
                          ? `£${Number(
                              currentBid.currentPrice === "0" ||
                                currentBid.currentPrice === ""
                                ? "0.00"
                                : currentBid.currentPrice
                            ).toLocaleString()}`
                          : (listing.price !== "" && listing.price !== "0") ||
                            status === "cancelled" ||
                            status === "rejected"
                          ? `£${Number(
                              listing.price === "0" || listing.price === ""
                                ? "0.00"
                                : listing.price
                            ).toLocaleString()}`
                          : "No bids yet"}
                      </div>
                    </div>
                  </div>
                )}
          </div>
        )}

        {activeSubTab === "activity" && (
          <div className=" bg-white border-x border-b rounded-b h-full p">
            {activities?.map((activity: any, i: number) => (
              <div
                key={i}
                className="flex gap-4 justify-between py-2 border-b border-gray-200 px-4 last:border-0"
              >
                <div>{activity.message}</div>
                <div className="text-gray-500 text-sm italic">
                  {timeSince(activity.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSubTab === "bids" && (
          <div className=" bg-white border-x border-b rounded  h-full">
            <Bids bids={bids} participant={participant} me={me} />
          </div>
        )}

        {activeSubTab === "photos" && (
          <>
            {currentListing.image ? (
              <div className=" justify-center z-10 mb-6">
                <ImageSlider
                  images={currentListing.image}
                  handleAddImages={handleAddImages}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center my-12">
                <p className="font-bold my-6 ">No photos available</p>
                <Button onClick={handleAddImages}>
                  <FaImage className="text-xl text-gray-400 mr-1" />
                  <p className="font-bold text-gray-500">Add photos</p>
                </Button>
              </div>
            )}
          </>
        )}
        {activeSubTab === "user" && (
          <div className=" justify-center z-10 mb-6">
            {sessionUser?.id && (
              <div>
                <UserStats
                  id={listing.id}
                  startPrice={Number(listing.price || 0)}
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
      <Dash
        pageTitle={listing.title}
        meta={<Meta title={listing.title} description={listing.description} />}
        admin={ role === "admin"}
      >
        <OfferAlerts
          handleStatusChange={handleStatusChange}
          session={session}
          participant={participant}
          status={status}
          completedBy={events[0]?.userId || null}
          listing={listing}
          handleFinalise={handleFinalise}
        />

        <div className="flex flex-col px-4 md:mt-0 md:p-6 lg:pt-4  lg:px-8 lg:pb-8 md:pt-4 mx-auto xl:grid xl:grid-cols-12 gap-6 ">
          <div className="w-full col-span-6 xl:col-span-8  flex flex-col md:mt-4 lg:mt-0 mt-2 h-full">
            <Tabs
              status={status}
              tabs={mainTabs}
              setTab={setTab}
              tab={tab}
              isListing
              className="border-t border-x rounded-t bg-white"
              model={{
                id: currentListing.id,
                title: "listing",
              }}
              main
              additionalData={
                <span className="hidden md:block">{StatusChecker(status)}</span>
              }
              setCount={setUnreadMessages}
              count={{
                messages: {
                  total: 0,
                  unread: unreadMessages || 0,
                },
              }}
            />
            {tab === "chat" && (
              <div className="messages pt-6 mb-6 bg-white">
                {status !== "awaiting approval" && (
                  <ListingChat
                    id={listing.id}
                    sellerId={listing.sellerId}
                    buyerId={listing.buyerId}
                    user={sessionUser}
                    disabled={disabled}
                    session={session}
                    messages={messages}
                    setMessages={setMessages}
                  />
                )}
                {status === "accepted" && (
                  <div className="bg-white w-full  p-4  rounded-lg border-l-4 border-orange-default">
                    {currentListing.user === sessionUser
                      ? "Your offer was acceped! "
                      : "You accepted the offer! "}{" "}
                    If you need to contact the
                    {currentListing.buyer?.id === sessionUser?.id
                      ? "seller"
                      : "buyer"}{" "}
                    <span className="text-orange-500 underline cursor-pointer">
                      click here
                    </span>
                  </div>
                )}
                {status === "awaiting approval" && (
                  <div className="bg-white w-full  p-4  rounded-lg border-l-4 border-orange-default flex gap-2 justify-between items-center">
                    {currentListing.userId === sessionUser?.id ? (
                      <div>
                        Your offer has been created. A request has been sent to{" "}
                        {participant?.username}.
                      </div>
                    ) : (
                      <div>
                        You have received a offer from {participant?.username}
                      </div>
                    )}
                    {currentListing.userId !== sessionUser?.id && (
                      <Button
                        primary
                        label={`Let's haggle`}
                        onClick={() =>
                          handleStatusChange("haggling", sessionUser?.id)
                        }
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {tab === "details" && (
              <div className="h-full">
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
                        listingId={currentListing.id}
                        sessionId={sessionUser.id}
                        sellerId={currentListing.sellerId}
                        buyerId={currentListing.buyer.id}
                        disabled={disabled}
                        setReviews={setReviews}
                        ownerId={currentListing.userId}
                        username={me?.username || ""}
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div
            className={`w-full xl:col-span-4 col-span-4 ${
              tab === "trade" ? "block" : "hidden xl:block"
            }`}
          >
            <OfferDetailsWidget
              listing={currentListing}
              status={status || "pending"}
              session={session}
              events={events}
              currentBid={currentBid}
              setCurrentBid={setCurrentBid}
              bids={bids}
              handleStatusChange={handleStatusChange}
              isLoading={loadingState.status}
              loadingState={loadingState}
              setLoadingState={setLoadingState}
              timeSinceCreated={timeSinceCreated}
              participant={participant}
              setStatus={setStatus}
              handleFinalise={handleFinalise}
              me={me}
              setBids={setBids}
              updateListing={updateListing}
              setCurrentListing={setCurrentListing}
              setEvents={setEvents}
            />

            

            {/* <div className="border rounded-lg bg-white  pb-0 mt-6 pt-4">
              <h4 className="-mb-1 pb-0 px-5">Trade Tracker</h4>

              <LineChart
                participant={{
                  name: currentListing
                    ? currentListing?.sellerId === sessionUser?.id
                      ? currentListing?.buyer?.username
                      : currentListing?.seller?.username
                    : "",
                }}
                data={{
                  sessionOffers: chartData?.sessionOffers || [],
                  participantOffers: chartData?.participantOffers || [],
                }}
              />
            </div> */}
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

  const currentUser = await getCurrentUser(session)

  const id = context.params?.id as string;

  try {
    const listing = await getListingById({
      offerId: id,
      userId: session.user.id,
    });

    const countUnreadMessages = await prisma.message.count({
      where: {
        listingId: id,
        read: false,
        userId: {
          not: session.user.id,
        },
      },
    });

    const sessionOffers = await prisma.bid
      .findMany({
        select: {
          price: true,
          createdAt: true,
        },

        where: {
          listingId: id,
          userId: session.user.id,
        },
      })
      .then((bids) => {
        let startOffer = {
          price: 0,
          createdAt: new Date(listing.createdAt),
        };

        let offers = bids.map((bid) => {
          return {
            price: bid.price,
            createdAt: bid.createdAt,
          };
        });

        return [startOffer, ...offers];
      });

    const participantOffers = await prisma.bid
      .findMany({
        select: {
          price: true,
          createdAt: true,
        },

        where: {
          listingId: id,
          userId: {
            not: session.user.id,
          },
        },
      })
      .then((bids) => {
        let startOffer = {
          price: 0,
          createdAt: new Date(listing.createdAt),
        };

        let offers = bids.map((bid) => {
          return {
            price: bid.price,
            createdAt: bid.createdAt,
          };
        });

        return [startOffer, ...offers];
      });

    const aggregateDataByInterval = (
      data: { price: number; createdAt: Date }[]
    ) => {
      // Helper to add intervals to a date
      const addIntervals = (date: Date, hours: number) =>
        date.getTime() + hours * 60 * 60 * 1000;

      // Find min and max dates
      const dateTimes = data.map((offer) =>
        new Date(offer.createdAt).getTime()
      );
      const minDate = new Date(Math.min(...dateTimes));
      const maxDate = new Date(Math.max(...dateTimes));
      const diffTime = Number(maxDate) - Number(minDate);
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      // Determine interval
      let intervalHours: number;
      if (diffDays <= 5 / 24) intervalHours = 1; // less than 5 hours
      else if (diffDays <= 0.5) intervalHours = 2; // less than 12 hours
      else if (diffDays <= 1) intervalHours = 4; // less than 1 day
      else if (diffDays <= 3) intervalHours = 12; // less than 3 days
      else if (diffDays <= 5) intervalHours = 24; // less than 5 days
      else if (diffDays <= 14) intervalHours = 48; // less than 14 days
      else if (diffDays <= 30) intervalHours = 24 * 7; // less than 1 month
      else intervalHours = Number.MAX_SAFE_INTEGER; // beyond 1 month or any other condition

      // Aggregate data
      let aggregatedData = [];
      let currentInterval = minDate;
      while (currentInterval <= maxDate) {
        const offersInInterval = data.filter((offer) => {
          const offerDate = new Date(offer.createdAt).getTime();
          return (
            offerDate >= Number(currentInterval) &&
            offerDate < addIntervals(currentInterval, intervalHours)
          );
        });
        const total = offersInInterval.reduce(
          (acc, offer) => acc + offer.price,
          0
        );
        aggregatedData.push({
          price: total,
          createdAt: currentInterval.toLocaleDateString("en-GB"),
        });
        currentInterval = new Date(
          addIntervals(currentInterval, intervalHours)
        );
      }
      return aggregatedData;
    };

    const sOffersDates = sessionOffers.map((offer) => offer.createdAt);
    const pOffersDates = participantOffers.map((offer) => offer.createdAt);

    const dates = Array.from(new Set([...sOffersDates, ...pOffersDates]));

    let newSessionOffers = dates.map((date) => {
      return {
        price:
          sessionOffers.find((offer) => offer.createdAt === date)?.price || 0,
        createdAt: date,
      };
    });

    let newParticipantOffers = dates.map((date) => {
      return {
        price:
          participantOffers.find((offer) => offer.createdAt === date)?.price ||
          0,
        createdAt: date,
      };
    });

    newSessionOffers.unshift({
      price: listing.price || 0,
      createdAt: new Date(listing.createdAt),
    });

    newParticipantOffers.unshift({
      price: listing.price || 0,
      createdAt: new Date(listing.createdAt),
    });

    const aggSOffers = aggregateDataByInterval(newSessionOffers);
    const aggPOffers = aggregateDataByInterval(newParticipantOffers);

    const checkIfBothOfferMoreThan0 = (
      sessionOffers: { price: number; createdAt: string }[],
      participantOffers: { price: number; createdAt: string }[]
    ) => {
      // Assuming createdAt is a string in a consistent, comparable format.
      // If the format is not directly comparable, convert it to a Date object or a comparable string format first.

      // Create maps for easy lookup by date string
      const sessionMap = new Map(
        sessionOffers.map((offer) => [
          offer.createdAt.split("T")[0],
          offer.price,
        ])
      );
      const participantMap = new Map(
        participantOffers.map((offer) => [
          offer.createdAt.split("T")[0],
          offer.price,
        ])
      );

      // Filter sessionOffers where both current offer and corresponding participant offer are not 0
      const filteredSessionOffers = sessionOffers.filter((offer) => {
        const dateKey = offer.createdAt.split("T")[0]; // Adjust if your date format is different
        const participantPrice = participantMap.get(dateKey) || 0;
        return !(offer.price === 0 && participantPrice === 0);
      });

      // Similarly, filter participantOffers
      const filteredParticipantOffers = participantOffers.filter((offer) => {
        const dateKey = offer.createdAt.split("T")[0]; // Adjust if your date format is different
        const sessionPrice = sessionMap.get(dateKey) || 0;
        return !(offer.price === 0 && sessionPrice === 0);
      });

      return { filteredSessionOffers, filteredParticipantOffers };
    };

    const cd = checkIfBothOfferMoreThan0(aggSOffers, aggPOffers);

    if (!listing) {
      return {
        notFound: true,
      };
    }

   
    return {
      props: {
        listing,
        session,
        messagesCount: countUnreadMessages,
        role: currentUser?.role,
        serverBids: {
          sessionOffers: cd.filteredSessionOffers || [],
          participantOffers: cd.filteredParticipantOffers || [],
        },
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
