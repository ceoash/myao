import { Meta } from "@/layouts/meta";
import { Dash } from "@/templates/dash";
import { GetServerSideProps } from "next";
import getListingsByUserId from "@/actions/getListingsByUserId";
import getUserById from "@/actions/getUserById";
import Offer from "@/components/offers/Offer";
import UserCard from "@/components/widgets/UserCard";
import Satisfication from "@/components/widgets/Satisfication";
import { BiEnvelope, BiStar } from "react-icons/bi";
import { BsPostcard } from "react-icons/bs";
import Card from "@/components/Card";
import getRequestsByUserId from "@/actions/getRequestsByUserId";
import getCurrentUser from "@/actions/getCurrentUser";
import { getSession } from "next-auth/react";

const profile = ({ user, listings, requests }: any) => {
  const offers = listings?.map((listing: any) => (
    <Offer key={listing.id} {...listing} />
  ));

  return (
    <Dash meta={<Meta title="" description="" />}>
      <div className="my-6 lg:hidden">
        <UserCard
          currentUser={user}
          sales={listings.length}
          offers={listings.length}
          messages={0}
        />
      </div>
      <div className="md:flex gap-6 mb-10 lg:mt-10">
        <div className="w-full lg:w-9/12 h-64">
          <Card title={`Public Offers`} icon={<BsPostcard />}>
            <p>No public offers yet</p>
          </Card>
          <Satisfication />
          <Card title={`Reviews`} icon={<BiStar />}>
            <p>No reviews yet</p>
          </Card>
        </div>
        <div className="lg:flex-1 hidden lg:block">
          <UserCard
            currentUser={user}
            sales={requests.length}
            offers={listings.length}
            messages={0}
          />
          <Card title={`Contact`}>
            <div className="flex gap-2 items-center"><BiEnvelope /><span className="underline">{user.email}</span></div>
          </Card>
          {user.profile?.bio && 
            <Card title={`Bio`} body={user.profile?.bio} sidebar/>
          }
          {user.profile?.socialLinks && 
            <Card title={`Social Links`} body={user.profile?.socialLinks} sidebar/>
          }
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
