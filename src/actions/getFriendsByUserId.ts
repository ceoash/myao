import prisma from "@/libs/prismadb";
import { profile } from "console";

export default async function getFriendsByUserId(userId: string) {
  const friendships = await prisma.friendship.findMany({
    where: {
      userAddsId: userId
    },
    include: {
      friendAdds: {
        include: {
          profile: true, // include profile in friendAdds
        },
      },
    }
  });

  const friends = friendships.map(friendship => ({
    ...friendship.friendAdds,
    createdAt: friendship.friendAdds.createdAt.toISOString(),
    updatedAt: friendship.friendAdds.updatedAt.toISOString()
  }));

  return friends;
}
