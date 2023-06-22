import getCurrentUser from "@/actions/getCurrentUser";
import getListingsByUserId from "@/actions/getListingsByUserId";
import getRequestsByUserId from "@/actions/getRequestsByUserId";
import Offer from "@/components/offers/Offer";
import UserCard from "@/components/widgets/UserCard";
import { Meta } from "@/layouts/meta";
import { Dash } from "@/templates/dash";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import React from "react";
import { BiStar } from "react-icons/bi";

const profile = ({ user, listings, requests }: any) => {
  
 const offerList = listings?.map((listing: any) => (
    <Offer key={listing.id} {...listing} />
  ))
  return (
    <Dash meta={<Meta title="" description="" />}>
      <div className="my-10 px-4">
        <h3>My Profile</h3>
      </div>
      <div className="xl:flex no-wrap gap-6">
        <div className="w-full xl:w-9/12 mb-4">
          <div className="bg-white p-3 border border-gray-200 rounded-sm">
            <div className="">
              <div>
                <div className="flex items-center space-x-2 font-semibold text-gray-900 leading-8 mb-3 border-b border-gray-200 pb-2">
                  <span className="text-orange-default">
                    <BiStar />
                  </span>
                  <span className="tracking-wide">Reviews</span>
                </div>
                No reviews yet
                
              </div>
            </div>
          </div>
        </div>
        <div className="w-full xl:w-3/12 ">
          <UserCard
            currentUser={user}
            sales={requests?.length}
            offers={listings?.length}
            messages={0}
            dashboard={true}
            profile={true}
          />
        </div>
      </div>
    </Dash>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const session = await getSession(context);

    const user = await getCurrentUser(session);
    const listings = await getListingsByUserId(session?.user.id);
    const requests = await getRequestsByUserId(session?.user.id);

    return {
      props: {
        user,
        listings,
        requests,

      },
    };
  } catch (error) {
    console.error("Error fetching user/listing:", error);
    return {
      props: {
        user: null,
        listings: null,
        requests: null,
      },
    };
  }
};

export default profile;
