'use client';
import Link from 'next/link';
import { Meta } from '@/layouts/meta';
import { Main } from '@/templates/main';
import ConnectComponent from '@/components/Connect';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import getUserByUsernameById from '@/actions/getUserByUsername';
import { User } from '@prisma/client';
import getUserById from '@/actions/getUserById';

interface ConnectProps {
    user: User;
    session: any;
}

const Connect = ({user, session}: ConnectProps) => {

  return (
    <Main
      meta={
        <Meta
          title="Make You An Offer You Can't Refuse"
          description="This is the Make You An Offer Web App"
        />
      }
    >
        <ConnectComponent user={user} />
    </Main>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    try {
      const session = await getSession(context);
      const id = context.params?.id;
  
      if (typeof id !== "string") {
        throw new Error("Invalid user ID");
      }
      
      const user = await getUserById({ id: id as string });
      return {
        props: {
          user,
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
          isFriend: false,
        },
      };
    }
  };

  export default Connect;
