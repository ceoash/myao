import getCurrentUser from "@/actions/getCurrentUser";
import getListingsByUserId from "@/actions/getListingsByUserId";
import getRequestsByUserId from "@/actions/getRequestsByUserId";
import Card from "@/components/dashboard/Card";
import Offer from "@/components/offers/Offer";
import UserCard from "@/components/widgets/UserCard";
import { Meta } from "@/layouts/meta";
import { Dash } from "@/templates/dash";
import { fr } from "date-fns/locale";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import React from "react";
import { BiStar } from "react-icons/bi";
import { BsFillStarFill } from "react-icons/bs";

const profile = ({ user, listings, requests }: any) => {
  const friends = [];

  const offerList = listings?.map((listing: any) => (
    <Offer key={listing.id} {...listing} />
  ));
  return (
    <Dash meta={<Meta title="" description="" />}>
      <div className="my-10 px-6">
        <h3>My Profile</h3>
      </div>
      <div className="xl:flex no-wrap gap-6 px-6">
        <div className="w-full xl:w-9/12 mb-4">
          <Card title="Reviews" icon={<BsFillStarFill />}>
            No reviews yet
          </Card>
        </div>
        <div className="w-full xl:w-3/12 ">
          <UserCard
            currentUser={user}
            sales={requests?.length}
            offers={listings?.length}
            friendsCount={friends?.length}
            session={null}
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

    if (!session) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

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
