import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";

import getCurrentUser from "@/actions/getCurrentUser";
import listingsCount from "@/actions/listingsCount";
import Card from "@/components/dashboard/Card";
import UserCard from "@/components/widgets/UserCard";

import { Dash } from "@/templates/dash";
import { Meta } from "@/layouts/meta";
import { User } from "@prisma/client";
import { Session } from "next-auth";

import { BsFillStarFill } from "react-icons/bs";

interface myProfileProps {
  user: User;
  sent: number;
  received: number;
  session: Session;
}

const profile = ({ user, session, sent, received }: myProfileProps) => {
  
  const friends = [];

  return (
    <Dash meta={<Meta title="My Profile" description="View and update your profile" />}>
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
            sales={sent}
            offers={received}
            friendsCount={friends?.length}
            session={session}
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
    const count = await listingsCount(session?.user.id);

    return {
      props: {
        user,
        sent: count?.sentListingsCount,
        received: count?.receivedListingsCount,
        session,
      },
    };
  } catch (error) {
    console.error("Error fetching user/listing:", error);
    return {
      props: {
        user: null,
        listings: null,
        requests: null,
        session: null,

      },
    };
  }
};

export default profile;
