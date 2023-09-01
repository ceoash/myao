import prisma from "@/libs/prismadb";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { Social } from "@prisma/client";
import { Session } from "next-auth";
import { getServerSession } from "next-auth/next";

export default async function getCurrentUser(session: Session) {
  if (!session?.user?.email) {
    console.log("No session found");
    return null;
  }

  const currentUser = await prisma.user.findUnique({
    where: {
      email: session?.user.email as string,
    },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      role: true,
      verified: true,
      createdAt: true,
      updatedAt: true,
      notifications: {
        orderBy: {
            createdAt: "desc",
        },
        take: 4,
      },
      activity: {
        orderBy: {
            createdAt: "desc",
        },
        take: 4,
        include: {
            userActivity: true,
            listingActivity: true,
        }
      },
      options: true,
      activated: true,
      profile: {
        select: {
          image: true,
          bio: true,
          website: true,
          social: true,
          postcode: true,
        },
      },
      inviter: {
        select: {
          id: true,
          username: true,
          profile: true,
        },
      },
      followers: {
        select: {
          id: true,
          followerId: true,
          followingId: true,
          accepted: true,
          follower: {
            select: {
              id: true,
              username: true,
              createdAt: true,
              profile: {
                select: {
                  image: true,
                },
              },
            },
          },
        },
      },
      followings: {
        select: {
          id: true,
          followerId: true,
          followingId: true,
          accepted: true,
          following: {
            select: {
              id: true,
              username: true,
              createdAt: true,
              profile: {
                select: {
                  image: true,
                },
              },
            },
          },
        },
      },
      blockedBy: {
        select: {
          id: true,
          userBlockedId: true,
        },
      },
      blockedFriends: {
        select: {
          id: true,
          friendBlockedId: true,
        },
      },
    },
  });

  if (!currentUser) {
    return null;
  }

  let friends: {
    id: string;
    username: string | null;
    createdAt: string;
    profile: {
      image: string | null;
    } | null;
    relationshipStatus: string;
    accepted: boolean;
    friendshipId: string;
  }[] = Array.from(new Set([]));

  currentUser.followers.forEach((friendship) => {
    let relationshipStatus = "follower";
    let friend = friendship.follower;

    const friendObj = {
      ...friend,
      createdAt: friend.createdAt.toISOString(),
      relationshipStatus,
      accepted: friendship.accepted,
      friendshipId: friendship.id,
    };
    friends.push(friendObj);
  });

  currentUser.followings.forEach((friendship) => {
    let relationshipStatus = "following";
    let friend = friendship.following;

    const friendObj = {
      ...friend,
      createdAt: friend.createdAt.toISOString(),
      relationshipStatus,
      accepted: friendship.accepted,
      friendshipId: friendship.id,
    };
    friends.push(friendObj);
  });

  return {
    ...currentUser,
    createdAt: currentUser.createdAt.toISOString(),
    updatedAt: currentUser.updatedAt.toISOString(),
    friends: friends,
    followings: currentUser.followings.map((friendship) => ({
      ...friendship.following,
      createdAt: friendship.following.createdAt.toISOString(),
    })),
    notifications: currentUser.notifications.map((notification) => ({
      ...notification,
      createdAt: notification.createdAt.toISOString(),
      updatedAt: notification.updatedAt.toISOString(),
    })),
    activity: currentUser.activity.map((item) => ({
    ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.createdAt.toISOString(),
      userActivity: item.userActivity.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.createdAt.toISOString(),
      })),
        listingActivity: item.listingActivity.map((item) => ({
            ...item,
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.createdAt.toISOString(),
        })),
    })),
    followers: currentUser.followers.map((friendship) => ({
      ...friendship.follower,
      createdAt: friendship.follower.createdAt.toISOString(),
    })),
    inviter: currentUser.inviter
      ? {
          ...currentUser.inviter,
        }
      : null,
  };
}
