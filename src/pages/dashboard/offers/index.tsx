import React, { use, useEffect, useState } from "react";
import { Meta } from "@/layouts/meta";
import { Dash } from "@/templates/dash";
import { GetServerSideProps } from "next";
import { Listing, Message, User } from "@prisma/client";
import { getSession } from "next-auth/react";
import { DashListing } from "@/interfaces/authenticated";

import getOffersByUserId from "@/actions/dashboard/getOffersByUserId";
import Offers from "@/components/offers/Offers";

interface ListingType extends Listing {
  buyer: User;
}

interface IndexProps {
  session: any;
  sent: DashListing[];
  received: DashListing[];
}

const Index = ({ sent, received, session }: IndexProps) => {
  return (
    <Dash
      meta={
        <Meta
          title="Make You An Offer You Can't Refuse"
          description="This is the Make You An Offer Web App"
        />
      }
    >
      <div>
        <div className="w-full mx-auto px-4 sm:px-8">
          <div className="pt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold leading-tight mb-2">
                Your Offers {}
              </h2>
            </div>
            <Offers
              sent={sent}
              received={received}
              session={session}
              multipage
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

    const sent = listings.sent;
    const received = listings.received;

    return {
      props: {
        sent,
        received,
        session,
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
