import prisma from "@/libs/prismadb";
import { fr } from "date-fns/locale";

export default async function getFriendsByUserId(userId: string) {
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { followerId: userId },
        { followingId: userId }
      ]
    },
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
              bio: true,
              website: true,
              social: true,
            },
          },
        },
      },
      follower: {
        select: {
          id: true,
          username: true,
          createdAt: true,
          profile: {
            select: {
              image: true,
              bio: true,
              website: true,
              social: true,
            },
          },
        },
      },
    }
  });

  const friends = friendships.map(friendship => {
    let relationshipStatus = '';
    let friend = null;
    let accepted = false
    if (friendship.followerId === userId) {
      relationshipStatus = 'following';
      friend = friendship.following;
      accepted = friendship.accepted
    } else {
      relationshipStatus = 'follower';
      friend = friendship.follower;
      accepted = friendship.accepted
    }
    return {
      ...friend,
      createdAt: friend.createdAt.toISOString(),
      relationshipStatus,
      accepted: friendship.accepted,
      friendshipId: friendship.id
    };
  });

  return friends;
}

