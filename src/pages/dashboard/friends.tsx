import React, { useEffect, useReducer, useState } from "react";
import { Meta } from "@/layouts/meta";
import { Dash } from "@/templates/dash";
import { GetServerSideProps } from "next";;
import { getSession } from "next-auth/react";
import FriendsWidget from "@/components/widgets/FriendsWidget";
import { User } from "@prisma/client";
import getCurrentUser from "@/actions/getCurrentUser";
import reducer from "@/reducer/friends";
import { useSocketContext } from "@/context/SocketContext";

interface IndexProps {
  friends: User[];
  session: any;
}

const Index = ({
  friends,
  session,
}: IndexProps) => {
  const [state, dispatch] = useReducer(reducer, {
    friends: []
  })

  const socket = useSocketContext();

  useEffect(() => {
    dispatch({ type: "init", payload: friends });
    
    socket.on('friend', data => {
      const { action, friend } = data;
      // const { id } = friend;
      // console.log("friend", friend);

      if (action === 'accept') {
        const participant = friend.followerId === session?.user.id ? friend.followingId : friend.followerId;
        dispatch({ type: action, payload: participant });
        return;
      } else { 
        dispatch({ type: action, payload: friend });
        return;
      }
    });

    return () => {
      socket.off('friend');
    }
  }, [session?.user.id]);


  return (
    <Dash
      meta={
        <Meta
          title="Friends"
          description="Manage your friends"
        />
      }
    >
      <div>
        <div className="w-full mx-auto px-4 sm:px-8">
          <div className="pt-6">
            <div className="pb-8">
              <h3 >
                Your Friends {}
              </h3>
            </div>
            <FriendsWidget session={session} friendsList={state.friends} dispatch={dispatch}  />
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

    const user = await getCurrentUser(session);

    let friends = user?.friends;
    let blocked = user?.blockedFriends;
    if(!friends) friends = [];
    if(!blocked) blocked = [];

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
