"use client";

import Hero from "../components/Hero";
import Intro from "../components/Intro";
import Partners from "../components/Partners";
import About from "../components/About";
import Newsletter from "../components/Newsletter";

import { Meta } from "../layouts/meta";
import { Main } from "../templates/main";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";

const Index = () => {
  return (
    <Main
      meta={
        <Meta
          title="Make You An Offer You Can't Refuse"
          description="This is the Make You An Offer Web App"
        />
      }
    >
      <Hero />
      <Intro />
      <Partners />
      <About />
      <Newsletter />
    </Main>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  const conversationId = context.query?.conversationId ?? null;

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  await prisma?.directMessage.updateMany({
    data: {
      read: true,
    },
  });

  // const safeConversations = await getConversationsByUserId(user?.id, currentUser?.blockedFriends, currentUser?.followers, currentUser?.followings);

  return {
    props: {},
  };
};

export default Index;
