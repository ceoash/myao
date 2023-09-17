import { Meta } from "@/layouts/meta";
import { Dash } from "@/templates/dash";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { DashListing } from "@/interfaces/authenticated";
import Offers from "@/components/offers/Offers";
import getAllOffersByUserId from "@/actions/dashboard/getAllOffersByUserId";

interface IndexProps {
  session: any;
  listings: DashListing[];
  countSent: number;
  countReceived: number;
  countPendingSent: number;
  countPendingReceived: number;
  defaultTab?: string;
}

const Index = ({
  listings,
  session,
  countSent,
  countReceived,
  countPendingSent,
  countPendingReceived,
  defaultTab
}: IndexProps) => {

  return (
    <Dash
      meta={
        <Meta
          title="Offers"
          description="View your offers and manage them"
        />
      }
    >
      <div>
        <div className="w-full mx-auto px-4 sm:px-8">
          <div className="pt-6">
            <div className="flex justify-between items-center mb-8">
              <h3>
                Your Offers {}
              </h3>
            </div>
            <Offers
              offers={listings}
              session={session}
              countSent={countSent}
              countReceived={countReceived}
              countPendingSent={countPendingSent}
              countPendingReceived={countPendingReceived}
              multipage
              defaultTab={defaultTab}
            />
          </div>
          <div className="flex justify-center h-full gap-2"></div>
        </div>
      </div>
    </Dash>
  );
};

export const getServerSideProps: GetServerSideProps<any> = async (context) => {
  try {
    const session = await getSession(context);
    const id = context.query?.id ?? null;

    if (!session) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    const PAGE_SIZE = 5;

    const fetchListings = await getAllOffersByUserId(session, PAGE_SIZE);
    if (!fetchListings) return { props: { sent: [], received: [], session } };


    const {
     listings,
      countSent,
      countReceived,
      countPendingSent,
      countPendingReceived,
    } = fetchListings;

    return {
      props: {
        listings,
        session,
        countSent,
        countReceived,
        countPendingSent,
        countPendingReceived,
        id,
      },
    };
  } catch (error) {
    console.error("Error fetching listings:", error);
    return {
      props: {
        listings: [],
        
      },
    };
  }
};

export default Index;
