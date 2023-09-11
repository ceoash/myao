"use client";
import Link from "next/link";
import { Meta } from "@/layouts/meta";
import ConnectComponent from "@/components/Connect";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { User } from "@prisma/client";
import getUserByUsername from "@/actions/getUserByUsername";

interface ConnectProps {
  user: User;
  session: any;
}

const Connect = ({ user, session }: ConnectProps) => {
  return (
    <div className="h-screen bg-gray-50">
      <Meta title={`Connect`} description={`Connect with ${user.username}`} />
      <div className="flex flex-col items-center">
      <Link href="/dashboard" className="flex items-center mt-12">
        <img src="/images/cat.png" className="h-[30px]  pr-2" />
        <span className="self-center text-xl font-semibold whitespace-nowrap leading-3">
          MYAO
        </span>
      </Link>
     

      <ConnectComponent user={user} />
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const session = await getSession(context);
    const username = context.params?.username;

    if (typeof username !== "string") {
      throw new Error("Invalid user username");
    }

    const user = await getUserByUsername({ username: username as string });
    return {
      props: {
        user,
        session,
      },
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      props: {
        user: null,
      },
    };
  }
};

export default Connect;
