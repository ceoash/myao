import React, { useEffect, useRef, useState } from "react";
import { Meta } from "@/layouts/meta";
import { Dash } from "@/templates/dash";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { DashListing } from "@/interfaces/authenticated";

import getOffersByUserId from "@/actions/dashboard/getOffersByUserId";
import Offers from "@/components/offers/Offers";
import { useSocket } from "@/hooks/useSocket";
import { useSocketContext } from "@/context/SocketContext";

interface IndexProps {
  session: any;
  sent: DashListing[];
  received: DashListing[];
  countSent: number;
  countReceived: number;
  countPendingSent: number;
  countPendingReceived: number;
  defaultTab?: string;
}

const Index = ({
  sent,
  received,
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
              sent={sent}
              received={received}
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

    const listings = await getOffersByUserId(session, PAGE_SIZE);

    if (!listings) return { props: { sent: [], received: [], session } };

    const defaultTab = context.query?.received ? 'received' : 'sent';


    const {
      sent,
      received,
      countSent,
      countReceived,
      countPendingSent,
      countPendingReceived,
    } = listings;

    return {
      props: {
        sent,
        received,
        session,
        countSent,
        countReceived,
        countPendingSent,
        countPendingReceived,
        id,
        defaultTab
      },
    };
  } catch (error) {
    console.error("Error fetching listings:", error);
    return {
      props: {
        received: [],
        sent: [],
        
      },
    };
  }
};

export default Index;
