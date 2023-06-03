import React, { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import getCurrentUser from "@/actions/getCurrentUser";
import { Listing, User } from "@prisma/client";
import { Meta } from "@/layouts/meta";
import { Dash } from "@/templates/dash";
import getListingsByUserId from "@/actions/getListingsByUserId";
import EmptyState from "@/components/EmptyState";
import Offer from "@/components/offers/Offer";
import UserCard from "@/components/widgets/UserCard";
import useOfferModal from "@/hooks/useOfferModal";
import { BiAlarm } from "react-icons/bi";
import getRequestsByUserId from "@/actions/getRequestsByUserId";

interface dashboardProps {
  listings: Listing[];
  user: User;
  requests: Listing[];
}

const Index = ({ listings, user, requests }: dashboardProps) => {
  const [session, setSession] = useState<any>(null);
  const offerModal = useOfferModal();

  useEffect(() => {
    const fetchSession = async () => {
      const session = await getSession();
      setSession(session);
    };

    fetchSession();
  }, []);

  return (
    <Dash
      meta={
        <Meta
          title="Make You An Offer You Can't Refuse"
          description="This is the Make You An Offer Web App"
        />
      }
    >
      <div className="grid grid-cols-12 mt-10">
        <div className="w-full mx-auto px-4 sm:px-8 lg:col-span-9 col-span-12">
          <div className="rounded-lg bg-orange-200 border border-gray-200 p-4">
            <div className="flex  items-center justify-between gap-2">
              <div className="md:text-xl font-semibold leading-tight">
                Hello <span className="capitalize">{session?.user?.name}</span>,
                welcome back!
              </div>
              <div className="flex gap-2">
                <button
                  onClick={offerModal.onOpen}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-2 py-1 md:py-2 md:px-4 rounded"
                >
                  Create Offer
                </button>
              </div>
            </div>
          </div>
          {listings.length === 0 && requests.length === 0 ? (
            <EmptyState showReset />
          ) : (
            <div>
              { listings.length > 0 && (
                <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                  <div className="border border-gray-200 bg-white p-4">
                    <div className="font-extrabold">Your Offer Listings</div>
                  </div>

                  <div className="inline-block min-w-full border-l border-r border-b border-gray-200">
                    {listings.map((item: Listing) => {
                      if (item.senderId === session?.user?.id)
                        return <Offer key={item.id} {...item} />;
                    })}
                  </div>
                </div>
          )}
              {requests.length > 0 && (
                <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                  <div className="border border-gray-200 bg-white p-4">
                    <div className="font-extrabold">Offer Requests</div>
                  </div>

                  <div className="inline-block min-w-full border-l border-r border-b border-gray-200">
                    {requests.map((item: Listing) => {
                      if (item.recipientId === session?.user?.id)
                      if (item.status === "pending")
                        return <Offer key={item.id} {...item} />;
                    })}
                  </div>
                </div>
              )}
              {requests.length > 0 && (
                <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                  <div className="border border-gray-200 bg-white p-4">
                    <div className="font-extrabold">Under Negotiation</div>
                  </div>

                  <div className="inline-block min-w-full border-l border-r border-b border-gray-200">
                    {requests.map((item: Listing) => {
                      if (item.recipientId === session?.user?.id)
                      if (item.status !== 'pending')
                        return <Offer key={item.id} {...item} />;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="col-span-12 lg:col-span-3 px-4  lg:px-0">
          <UserCard
            currentUser={user}
            sales={requests.length}
            offers={listings.length}
            messages={0}
            dashboard
          />
        </div>
      </div>
    </Dash>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const session = await getSession(context);

    if (!session) {
      return {
        redirect: {
          destination: "/login", // redirect to login if no session found
          permanent: false,
        },
      };
    }

    const user = await getCurrentUser(session);
    const listings = await getListingsByUserId(session.user.id);
    const requests = await getRequestsByUserId(session.user.id);

    return {
      props: {
        listings,
        user,
        requests,
      },
    };
  } catch (error) {
    console.error("Error fetching listings:", error);
    return {
      props: {
        listings: [],
        requests: [],
      },
    };
  }
};

export default Index;
