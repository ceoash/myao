import React from "react";
import { Meta } from "@/layouts/meta";
import { Dash } from "@/templates/dash";
import EmptyState from "@/components/EmptyState";
import getListings from "@/actions/getListings";

import { Listing } from "@prisma/client";
import Offer from "@/components/offers/Offer";
import { useSession } from "next-auth/react";

const Index = ({ listings }: any) => {

  const { data: session } = useSession();


  if (listings.length === 0) {
    return (
      <Dash
        meta={
          <Meta
            title="Make You An Offer You Can't Refuse"
            description="This is the Make You An Offer Web App"
          />
        }
      >
        <EmptyState showReset />
      </Dash>
    );
  }

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
          <div className="py-8">
            <div>
              <h2 className="text-2xl font-semibold leading-tight">
                Your Offers
              </h2>
            </div>
            <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4">
              <div className="inline-block min-w-full shadow-md rounded-lg ">
                <table className="min-w-full leading-normal table-auto">
                  <thead>
                    <tr>
                      <th></th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Issued / Expiry
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map((item: Listing) => {
                      if(item.buyerId === session?.user?.id){
                        return <Offer key={item.id} {...item} />;
                      }
                        
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dash>
  );
};

export async function getServerSideProps() {
  try {
    const listings = await getListings();
    return {
      props: {
        listings: listings,
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
}

export default Index;
