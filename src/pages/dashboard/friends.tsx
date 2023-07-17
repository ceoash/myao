import React, { useEffect, useState } from "react";
import { Meta } from "@/layouts/meta";
import { Dash } from "@/templates/dash";
import { GetServerSideProps } from "next";;
import { getSession } from "next-auth/react";
import FriendsWidget from "@/components/widgets/FriendsWidget";
import getFriendsByUserId from "@/actions/getFriendsByUserId";
import { User } from "@prisma/client";

interface IndexProps {
  friends: User[];
  session: any;
}

const Index = ({
  friends,
  session,
}: IndexProps) => {
    const [friendsList, setFriendsList] = useState<User[]>(friends);
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
            <div>
              <h2 className="text-2xl font-semibold leading-tight">
                Your Friends {}
              </h2>
            </div>
            <FriendsWidget session={session} friendsList={friendsList} setFriendsList={setFriendsList}  />
          </div>
          <div className="flex justify-center h-full">
            <ul className="flex list-none mb-4">
              
            </ul>
          </div>
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

    const friends = await getFriendsByUserId(session.user.id);

    return {
      props: {
        friends: friends,
        session: session,
      },
    };
  } catch (error) {
    console.error("Error fetching listings:", error);
    return {
      props: {
        listings: [],
        currentPage: 1,
        totalPages: 1,
      },
    };
  }
};

export default Index;
