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
    include: {
      following: {
        include: {
          profile: true,
        },
      },
      follower: {
        include: {
          profile: true,
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
      updatedAt: friend.updatedAt.toISOString(),
      relationshipStatus,
      accepted: friendship.accepted,
      friendshipId: friendship.id
    };
  });

  return friends;
}

